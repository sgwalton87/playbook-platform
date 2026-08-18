\set ON_ERROR_STOP on
begin;

select to_regprocedure('private.enqueue_notification_event(uuid,text,text,text,text,text,text)') is not null as enqueue_exists \gset
\if :enqueue_exists \else \echo 'missing private notification enqueue authority' \quit 1 \endif
select not has_function_privilege('authenticated','private.enqueue_notification_event(uuid,text,text,text,text,text,text)','EXECUTE') as enqueue_private \gset
\if :enqueue_private \else \echo 'authenticated clients must not enqueue system notification events' \quit 1 \endif

select not has_table_privilege('authenticated','public.pbos_notifications','INSERT')
   and not has_table_privilege('authenticated','public.pbos_notifications','UPDATE')
   and not has_table_privilege('authenticated','public.pbos_notifications','DELETE') as notifications_not_client_mutable \gset
\if :notifications_not_client_mutable \else \echo 'system notifications must not be directly client mutable' \quit 1 \endif

select not has_table_privilege('authenticated','public.pbos_notification_outbox','INSERT')
   and not has_table_privilege('authenticated','public.pbos_notification_outbox','UPDATE')
   and not has_table_privilege('authenticated','public.pbos_notification_outbox','DELETE') as outbox_not_client_mutable \gset
\if :outbox_not_client_mutable \else \echo 'notification outbox must not be directly client mutable' \quit 1 \endif

select count(*) = 4 as private_helpers_are_definers
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='private'
  and p.proname in ('acknowledge_notification','set_notification_preference','transition_notification_outbox','finalize_notification_delivery')
  and p.prosecdef \gset
\if :private_helpers_are_definers \else \echo 'notification mutation bodies must remain private SECURITY DEFINER helpers' \quit 1 \endif

select count(*) = 6 as public_wrappers_are_invokers
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname in ('acknowledge_notification','set_notification_preference','transition_notification_outbox','finalize_notification_delivery')
  and not p.prosecdef \gset
\if :public_wrappers_are_invokers \else \echo 'exposed notification RPCs must be SECURITY INVOKER wrappers' \quit 1 \endif

select to_regprocedure('public.transition_notification_outbox(uuid,text)') is not null
   and to_regprocedure('public.transition_notification_outbox(uuid,text,text,timestamptz)') is not null
   and to_regprocedure('public.finalize_notification_delivery(uuid)') is not null
   and to_regprocedure('public.finalize_notification_delivery(uuid,text,jsonb)') is not null as rollout_overloads_exist \gset
\if :rollout_overloads_exist \else \echo 'notification rollout overload set is incomplete' \quit 1 \endif

select count(*) = 2 as legacy_overloads_have_no_defaults
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and (
    (p.proname='transition_notification_outbox' and pg_get_function_identity_arguments(p.oid)='requested_outbox_id uuid, requested_state text, requested_error text, requested_next_attempt_at timestamp with time zone')
    or
    (p.proname='finalize_notification_delivery' and pg_get_function_identity_arguments(p.oid)='requested_outbox_id uuid, requested_priority text, requested_provenance jsonb')
  )
  and p.pronargdefaults=0 \gset
\if :legacy_overloads_have_no_defaults \else \echo 'legacy notification overloads must not expose defaults that create PostgREST ambiguity' \quit 1 \endif

select has_function_privilege('authenticated','public.acknowledge_notification(uuid,boolean)','EXECUTE')
   and has_function_privilege('authenticated','public.set_notification_preference(text,text)','EXECUTE')
   and has_function_privilege('authenticated','public.transition_notification_outbox(uuid,text)','EXECUTE')
   and has_function_privilege('authenticated','public.finalize_notification_delivery(uuid)','EXECUTE') as narrow_actions_available \gset
\if :narrow_actions_available \else \echo 'authenticated users require narrow notification action RPCs' \quit 1 \endif

select not has_function_privilege('anon','public.acknowledge_notification(uuid,boolean)','EXECUTE')
   and not has_function_privilege('anon','public.set_notification_preference(text,text)','EXECUTE')
   and not has_function_privilege('anon','public.transition_notification_outbox(uuid,text)','EXECUTE')
   and not has_function_privilege('anon','public.finalize_notification_delivery(uuid)','EXECUTE') as anon_actions_blocked \gset
\if :anon_actions_blocked \else \echo 'anonymous clients must not execute notification mutation RPCs' \quit 1 \endif

select count(*) = 1 as legacy_transition_ignores_untrusted_metadata
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname='transition_notification_outbox'
  and pg_get_function_identity_arguments(p.oid)='requested_outbox_id uuid, requested_state text, requested_error text, requested_next_attempt_at timestamp with time zone'
  and p.prosrc ilike '%private.transition_notification_outbox(requested_outbox_id,requested_state)%'
  and p.prosrc not ilike '%requested_error%private%'
  and p.prosrc not ilike '%requested_next_attempt_at%private%' \gset
\if :legacy_transition_ignores_untrusted_metadata \else \echo 'legacy transition wrapper still forwards untrusted delivery metadata' \quit 1 \endif

select count(*) = 1 as legacy_finalize_ignores_untrusted_metadata
from pg_proc p
join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname='finalize_notification_delivery'
  and pg_get_function_identity_arguments(p.oid)='requested_outbox_id uuid, requested_priority text, requested_provenance jsonb'
  and p.prosrc ilike '%private.finalize_notification_delivery(requested_outbox_id)%'
  and p.prosrc not ilike '%requested_priority%private%'
  and p.prosrc not ilike '%requested_provenance%private%' \gset
\if :legacy_finalize_ignores_untrusted_metadata \else \echo 'legacy finalize wrapper still forwards untrusted priority or provenance' \quit 1 \endif

select exists(
  select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
  where c.relname='verification_review_events' and t.tgname='verification_review_notification' and not t.tgisinternal
) as verification_trigger_exists \gset
\if :verification_trigger_exists \else \echo 'verification review must emit trusted notification event' \quit 1 \endif

select exists(
  select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
  where c.relname='learning_credentials' and t.tgname='learning_credential_notification' and not t.tgisinternal
) as credential_trigger_exists \gset
\if :credential_trigger_exists \else \echo 'learning credential must emit trusted milestone notification' \quit 1 \endif

select count(*) = 0 as untrusted_triggers_absent
from pg_trigger t join pg_class c on c.oid=t.tgrelid
where not t.tgisinternal
  and ((c.relname='pbos_opportunity_recommendations' and t.tgname='opportunity_recommendation_notification')
    or (c.relname='application_workspace_events' and t.tgname='application_event_notification')) \gset
\if :untrusted_triggers_absent \else \echo 'owner-writable opportunity/application rows must not be trusted notification producers yet' \quit 1 \endif

rollback;

-- Messaging consumes this same trusted notification authority; certify its producer behavior here.
\i supabase/tests/messaging_message_notifications_preflight.sql
