\set ON_ERROR_STOP on
begin;

-- Conversation Search is a derived experience over the existing Messaging RLS
-- surface. It must not introduce a privileged search function or broader grants.
select to_regprocedure('private.pbos_user_has_active_conversation_access(uuid,uuid)') is not null as helper_exists \gset
\if :helper_exists
\else
  \echo 'missing shared active-conversation authority helper'
  \quit 1
\endif

select count(*) = 1 as conversation_read_guard
from pg_policies
where schemaname='public' and tablename='pbos_conversations'
  and policyname='Governed participants view conversations'
  and cmd='SELECT'
  and qual ilike '%pbos_user_has_active_conversation_access%' \gset
\if :conversation_read_guard
\else
  \echo 'Conversation Search would not inherit canonical conversation RLS'
  \quit 1
\endif

select count(*) = 1 as message_read_guard
from pg_policies
where schemaname='public' and tablename='pbos_messages'
  and policyname='Governed participants view messages'
  and cmd='SELECT'
  and qual ilike '%pbos_user_has_active_conversation_access%' \gset
\if :message_read_guard
\else
  \echo 'Conversation Search would not inherit canonical message RLS'
  \quit 1
\endif

select has_table_privilege('authenticated','public.pbos_conversations','SELECT') as auth_conversation_select \gset
\if :auth_conversation_select
\else
  \echo 'authenticated users require RLS-scoped conversation reads'
  \quit 1
\endif

select has_table_privilege('authenticated','public.pbos_messages','SELECT') as auth_message_select \gset
\if :auth_message_select
\else
  \echo 'authenticated users require RLS-scoped message reads'
  \quit 1
\endif

select has_table_privilege('anon','public.pbos_messages','SELECT') as anon_message_select \gset
\if :anon_message_select
  \echo 'anonymous users must not search Messaging content'
  \quit 1
\endif

select has_function_privilege('anon','private.pbos_user_has_active_conversation_access(uuid,uuid)','EXECUTE') as anon_helper_exec \gset
\if :anon_helper_exec
  \echo 'anonymous users must not execute Messaging authority helper'
  \quit 1
\endif

select count(*) = 0 as search_functions_absent
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public' and p.proname in ('search_messages','search_conversations','search_governed_conversations') \gset
\if :search_functions_absent
\else
  \echo 'Conversation Search introduced a duplicate privileged search surface'
  \quit 1
\endif

rollback;
