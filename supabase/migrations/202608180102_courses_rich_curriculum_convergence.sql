-- Phase 8 rich curriculum convergence.
-- Preserve the strongest existing Leadership/Civic curriculum while moving its
-- persistence, assessment, completion, credential, badge, and reward authority
-- onto canonical Learning.

alter table public.learning_modules
  add column if not exists learning_objectives jsonb not null default '[]'::jsonb,
  add column if not exists activity jsonb,
  add column if not exists knowledge_checkpoint jsonb,
  add column if not exists interactions jsonb not null default '[]'::jsonb;

create table if not exists private.learning_module_checkpoint_answers (
  course_slug text not null,
  module_key text not null,
  correct_index integer not null check (correct_index >= 0),
  explanation text,
  primary key (course_slug,module_key),
  foreign key (course_slug,module_key)
    references public.learning_modules(course_slug,module_key)
    on delete cascade
);
revoke all on table private.learning_module_checkpoint_answers from public,anon,authenticated;

create table if not exists public.learning_module_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_slug text not null,
  module_key text not null,
  activity_response jsonb,
  interaction_responses jsonb not null default '{}'::jsonb,
  checkpoint_selected_index integer,
  checkpoint_passed boolean,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,course_slug,module_key),
  foreign key (course_slug,module_key)
    references public.learning_modules(course_slug,module_key)
    on delete cascade
);
alter table public.learning_module_responses enable row level security;
revoke all on table public.learning_module_responses from public,anon,authenticated;
grant select on table public.learning_module_responses to authenticated;
drop policy if exists "Users view own learning module responses" on public.learning_module_responses;
create policy "Users view own learning module responses"
on public.learning_module_responses for select to authenticated
using (user_id=(select auth.uid()));

-- Promote the complete 15-week Leadership experience into canonical Learning.
insert into public.learning_courses(
  slug,title,description,pillar,image_url,status,xp_per_module,coins_per_module,
  course_xp_bonus,course_coin_bonus,certificate_name,sort_order
)
select
  c.slug,c.title,c.description,coalesce(nullif(c.pillar,''),'Leadership'),
  coalesce(c.image_url,c.cover_url),'published',
  greatest(coalesce(c.xp_reward,750)/greatest(coalesce(c.lesson_count,15),1),0),
  greatest(coalesce(c.coin_reward,300)/greatest(coalesce(c.lesson_count,15),1),0),
  greatest(coalesce(c.xp_reward,750),0),greatest(coalesce(c.coin_reward,300),0),
  c.title || ' Certificate',15
from public.courses c
where c.slug='15-week-leadership-program'
on conflict(slug) do update set
  title=excluded.title,description=excluded.description,pillar=excluded.pillar,
  image_url=excluded.image_url,status='published',xp_per_module=excluded.xp_per_module,
  coins_per_module=excluded.coins_per_module,course_xp_bonus=excluded.course_xp_bonus,
  course_coin_bonus=excluded.course_coin_bonus,certificate_name=excluded.certificate_name,
  sort_order=excluded.sort_order,updated_at=now();

-- The fully-authored Civic course is also converged; it no longer remains a
-- coming-soon shell once all ten rich modules are present.
insert into public.learning_courses(
  slug,title,description,pillar,image_url,status,xp_per_module,coins_per_module,
  course_xp_bonus,course_coin_bonus,certificate_name,sort_order
)
select
  c.slug,c.title,c.description,coalesce(nullif(c.pillar,''),'Civic'),
  coalesce(c.image_url,c.cover_url),'published',
  greatest(coalesce(c.xp_reward,500)/greatest(coalesce(c.lesson_count,10),1),0),
  greatest(coalesce(c.coin_reward,200)/greatest(coalesce(c.lesson_count,10),1),0),
  greatest(coalesce(c.xp_reward,500),0),greatest(coalesce(c.coin_reward,200),0),
  'Civic Engagement for Young Leaders Certificate',70
from public.courses c
where c.slug='civic-engagement-for-young-leaders'
on conflict(slug) do update set
  title=excluded.title,description=excluded.description,pillar=excluded.pillar,
  image_url=excluded.image_url,status='published',xp_per_module=excluded.xp_per_module,
  coins_per_module=excluded.coins_per_module,course_xp_bonus=excluded.course_xp_bonus,
  course_coin_bonus=excluded.course_coin_bonus,certificate_name=excluded.certificate_name,
  sort_order=excluded.sort_order,updated_at=now();

insert into public.learning_modules(
  course_slug,module_key,position,title,duration_minutes,module_type,summary,content,
  completion_mode,required,learning_objectives,activity,knowledge_checkpoint,interactions
)
select
  m.course_slug,
  'module-' || lpad(m.module_order::text,2,'0'),
  m.module_order,m.title,greatest(coalesce(m.duration_mins,15),1),
  coalesce(nullif(m.module_type,''),'lesson'),
  left(regexp_replace(coalesce(m.content,m.title),'\s+',' ','g'),240),
  coalesce(m.content,m.title),'reflection',true,
  coalesce(m.learning_objectives,'[]'::jsonb),m.activity,
  case when m.knowledge_checkpoint is null then null
       else m.knowledge_checkpoint - 'correct_index' end,
  coalesce(m.interactions,'[]'::jsonb)
from public.course_modules m
where m.course_slug in ('15-week-leadership-program','civic-engagement-for-young-leaders')
on conflict(course_slug,module_key) do update set
  position=excluded.position,title=excluded.title,duration_minutes=excluded.duration_minutes,
  module_type=excluded.module_type,summary=excluded.summary,content=excluded.content,
  completion_mode=excluded.completion_mode,required=true,
  learning_objectives=excluded.learning_objectives,activity=excluded.activity,
  knowledge_checkpoint=excluded.knowledge_checkpoint,interactions=excluded.interactions,
  updated_at=now();

insert into private.learning_module_checkpoint_answers(course_slug,module_key,correct_index,explanation)
select
  m.course_slug,'module-' || lpad(m.module_order::text,2,'0'),
  (m.knowledge_checkpoint->>'correct_index')::integer,
  nullif(m.knowledge_checkpoint->>'explanation','')
from public.course_modules m
where m.course_slug in ('15-week-leadership-program','civic-engagement-for-young-leaders')
  and m.knowledge_checkpoint ? 'correct_index'
on conflict(course_slug,module_key) do update set
  correct_index=excluded.correct_index,explanation=excluded.explanation;

create or replace function private.submit_learning_module_work(
  requested_course_slug text,
  requested_module_key text,
  activity_payload jsonb default null,
  interaction_payload jsonb default '{}'::jsonb,
  checkpoint_index integer default null
)
returns table(checkpoint_required boolean,checkpoint_passed boolean,checkpoint_explanation text)
language plpgsql
security definer
set search_path=''
as $$
declare
  learner_id uuid:=auth.uid();
  module_row public.learning_modules%rowtype;
  answer_row private.learning_module_checkpoint_answers%rowtype;
  needs_checkpoint boolean:=false;
  passed boolean:=null;
begin
  if learner_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if not private.current_user_is_onboarded_learner() then
    raise exception 'Learning work is restricted to onboarded learner accounts.' using errcode='42501';
  end if;

  select m.* into module_row
  from public.learning_modules m
  join public.learning_courses c on c.slug=m.course_slug
  where m.course_slug=requested_course_slug and m.module_key=requested_module_key
    and m.required=true and c.status='published';
  if not found then raise exception 'Published required module not found.' using errcode='P0002'; end if;

  select * into answer_row from private.learning_module_checkpoint_answers a
  where a.course_slug=requested_course_slug and a.module_key=requested_module_key;
  needs_checkpoint:=found;
  if needs_checkpoint then
    if checkpoint_index is null then raise exception 'Knowledge checkpoint response is required.' using errcode='22023'; end if;
    passed:=checkpoint_index=answer_row.correct_index;
  end if;

  insert into public.learning_module_responses(
    user_id,course_slug,module_key,activity_response,interaction_responses,
    checkpoint_selected_index,checkpoint_passed,updated_at
  ) values(
    learner_id,requested_course_slug,requested_module_key,activity_payload,
    coalesce(interaction_payload,'{}'::jsonb),checkpoint_index,passed,now()
  )
  on conflict(user_id,course_slug,module_key) do update set
    activity_response=excluded.activity_response,
    interaction_responses=excluded.interaction_responses,
    checkpoint_selected_index=excluded.checkpoint_selected_index,
    checkpoint_passed=excluded.checkpoint_passed,
    updated_at=now();

  return query select needs_checkpoint,passed,
    case when needs_checkpoint and passed then answer_row.explanation else null end;
end;
$$;
revoke all on function private.submit_learning_module_work(text,text,jsonb,jsonb,integer) from public,anon,authenticated;
grant execute on function private.submit_learning_module_work(text,text,jsonb,jsonb,integer) to authenticated;

create or replace function public.submit_learning_module_work(
  requested_course_slug text,
  requested_module_key text,
  activity_payload jsonb default null,
  interaction_payload jsonb default '{}'::jsonb,
  checkpoint_index integer default null
)
returns table(checkpoint_required boolean,checkpoint_passed boolean,checkpoint_explanation text)
language sql
security invoker
set search_path=''
as $$
  select * from private.submit_learning_module_work(
    requested_course_slug,requested_module_key,activity_payload,interaction_payload,checkpoint_index
  );
$$;
revoke all on function public.submit_learning_module_work(text,text,jsonb,jsonb,integer) from public,anon,authenticated;
grant execute on function public.submit_learning_module_work(text,text,jsonb,jsonb,integer) to authenticated;

-- Completion remains the one reward/credential authority, now with an additional
-- server-side checkpoint gate for rich modules.
create or replace function private.complete_learning_module(
  requested_course_slug text,
  requested_module_key text,
  reflection_text text default null
)
returns table(module_completed boolean,course_completed boolean,coins_awarded integer,xp_awarded integer,credential_id uuid,badge_id uuid)
language plpgsql
security definer
set search_path=''
as $$
declare
  learner_id uuid:=auth.uid();
  course_row public.learning_courses%rowtype;
  module_row public.learning_modules%rowtype;
  inserted_rows integer:=0; module_inserted boolean:=false; course_now_complete boolean:=false;
  module_rewarded boolean:=false; course_rewarded boolean:=false; credential uuid; badge uuid;
  total_required integer; total_done integer;
begin
  if learner_id is null then raise exception 'Authentication required.' using errcode='42501'; end if;
  if not private.current_user_is_onboarded_learner() then raise exception 'Learning completion is restricted to onboarded learner accounts.' using errcode='42501'; end if;
  select * into course_row from public.learning_courses c where c.slug=requested_course_slug and c.status='published';
  if not found then raise exception 'Published course not found.' using errcode='P0002'; end if;
  select * into module_row from public.learning_modules m where m.course_slug=requested_course_slug and m.module_key=requested_module_key and m.required=true;
  if not found then raise exception 'Required module not found.' using errcode='P0002'; end if;
  if module_row.completion_mode='reflection' and length(trim(coalesce(reflection_text,'')))<20 then
    raise exception 'A meaningful reflection of at least 20 characters is required.' using errcode='22023';
  end if;
  if exists(select 1 from private.learning_module_checkpoint_answers a where a.course_slug=requested_course_slug and a.module_key=requested_module_key)
     and not exists(select 1 from public.learning_module_responses r where r.user_id=learner_id and r.course_slug=requested_course_slug and r.module_key=requested_module_key and r.checkpoint_passed=true) then
    raise exception 'Pass the knowledge checkpoint before completing this module.' using errcode='22023';
  end if;

  insert into public.learning_module_progress(user_id,course_slug,module_key,reflection)
  values(learner_id,requested_course_slug,requested_module_key,nullif(trim(coalesce(reflection_text,'')),''))
  on conflict(user_id,course_slug,module_key) do nothing;
  get diagnostics inserted_rows=row_count; module_inserted:=inserted_rows>0;
  if module_inserted then module_rewarded:=private.record_learning_reward(learner_id,'module.completed',requested_course_slug||':'||requested_module_key,course_row.coins_per_module,course_row.xp_per_module,'Completed '||module_row.title); end if;
  select count(*) into total_required from public.learning_modules m where m.course_slug=requested_course_slug and m.required=true;
  select count(*) into total_done from public.learning_module_progress p join public.learning_modules m on m.course_slug=p.course_slug and m.module_key=p.module_key and m.required=true where p.user_id=learner_id and p.course_slug=requested_course_slug;
  course_now_complete:=total_required>0 and total_done>=total_required;
  if course_now_complete then
    insert into public.learning_credentials(user_id,course_slug,credential_name,evidence)
    values(learner_id,requested_course_slug,course_row.certificate_name,jsonb_build_object('completed_modules',total_done,'required_modules',total_required))
    on conflict(user_id,course_slug) do update set evidence=excluded.evidence returning id into credential;
    insert into public.achievement_badges(user_id,badge_key,badge_name,description,source_type,source_id)
    values(learner_id,'course-complete',course_row.title||' Graduate','Completed all required modules in '||course_row.title||'.','course',requested_course_slug)
    on conflict(user_id,badge_key,source_id) do update set description=excluded.description returning id into badge;
    course_rewarded:=private.record_learning_reward(learner_id,'course.completed',requested_course_slug,course_row.course_coin_bonus,course_row.course_xp_bonus,'Completed '||course_row.title);
  end if;
  return query select module_inserted,course_now_complete,
    (case when module_rewarded then course_row.coins_per_module else 0 end)+(case when course_rewarded then course_row.course_coin_bonus else 0 end),
    (case when module_rewarded then course_row.xp_per_module else 0 end)+(case when course_rewarded then course_row.course_xp_bonus else 0 end),credential,badge;
end;
$$;
revoke all on function private.complete_learning_module(text,text,text) from public,anon,authenticated;
grant execute on function private.complete_learning_module(text,text,text) to authenticated;
