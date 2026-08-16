\set ON_ERROR_STOP on

begin;

select to_regprocedure('private.pbos_user_has_active_conversation_access(uuid,uuid)') is not null as helper_exists \gset
\if :helper_exists
\else
  \echo 'missing active conversation authority helper'
  \quit 1
\endif

select has_function_privilege('anon', 'private.pbos_user_has_active_conversation_access(uuid,uuid)', 'EXECUTE') as anon_helper_exec \gset
\if :anon_helper_exec
  \echo 'anon must not execute messaging authority helper'
  \quit 1
\endif

select has_function_privilege('authenticated', 'private.pbos_user_has_active_conversation_access(uuid,uuid)', 'EXECUTE') as auth_helper_exec \gset
\if :auth_helper_exec
\else
  \echo 'authenticated RLS evaluation requires helper execute privilege'
  \quit 1
\endif

select to_regclass('public.pbos_message_attachments') is not null as attachments_table_exists \gset
\if :attachments_table_exists
\else
  \echo 'missing governed message attachment metadata table'
  \quit 1
\endif

select coalesce((select not public from storage.buckets where id='pbos-message-attachments'), false) as bucket_private \gset
\if :bucket_private
\else
  \echo 'message attachment bucket must remain private'
  \quit 1
\endif

select coalesce((select file_size_limit = 10485760 from storage.buckets where id='pbos-message-attachments'), false) as bucket_size_limited \gset
\if :bucket_size_limited
\else
  \echo 'message attachment bucket must enforce 10 MB limit'
  \quit 1
\endif

select count(*) = 4 as attachment_metadata_policy_set_complete
from pg_policies
where schemaname='public' and tablename='pbos_message_attachments'
  and policyname in (
    'Current participants view message attachments',
    'Current participants stage message attachments',
    'Uploaders attach staged message attachments',
    'Uploaders delete staged message attachments'
  ) \gset
\if :attachment_metadata_policy_set_complete
\else
  \echo 'message attachment metadata policy set is incomplete'
  \quit 1
\endif

select count(*) = 3 as attachment_storage_policy_set_complete
from pg_policies where schemaname='storage' and tablename='objects'
  and policyname in (
    'Current participants upload message attachments',
    'Current participants read message attachments',
    'Uploaders delete staged message attachment objects'
  ) \gset
\if :attachment_storage_policy_set_complete
\else
  \echo 'message attachment storage policy set is incomplete'
  \quit 1
\endif

select count(*) = 1 as participant_select_active_guard
from pg_policies where schemaname='public' and tablename='pbos_conversation_participants'
  and policyname='Participants view their state'
  and qual ilike '%pbos_user_has_active_conversation_access%' \gset
\if :participant_select_active_guard
\else
  \echo 'participant read policy does not enforce current relationship authority'
  \quit 1
\endif

select count(*) = 1 as participant_update_active_guard
from pg_policies where schemaname='public' and tablename='pbos_conversation_participants'
  and policyname='Participants update their state'
  and qual ilike '%pbos_user_has_active_conversation_access%'
  and with_check ilike '%pbos_user_has_active_conversation_access%' \gset
\if :participant_update_active_guard
\else
  \echo 'participant update policy does not enforce current relationship authority'
  \quit 1
\endif

select count(*) = 3 as message_active_guard_count
from pg_policies where schemaname='public' and tablename='pbos_messages'
  and policyname in (
    'Governed participants view messages',
    'Governed participants send messages',
    'Governed participants update messages'
  )
  and coalesce(qual, with_check, '') ilike '%pbos_user_has_active_conversation_access%' \gset
\if :message_active_guard_count
\else
  \echo 'one or more message policies do not enforce current relationship authority'
  \quit 1
\endif

select count(*) = 0 as broad_profile_select_policy_absent
from pg_policies
where schemaname = 'public'
  and tablename = 'profiles'
  and cmd = 'SELECT'
  and (qual = 'true' or qual ilike '%profile_visibility%public%') \gset
\if :broad_profile_select_policy_absent
\else
  \echo 'public.profiles gained a broad select policy'
  \quit 1
\endif

rollback;
