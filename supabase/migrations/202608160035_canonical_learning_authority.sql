-- Governed Learning + Reward Authority

create or replace function private.record_learning_reward(
  learner_id uuid,
  reward_event text,
  reward_source text,
  reward_coins integer,
  reward_xp integer,
  reward_reason text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext(learner_id::text || ':' || reward_event || ':' || reward_source));
  if exists (
    select 1 from public.coin_ledger l
    where l.scholar_id = learner_id and l.event_type = reward_event and l.source_id = reward_source
  ) then
    return false;
  end if;

  insert into public.coin_ledger (scholar_id,event_type,source_id,coins,xp,reason)
  values (learner_id,reward_event,reward_source,reward_coins,reward_xp,reward_reason);

  insert into public.reward_events (scholar_id,event_type,source_id,payload,processed)
  values (learner_id,reward_event,reward_source,jsonb_build_object('coins',reward_coins,'xp',reward_xp,'reason',reward_reason),true);

  update public.profiles
  set coin_balance = coalesce(coin_balance,0) + reward_coins,
      xp = coalesce(xp,0) + reward_xp,
      updated_at = now()
  where id = learner_id;

  return true;
end;
$$;

create or replace function public.complete_learning_module(
  requested_course_slug text,
  requested_module_key text,
  reflection_text text default null
)
returns table (
  module_completed boolean,
  course_completed boolean,
  coins_awarded integer,
  xp_awarded integer,
  credential_id uuid,
  badge_id uuid
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  learner_id uuid := auth.uid();
  course_row public.learning_courses%rowtype;
  module_row public.learning_modules%rowtype;
  inserted_rows integer := 0;
  module_inserted boolean := false;
  course_now_complete boolean := false;
  module_rewarded boolean := false;
  course_rewarded boolean := false;
  credential uuid;
  badge uuid;
  total_required integer;
  total_done integer;
begin
  if learner_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;

  select * into course_row from public.learning_courses c
  where c.slug = requested_course_slug and c.status = 'published';
  if not found then raise exception 'Published course not found.' using errcode='P0002'; end if;

  select * into module_row from public.learning_modules m
  where m.course_slug = requested_course_slug and m.module_key = requested_module_key and m.required = true;
  if not found then raise exception 'Required module not found.' using errcode='P0002'; end if;

  if module_row.completion_mode = 'reflection' and length(trim(coalesce(reflection_text,''))) < 20 then
    raise exception 'A meaningful reflection of at least 20 characters is required.' using errcode='22023';
  end if;

  insert into public.learning_module_progress (user_id,course_slug,module_key,reflection)
  values (learner_id,requested_course_slug,requested_module_key,nullif(trim(coalesce(reflection_text,'')),''))
  on conflict (user_id,course_slug,module_key) do nothing;
  get diagnostics inserted_rows = row_count;
  module_inserted := inserted_rows > 0;

  if module_inserted then
    module_rewarded := private.record_learning_reward(
      learner_id,'module.completed',requested_course_slug || ':' || requested_module_key,
      course_row.coins_per_module,course_row.xp_per_module,'Completed ' || module_row.title
    );
  end if;

  select count(*) into total_required from public.learning_modules m where m.course_slug=requested_course_slug and m.required=true;
  select count(*) into total_done from public.learning_module_progress p where p.user_id=learner_id and p.course_slug=requested_course_slug;
  course_now_complete := total_required > 0 and total_done >= total_required;

  if course_now_complete then
    insert into public.learning_credentials (user_id,course_slug,credential_name,evidence)
    values (learner_id,requested_course_slug,course_row.certificate_name,jsonb_build_object('completed_modules',total_done,'required_modules',total_required))
    on conflict (user_id,course_slug) do update set evidence=excluded.evidence
    returning id into credential;

    insert into public.achievement_badges (user_id,badge_key,badge_name,description,source_type,source_id)
    values (learner_id,'course-complete',course_row.title || ' Graduate','Completed all required modules in ' || course_row.title || '.','course',requested_course_slug)
    on conflict (user_id,badge_key,source_id) do update set description=excluded.description
    returning id into badge;

    course_rewarded := private.record_learning_reward(
      learner_id,'course.completed',requested_course_slug,
      course_row.course_coin_bonus,course_row.course_xp_bonus,'Completed ' || course_row.title
    );
  end if;

  return query select module_inserted,course_now_complete,
    (case when module_rewarded then course_row.coins_per_module else 0 end) + (case when course_rewarded then course_row.course_coin_bonus else 0 end),
    (case when module_rewarded then course_row.xp_per_module else 0 end) + (case when course_rewarded then course_row.course_xp_bonus else 0 end),
    credential,badge;
end;
$$;

create or replace function public.redeem_reward_store_item(requested_item_id text)
returns table (redemption_id uuid, remaining_coins integer, redemption_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  learner_id uuid := auth.uid();
  item public.reward_store_items%rowtype;
  current_coins integer;
  redemption uuid := gen_random_uuid();
begin
  if learner_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  select * into item from public.reward_store_items i where i.id=requested_item_id and i.status='active' for update;
  if not found then raise exception 'Reward item is unavailable.' using errcode='P0002'; end if;
  if item.inventory is not null and item.inventory <= 0 then raise exception 'Reward item is out of stock.' using errcode='P0001'; end if;

  perform pg_advisory_xact_lock(hashtext('reward-store:' || learner_id::text));
  select coalesce(sum(l.coins),0) into current_coins from public.coin_ledger l where l.scholar_id=learner_id;
  if current_coins < item.coin_cost then raise exception 'Insufficient Playbook Coins.' using errcode='P0001'; end if;

  insert into public.reward_store_redemptions (id,user_id,item_id,coin_cost,status)
  values (redemption,learner_id,item.id,item.coin_cost,'pending');
  insert into public.coin_ledger (scholar_id,event_type,source_id,coins,xp,reason)
  values (learner_id,'store.redemption',redemption::text,-item.coin_cost,25,'Redeemed ' || item.name);
  insert into public.reward_events (scholar_id,event_type,source_id,payload,processed)
  values (learner_id,'store.redemption',redemption::text,jsonb_build_object('item_id',item.id,'coins',-item.coin_cost,'xp',25),true);
  update public.profiles set coin_balance=coalesce(coin_balance,0)-item.coin_cost,xp=coalesce(xp,0)+25,updated_at=now() where id=learner_id;
  if item.inventory is not null then update public.reward_store_items set inventory=inventory-1,updated_at=now() where id=item.id; end if;

  return query select redemption,current_coins-item.coin_cost,'pending'::text;
end;
$$;

revoke all on function private.record_learning_reward(uuid,text,text,integer,integer,text) from public,anon,authenticated;
revoke all on function public.complete_learning_module(text,text,text) from public,anon,authenticated;
revoke all on function public.redeem_reward_store_item(text) from public,anon,authenticated;
grant execute on function public.complete_learning_module(text,text,text) to authenticated;
grant execute on function public.redeem_reward_store_item(text) to authenticated;
