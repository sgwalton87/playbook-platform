\set ON_ERROR_STOP on

begin;

select to_regclass('public.community_events') is not null as events_exists \gset
\if :events_exists
\else
  \echo 'missing community_events'
  \quit 1
\endif

select to_regclass('public.community_event_rsvps') is not null as rsvps_exists \gset
\if :rsvps_exists
\else
  \echo 'missing community_event_rsvps'
  \quit 1
\endif

select to_regclass('public.community_event_attendance') is not null as attendance_exists \gset
\if :attendance_exists
\else
  \echo 'missing community_event_attendance'
  \quit 1
\endif

select to_regclass('public.mentor_circles') is not null as circles_exists \gset
\if :circles_exists
\else
  \echo 'missing mentor_circles'
  \quit 1
\endif

select to_regclass('public.mentor_circle_memberships') is not null as memberships_exists \gset
\if :memberships_exists
\else
  \echo 'missing mentor_circle_memberships'
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

select to_regprocedure('public.rsvp_community_event(uuid,text)') is not null as rsvp_rpc \gset
\if :rsvp_rpc
\else
  \echo 'missing rsvp_community_event'
  \quit 1
\endif

select to_regprocedure('public.join_mentor_circle(uuid,text)') is not null as join_rpc \gset
\if :join_rpc
\else
  \echo 'missing join_mentor_circle'
  \quit 1
\endif

select to_regprocedure('public.get_community_events()') is not null as events_projection \gset
\if :events_projection
\else
  \echo 'missing get_community_events projection'
  \quit 1
\endif

select to_regprocedure('public.get_mentor_circles()') is not null as circles_projection \gset
\if :circles_projection
\else
  \echo 'missing get_mentor_circles projection'
  \quit 1
\endif

select has_function_privilege('authenticated','public.rsvp_community_event(uuid,text)','EXECUTE') as auth_rsvp \gset
\if :auth_rsvp
\else
  \echo 'authenticated users need governed RSVP RPC'
  \quit 1
\endif

select has_function_privilege('anon','public.rsvp_community_event(uuid,text)','EXECUTE') as anon_rsvp \gset
\if :anon_rsvp
  \echo 'anonymous users must not RSVP'
  \quit 1
\endif

select has_function_privilege('authenticated','public.join_mentor_circle(uuid,text)','EXECUTE') as auth_join \gset
\if :auth_join
\else
  \echo 'authenticated users need governed circle membership RPC'
  \quit 1
\endif

select has_function_privilege('anon','public.join_mentor_circle(uuid,text)','EXECUTE') as anon_join \gset
\if :anon_join
  \echo 'anonymous users must not join circles'
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

select not has_function_privilege('authenticated','private.current_user_is_platform_operator()','EXECUTE') as operator_helper_private \gset
\if :operator_helper_private
\else
  \echo 'operator helper must remain private'
  \quit 1
\endif

select not has_function_privilege('authenticated','private.current_user_is_mentor()','EXECUTE') as mentor_helper_private \gset
\if :mentor_helper_private
\else
  \echo 'mentor helper must remain private'
  \quit 1
\endif

rollback;
