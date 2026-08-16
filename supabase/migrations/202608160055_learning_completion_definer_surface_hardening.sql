-- Move canonical Learning completion authority out of the exposed public SECURITY DEFINER surface.
-- The public RPC signature remains stable as a SECURITY INVOKER wrapper. The private helper retains
-- learner-role gating, published/required-module validation, reflection requirements, idempotent
-- progress, credential/badge issuance, and reward-ledger authority.

create or replace function private.complete_learning_module(
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
  if learner_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if not private.current_user_is_onboarded_learner() then
    raise exception 'Learning completion is restricted to onboarded learner accounts.' using errcode='42501';
  end if;

  select * into course_row
  from public.learning_courses c
  where c.slug=requested_course_slug
    and c.status='published';
  if not found then
    raise exception 'Published course not found.' using errcode='P0002';
  end if;

  select * into module_row
  from public.learning_modules m
  where m.course_slug=requested_course_slug
    and m.module_key=requested_module_key
    and m.required=true;
  if not found then
    raise exception 'Required module not found.' using errcode='P0002';
  end if;

  if module_row.completion_mode='reflection' and length(trim(coalesce(reflection_text,''))) < 20 then
    raise exception 'A meaningful reflection of at least 20 characters is required.' using errcode='22023';
  end if;

  insert into public.learning_module_progress(user_id,course_slug,module_key,reflection)
  values(learner_id,requested_course_slug,requested_module_key,nullif(trim(coalesce(reflection_text,'')),''))
  on conflict(user_id,course_slug,module_key) do nothing;
  get diagnostics inserted_rows = row_count;
  module_inserted := inserted_rows > 0;

  if module_inserted then
    module_rewarded := private.record_learning_reward(
      learner_id,'module.completed',requested_course_slug || ':' || requested_module_key,
      course_row.coins_per_module,course_row.xp_per_module,'Completed ' || module_row.title
    );
  end if;

  select count(*) into total_required
  from public.learning_modules m
  where m.course_slug=requested_course_slug and m.required=true;

  select count(*) into total_done
  from public.learning_module_progress p
  where p.user_id=learner_id and p.course_slug=requested_course_slug;

  course_now_complete := total_required > 0 and total_done >= total_required;

  if course_now_complete then
    insert into public.learning_credentials(user_id,course_slug,credential_name,evidence)
    values(
      learner_id,requested_course_slug,course_row.certificate_name,
      jsonb_build_object('completed_modules',total_done,'required_modules',total_required)
    )
    on conflict(user_id,course_slug) do update set evidence=excluded.evidence
    returning id into credential;

    insert into public.achievement_badges(user_id,badge_key,badge_name,description,source_type,source_id)
    values(
      learner_id,'course-complete',course_row.title || ' Graduate',
      'Completed all required modules in ' || course_row.title || '.',
      'course',requested_course_slug
    )
    on conflict(user_id,badge_key,source_id) do update set description=excluded.description
    returning id into badge;

    course_rewarded := private.record_learning_reward(
      learner_id,'course.completed',requested_course_slug,
      course_row.course_coin_bonus,course_row.course_xp_bonus,'Completed ' || course_row.title
    );
  end if;

  return query select
    module_inserted,
    course_now_complete,
    (case when module_rewarded then course_row.coins_per_module else 0 end)
      + (case when course_rewarded then course_row.course_coin_bonus else 0 end),
    (case when module_rewarded then course_row.xp_per_module else 0 end)
      + (case when course_rewarded then course_row.course_xp_bonus else 0 end),
    credential,
    badge;
end;
$$;

revoke all on function private.complete_learning_module(text,text,text) from public,anon,authenticated;
grant execute on function private.complete_learning_module(text,text,text) to authenticated;

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
language sql
security invoker
set search_path = ''
as $$
  select * from private.complete_learning_module(requested_course_slug,requested_module_key,reflection_text);
$$;

revoke all on function public.complete_learning_module(text,text,text) from public,anon,authenticated;
grant execute on function public.complete_learning_module(text,text,text) to authenticated;

comment on function public.complete_learning_module(text,text,text) is
  'Authenticated invoker wrapper for canonical Learning completion; privileged progress, credential, badge, and reward authority remains private and learner-scoped.';
