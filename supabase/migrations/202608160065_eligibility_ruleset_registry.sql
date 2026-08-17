create table if not exists public.athlete_eligibility_rule_sources (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,
  governing_body text not null check (governing_body in ('NCAA','NAIA','NJCAA','INSTITUTION','OTHER')),
  title text not null,
  source_url text not null,
  source_status text not null default 'active' check (source_status in ('active','proposed','superseded','reference')),
  authoritative boolean not null default true,
  published_at date,
  retrieved_at date not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.athlete_eligibility_rulesets (
  id uuid primary key default gen_random_uuid(),
  ruleset_key text not null unique,
  source_id uuid not null references public.athlete_eligibility_rule_sources(id) on delete restrict,
  governing_body text not null check (governing_body in ('NCAA','NAIA','NJCAA','INSTITUTION','OTHER')),
  pathway text not null,
  scope text not null default 'initial_eligibility' check (scope in ('initial_eligibility','continuing_eligibility','transfer_eligibility','period_of_eligibility','other')),
  population text not null default 'prospective_student_athlete',
  academic_year_start integer,
  academic_year_end integer,
  effective_from date,
  effective_to date,
  status text not null default 'active' check (status in ('active','proposed','superseded','reference')),
  certification_authority text not null,
  authority_note text not null,
  requirements_json jsonb not null default '{}'::jsonb,
  provenance jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint athlete_eligibility_ruleset_year_order check (
    academic_year_start is null or academic_year_end is null or academic_year_end >= academic_year_start
  ),
  constraint athlete_eligibility_ruleset_effective_order check (
    effective_from is null or effective_to is null or effective_to >= effective_from
  )
);

create index if not exists athlete_eligibility_rulesets_lookup_idx
  on public.athlete_eligibility_rulesets (governing_body, pathway, scope, status);
create index if not exists athlete_eligibility_rulesets_source_idx
  on public.athlete_eligibility_rulesets (source_id);

alter table public.athlete_eligibility_rule_sources enable row level security;
alter table public.athlete_eligibility_rulesets enable row level security;

revoke all on public.athlete_eligibility_rule_sources from anon, authenticated;
revoke all on public.athlete_eligibility_rulesets from anon, authenticated;
grant select on public.athlete_eligibility_rule_sources to authenticated;
grant select on public.athlete_eligibility_rulesets to authenticated;

drop policy if exists athlete_eligibility_rule_sources_authenticated_read on public.athlete_eligibility_rule_sources;
create policy athlete_eligibility_rule_sources_authenticated_read
  on public.athlete_eligibility_rule_sources
  for select
  to authenticated
  using (true);

drop policy if exists athlete_eligibility_rulesets_authenticated_read on public.athlete_eligibility_rulesets;
create policy athlete_eligibility_rulesets_authenticated_read
  on public.athlete_eligibility_rulesets
  for select
  to authenticated
  using (true);

insert into public.athlete_eligibility_rule_sources (
  source_key, governing_body, title, source_url, source_status, authoritative, retrieved_at, metadata
) values
  (
    'ncaa-di-initial-eligibility-2026-08',
    'NCAA',
    'NCAA Division I Initial Eligibility Requirements',
    'https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-i/',
    'active', true, date '2026-08-16',
    jsonb_build_object('source_owner','NCAA Eligibility Center','source_scope','initial eligibility')
  ),
  (
    'ncaa-dii-initial-eligibility-2026-08',
    'NCAA',
    'NCAA Division II Initial Eligibility Requirements',
    'https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-ii/',
    'active', true, date '2026-08-16',
    jsonb_build_object('source_owner','NCAA Eligibility Center','source_scope','initial eligibility')
  ),
  (
    'ncaa-diii-initial-eligibility-2026-08',
    'NCAA',
    'NCAA Division III Initial Eligibility Requirements',
    'https://www.ncaa.org/eligibility-center/initial-eligibility-requirements/division-iii/',
    'active', true, date '2026-08-16',
    jsonb_build_object('source_owner','NCAA Eligibility Center','source_scope','initial eligibility')
  ),
  (
    'naia-freshman-eligibility-2026-08',
    'NAIA',
    'NAIA Basics of Freshman Eligibility',
    'https://interpretations.naia.org/basics-of-freshman-eligibility/',
    'active', true, date '2026-08-16',
    jsonb_build_object('source_owner','NAIA','source_scope','entering freshman eligibility')
  )
on conflict (source_key) do nothing;

insert into public.athlete_eligibility_rulesets (
  ruleset_key, source_id, governing_body, pathway, scope, population,
  academic_year_start, academic_year_end, status, certification_authority,
  authority_note, requirements_json, provenance
)
select
  'ncaa-di-initial-2026-27', s.id, 'NCAA', 'division_i', 'initial_eligibility', 'prospective_student_athlete',
  2026, 2027, 'active', 'NCAA Eligibility Center',
  'Playbook may track readiness against these published requirements. Only the NCAA Eligibility Center and applicable NCAA institution can issue or confirm eligibility certification.',
  jsonb_build_object(
    'logic','ALL',
    'requirements', jsonb_build_array(
      jsonb_build_object('key','eligibility_center_account','type','boolean','expected',true,'label','Academic and Athletics Certification account'),
      jsonb_build_object('key','approved_core_courses','type','number','operator','gte','value',16,'unit','courses','label','NCAA-approved core courses'),
      jsonb_build_object('key','core_course_gpa','type','number','operator','gte','value',2.3,'unit','gpa','label','Minimum NCAA core-course GPA'),
      jsonb_build_object('key','ten_before_seventh_semester','type','number','operator','gte','value',10,'unit','courses','label','Core courses completed before seventh semester'),
      jsonb_build_object('key','seven_english_math_science_within_ten','type','number','operator','gte','value',7,'unit','courses','label','English, math or science courses within the 10-course progression requirement'),
      jsonb_build_object('key','final_transcript_and_graduation','type','boolean','expected',true,'label','Final official transcript with proof of graduation submitted'),
      jsonb_build_object('key','academic_and_athletics_certification','type','authority_status','expected','certified','label','Academic and athletics certification completed by NCAA Eligibility Center')
    )
  ),
  jsonb_build_object('retrieved_at','2026-08-16','implementation_scope','advisory readiness tracking only')
from public.athlete_eligibility_rule_sources s
where s.source_key = 'ncaa-di-initial-eligibility-2026-08'
on conflict (ruleset_key) do nothing;

insert into public.athlete_eligibility_rulesets (
  ruleset_key, source_id, governing_body, pathway, scope, population,
  academic_year_start, academic_year_end, status, certification_authority,
  authority_note, requirements_json, provenance
)
select
  'ncaa-dii-initial-2026-27', s.id, 'NCAA', 'division_ii', 'initial_eligibility', 'prospective_student_athlete',
  2026, 2027, 'active', 'NCAA Eligibility Center',
  'Playbook may track readiness against these published requirements. Only the NCAA Eligibility Center and applicable NCAA institution can issue or confirm eligibility certification.',
  jsonb_build_object(
    'logic','ALL',
    'requirements', jsonb_build_array(
      jsonb_build_object('key','eligibility_center_account','type','boolean','expected',true,'label','Academic and Athletics Certification account'),
      jsonb_build_object('key','approved_core_courses','type','number','operator','gte','value',16,'unit','courses','label','NCAA-approved core courses'),
      jsonb_build_object('key','core_course_gpa','type','number','operator','gte','value',2.2,'unit','gpa','label','Minimum NCAA core-course GPA'),
      jsonb_build_object('key','final_transcript_and_graduation','type','boolean','expected',true,'label','Final official transcript with proof of graduation submitted'),
      jsonb_build_object('key','academic_and_athletics_certification','type','authority_status','expected','certified','label','Academic and athletics certification completed by NCAA Eligibility Center')
    )
  ),
  jsonb_build_object('retrieved_at','2026-08-16','implementation_scope','advisory readiness tracking only')
from public.athlete_eligibility_rule_sources s
where s.source_key = 'ncaa-dii-initial-eligibility-2026-08'
on conflict (ruleset_key) do nothing;

insert into public.athlete_eligibility_rulesets (
  ruleset_key, source_id, governing_body, pathway, scope, population,
  academic_year_start, academic_year_end, status, certification_authority,
  authority_note, requirements_json, provenance
)
select
  'ncaa-diii-initial-2026-27', s.id, 'NCAA', 'division_iii', 'initial_eligibility', 'prospective_student_athlete',
  2026, 2027, 'active', 'NCAA member institution / NCAA Eligibility Center where applicable',
  'Division III institutions set their own admissions and academic standards. International Division III student-athletes require athletics certification through the NCAA Eligibility Center. Playbook must not invent a national Division III academic eligibility formula.',
  jsonb_build_object(
    'logic','INSTITUTION_SPECIFIC',
    'requirements', jsonb_build_array(
      jsonb_build_object('key','ncaa_id_registration','type','boolean','expected',true,'label','Register with NCAA Eligibility Center to obtain NCAA ID'),
      jsonb_build_object('key','institution_academic_standard','type','external_authority','label','Meet the institution-specific admissions and academic standards'),
      jsonb_build_object('key','international_athletics_certification','type','conditional_authority_status','condition','international_student','expected','certified','label','International athletics certification completed by NCAA Eligibility Center')
    )
  ),
  jsonb_build_object('retrieved_at','2026-08-16','implementation_scope','advisory readiness tracking only')
from public.athlete_eligibility_rule_sources s
where s.source_key = 'ncaa-diii-initial-eligibility-2026-08'
on conflict (ruleset_key) do nothing;

insert into public.athlete_eligibility_rulesets (
  ruleset_key, source_id, governing_body, pathway, scope, population,
  academic_year_start, academic_year_end, status, certification_authority,
  authority_note, requirements_json, provenance
)
select
  'naia-entering-freshman-2026-27', s.id, 'NAIA', 'entering_freshman', 'initial_eligibility', 'prospective_student_athlete',
  2026, 2027, 'active', 'NAIA Eligibility Center / certifying NAIA institution',
  'Playbook may track published freshman-readiness criteria but cannot issue an NAIA eligibility determination. The NAIA Eligibility Center and certifying institution retain authority.',
  jsonb_build_object(
    'logic','ALL',
    'requirements', jsonb_build_array(
      jsonb_build_object('key','high_school_completion_or_regular_student','type','authority_status','label','Graduate of an accredited high school or accepted as a regular student in good standing'),
      jsonb_build_object(
        'key','freshman_academic_pathway',
        'type','choice',
        'logic','ANY',
        'options', jsonb_build_array(
          jsonb_build_object('key','gpa_direct','logic','ALL','requirements',jsonb_build_array(
            jsonb_build_object('key','final_high_school_gpa','type','number','operator','gte','value',2.3,'unit','gpa')
          )),
          jsonb_build_object('key','traditional_two_of_three','logic','AT_LEAST','count',2,'requirements',jsonb_build_array(
            jsonb_build_object('key','final_high_school_gpa','type','number','operator','gte','value',2.0,'unit','gpa'),
            jsonb_build_object('key','class_rank','type','rank','operator','upper_half','label','Upper half of graduating class'),
            jsonb_build_object('key','standardized_test','type','choice','logic','ANY','options',jsonb_build_array(
              jsonb_build_object('key','act','type','number','operator','gte','value',18,'unit','ACT'),
              jsonb_build_object('key','sat','type','number','operator','gte','value',970,'unit','SAT')
            ))
          ))
        )
      )
    )
  ),
  jsonb_build_object('retrieved_at','2026-08-16','implementation_scope','advisory readiness tracking only')
from public.athlete_eligibility_rule_sources s
where s.source_key = 'naia-freshman-eligibility-2026-08'
on conflict (ruleset_key) do nothing;

comment on table public.athlete_eligibility_rule_sources is
  'Versioned authoritative-source registry for athletic eligibility rules. Source records are reference data and are not Scholar eligibility determinations.';
comment on table public.athlete_eligibility_rulesets is
  'Versioned, source-backed eligibility requirements used for advisory readiness tracking. Governing bodies and institutions retain certification authority.';