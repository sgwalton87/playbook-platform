\set ON_ERROR_STOP on

begin;

select to_regprocedure('private.enqueue_notification_event(uuid,text,text,text,text,text,text)') is not null as enqueue_exists \gset
\if :enqueue_exists
\else
  \echo 'missing private notification enqueue authority'
  \quit 1
\endif

select not has_function_privilege('authenticated','private.enqueue_notification_event(uuid,text,text,text,text,text,text)','EXECUTE') as enqueue_private \gset
\if :enqueue_private
\else
  \echo 'authenticated clients must not enqueue system notification events'
  \quit 1
\endif

select not has_table_privilege('authenticated','public.pbos_notifications','INSERT')
   and not has_table_privilege('authenticated','public.pbos_notifications','UPDATE')
   and not has_table_privilege('authenticated','public.pbos_notifications','DELETE') as notifications_not_client_mutable \gset
\if :notifications_not_client_mutable
\else
  \echo 'system notifications must not be directly client mutable'
  \quit 1
\endif

select not has_table_privilege('authenticated','public.pbos_notification_outbox','INSERT')
   and not has_table_privilege('authenticated','public.pbos_notification_outbox','UPDATE')
   and not has_table_privilege('authenticated','public.pbos_notification_outbox','DELETE') as outbox_not_client_mutable \gset
\if :outbox_not_client_mutable
\else
  \echo 'notification outbox must not be directly client mutable'
  \quit 1
\endif

select to_regprocedure('public.acknowledge_notification(uuid,boolean)') is not null as acknowledge_rpc \gset
\if :acknowledge_rpc
\else
  \echo 'missing acknowledge_notification RPC'
  \quit 1
\endif

select to_regprocedure('public.set_notification_preference(text,text)') is not null as preference_rpc \gset
\if :preference_rpc
\else
  \echo 'missing set_notification_preference RPC'
  \quit 1
\endif

select to_regprocedure('public.finalize_notification_delivery(uuid,text,jsonb)') is not null as finalize_rpc \gset
\if :finalize_rpc
\else
  \echo 'missing finalize_notification_delivery RPC'
  \quit 1
\endif

select has_function_privilege('authenticated','public.acknowledge_notification(uuid,boolean)','EXECUTE')
   and has_function_privilege('authenticated','public.set_notification_preference(text,text)','EXECUTE')
   and has_function_privilege('authenticated','public.finalize_notification_delivery(uuid,text,jsonb)','EXECUTE') as narrow_actions_available \gset
\if :narrow_actions_available
\else
  \echo 'authenticated users require narrow notification action RPCs'
  \quit 1
\endif

select exists(
  select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
  where c.relname='verification_review_events' and t.tgname='verification_review_notification' and not t.tgisinternal
) as verification_trigger_exists \gset
\if :verification_trigger_exists
\else
  \echo 'verification review must emit trusted notification event'
  \quit 1
\endif

select exists(
  select 1 from pg_trigger t join pg_class c on c.oid=t.tgrelid
  where c.relname='learning_credentials' and t.tgname='learning_credential_notification' and not t.tgisinternal
) as credential_trigger_exists \gset
\if :credential_trigger_exists
\else
  \echo 'learning credential must emit trusted milestone notification'
  \quit 1
\endif

select count(*) = 0 as untrusted_triggers_absent
from pg_trigger t join pg_class c on c.oid=t.tgrelid
where not t.tgisinternal and (
  (c.relname='pbos_opportunity_recommendations' and t.tgname='opportunity_recommendation_notification')
  or (c.relname='application_workspace_events' and t.tgname='application_event_notification')
) \gset
\if :untrusted_triggers_absent
\else
  \echo 'owner-writable opportunity/application rows must not be trusted notification producers yet'
  \quit 1
\endif

rollback;
