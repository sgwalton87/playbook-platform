\set ON_ERROR_STOP on

begin;

select to_regclass('public.community_events') is not null
   and to_regclass('public.community_event_rsvps') is not null
   and to_regclass('public.community_event_attendance') is not null
   and to_regclass('public.mentor_circles') is not null
   and to_regclass('public.mentor_circle_memberships') is not null as community_tables_exist \gset
\if :community_tables_exist
\else
  \echo 'community operation tables are incomplete'
  \quit 1
\endif

select bool_and(relrowsecurity) as all_rls_enabled
from pg_class
where oid in (
  'public.community_events'::regclass,
  'public.community_event_rsvps'::regclass,
  'public.community_event_attendance'::regclass,
  'public.mentor_circles'::regclass,
  'public.mentor_circle_memberships'::regclass
) \gset
\if :all_rls_enabled
\else
  \echo 'community tables must keep RLS enabled'
  \quit 1
\endif

select count(*) = 0 as direct_mutation_policies_absent
from pg_policies
where schemaname='public'
  and tablename in ('community_events','community_event_rsvps','community_event_attendance','mentor_circles','mentor_circle_memberships')
  and cmd in ('INSERT','UPDATE','DELETE') \gset
\if :direct_mutation_policies_absent
\else
  \echo 'community mutations must remain behind governed RPCs'
  \quit 1
\endif

select to_regprocedure('public.rsvp_community_event(uuid,text)') is not null
   and to_regprocedure('public.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)') is not null
   and to_regprocedure('public.verify_community_event_attendance(uuid,uuid,boolean,text)') is not null
   and to_regprocedure('public.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)') is not null
   and to_regprocedure('public.join_mentor_circle(uuid,text)') is not null
   and to_regprocedure('public.get_community_events()') is not null
   and to_regprocedure('public.get_mentor_circles()') is not null
   and to_regprocedure('private.rsvp_community_event(uuid,text)') is not null
   and to_regprocedure('private.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)') is not null
   and to_regprocedure('private.verify_community_event_attendance(uuid,uuid,boolean,text)') is not null
   and to_regprocedure('private.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)') is not null
   and to_regprocedure('private.join_mentor_circle(uuid,text)') is not null
   and to_regprocedure('private.get_community_events()') is not null
   and to_regprocedure('private.get_mentor_circles()') is not null as community_wrapper_helpers_exist \gset
\if :community_wrapper_helpers_exist
\else
  \echo 'community wrapper/helper function set is incomplete'
  \quit 1
\endif

select bool_and(not p.prosecdef) as public_invoker_only
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in (
    'rsvp_community_event','create_community_event','verify_community_event_attendance',
    'create_mentor_circle','join_mentor_circle','get_community_events','get_mentor_circles'
  ) \gset
\if :public_invoker_only
\else
  \echo 'public community RPCs must be SECURITY INVOKER wrappers only'
  \quit 1
\endif

select bool_and(p.prosecdef) as private_definer_only
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and p.proname in (
    'rsvp_community_event','create_community_event','verify_community_event_attendance',
    'create_mentor_circle','join_mentor_circle','get_community_events','get_mentor_circles'
  ) \gset
\if :private_definer_only
\else
  \echo 'private community helpers must retain SECURITY DEFINER authority'
  \quit 1
\endif

select has_function_privilege('authenticated','public.rsvp_community_event(uuid,text)','EXECUTE')
   and has_function_privilege('authenticated','public.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)','EXECUTE')
   and has_function_privilege('authenticated','public.verify_community_event_attendance(uuid,uuid,boolean,text)','EXECUTE')
   and has_function_privilege('authenticated','public.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)','EXECUTE')
   and has_function_privilege('authenticated','public.join_mentor_circle(uuid,text)','EXECUTE')
   and has_function_privilege('authenticated','public.get_community_events()','EXECUTE')
   and has_function_privilege('authenticated','public.get_mentor_circles()','EXECUTE')
   and has_function_privilege('authenticated','private.rsvp_community_event(uuid,text)','EXECUTE')
   and has_function_privilege('authenticated','private.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)','EXECUTE')
   and has_function_privilege('authenticated','private.verify_community_event_attendance(uuid,uuid,boolean,text)','EXECUTE')
   and has_function_privilege('authenticated','private.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)','EXECUTE')
   and has_function_privilege('authenticated','private.join_mentor_circle(uuid,text)','EXECUTE')
   and has_function_privilege('authenticated','private.get_community_events()','EXECUTE')
   and has_function_privilege('authenticated','private.get_mentor_circles()','EXECUTE') as authenticated_chain \gset
\if :authenticated_chain
\else
  \echo 'authenticated users require the narrow community wrapper/helper chain'
  \quit 1
\endif

select not has_function_privilege('anon','public.rsvp_community_event(uuid,text)','EXECUTE')
   and not has_function_privilege('anon','public.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)','EXECUTE')
   and not has_function_privilege('anon','public.verify_community_event_attendance(uuid,uuid,boolean,text)','EXECUTE')
   and not has_function_privilege('anon','public.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)','EXECUTE')
   and not has_function_privilege('anon','public.join_mentor_circle(uuid,text)','EXECUTE')
   and not has_function_privilege('anon','public.get_community_events()','EXECUTE')
   and not has_function_privilege('anon','public.get_mentor_circles()','EXECUTE')
   and not has_function_privilege('anon','private.rsvp_community_event(uuid,text)','EXECUTE')
   and not has_function_privilege('anon','private.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)','EXECUTE')
   and not has_function_privilege('anon','private.verify_community_event_attendance(uuid,uuid,boolean,text)','EXECUTE')
   and not has_function_privilege('anon','private.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)','EXECUTE')
   and not has_function_privilege('anon','private.join_mentor_circle(uuid,text)','EXECUTE')
   and not has_function_privilege('anon','private.get_community_events()','EXECUTE')
   and not has_function_privilege('anon','private.get_mentor_circles()','EXECUTE') as anon_denied \gset
\if :anon_denied
\else
  \echo 'anonymous callers must not execute community/mentorship RPCs or private helpers'
  \quit 1
\endif

select not has_function_privilege('authenticated','private.current_user_is_platform_operator()','EXECUTE')
   and not has_function_privilege('authenticated','private.current_user_is_mentor()','EXECUTE') as authority_helpers_private \gset
\if :authority_helpers_private
\else
  \echo 'community authority predicate helpers must remain non-callable to authenticated clients'
  \quit 1
\endif

select pg_get_functiondef('private.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)'::regprocedure) ~ 'current_user_is_platform_operator'
   and pg_get_functiondef('private.verify_community_event_attendance(uuid,uuid,boolean,text)'::regprocedure) ~ 'current_user_is_platform_operator' as operator_mutations_guarded \gset
\if :operator_mutations_guarded
\else
  \echo 'event creation and attendance verification must require platform operator authority'
  \quit 1
\endif

select pg_get_functiondef('private.rsvp_community_event(uuid,text)'::regprocedure) ~ 'status=''published'''
   and pg_get_functiondef('private.rsvp_community_event(uuid,text)'::regprocedure) ~ 'for update'
   and pg_get_functiondef('private.rsvp_community_event(uuid,text)'::regprocedure) ~ 'current_going >= event_row.capacity' as rsvp_capacity_guarded \gset
\if :rsvp_capacity_guarded
\else
  \echo 'RSVP authority must lock the published event and enforce capacity'
  \quit 1
\endif

select pg_get_functiondef('private.verify_community_event_attendance(uuid,uuid,boolean,text)'::regprocedure) ~ 'reward_already_issued'
   and pg_get_functiondef('private.verify_community_event_attendance(uuid,uuid,boolean,text)'::regprocedure) ~ 'private.record_learning_reward'
   and pg_get_functiondef('private.verify_community_event_attendance(uuid,uuid,boolean,text)'::regprocedure) ~ 'reward_issued=true' as attendance_reward_idempotent \gset
\if :attendance_reward_idempotent
\else
  \echo 'attendance reward authority must remain idempotent'
  \quit 1
\endif

select pg_get_functiondef('private.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)'::regprocedure) ~ 'current_user_is_platform_operator'
   and pg_get_functiondef('private.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)'::regprocedure) ~ 'current_user_is_mentor'
   and pg_get_functiondef('private.create_mentor_circle(text,text,text,uuid,integer,timestamp with time zone,text,text)'::regprocedure) ~ 'onboarding_completed=true' as mentor_creation_guarded \gset
\if :mentor_creation_guarded
\else
  \echo 'mentor circle creation must remain operator-or-onboarded-Mentor gated'
  \quit 1
\endif

select pg_get_functiondef('private.join_mentor_circle(uuid,text)'::regprocedure) ~ 'status=''active'''
   and pg_get_functiondef('private.join_mentor_circle(uuid,text)'::regprocedure) ~ 'for update'
   and pg_get_functiondef('private.join_mentor_circle(uuid,text)'::regprocedure) ~ 'waitlisted' as circle_capacity_guarded \gset
\if :circle_capacity_guarded
\else
  \echo 'mentor circle joins must lock active circles and preserve waitlisting at capacity'
  \quit 1
\endif

select pg_get_functiondef('private.get_community_events()'::regprocedure) ~ 'auth\.uid\(\) is not null'
   and pg_get_functiondef('private.get_mentor_circles()'::regprocedure) ~ 'auth\.uid\(\) is not null' as projections_authenticated \gset
\if :projections_authenticated
\else
  \echo 'community read projections must remain authenticated-only'
  \quit 1
\endif

select count(*) = 3 as anon_private_execute_still_bounded
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and has_function_privilege('anon',p.oid,'EXECUTE');
\gset
\if :anon_private_execute_still_bounded
\else
  \echo 'anonymous private EXECUTE broadened beyond the three intentional public-profile projection helpers'
  \quit 1
\endif

rollback;
