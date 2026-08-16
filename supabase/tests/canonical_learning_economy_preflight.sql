\set ON_ERROR_STOP on

begin;

-- Canonical learning tables exist and are RLS-protected.
do $$
declare
  table_name text;
begin
  foreach table_name in array array['learning_courses','learning_modules','learning_module_progress','learning_credentials','achievement_badges'] loop
    if to_regclass('public.' || table_name) is null then
      raise exception 'missing canonical learning table: %', table_name;
    end if;
    if not exists (
      select 1 from pg_class c join pg_namespace n on n.oid=c.relnamespace
      where n.nspname='public' and c.relname=table_name and c.relrowsecurity
    ) then
      raise exception 'RLS disabled on canonical learning table: %', table_name;
    end if;
  end loop;
end $$;

-- Clients may read their own learning evidence but cannot directly mint it.
select has_table_privilege('authenticated','public.learning_module_progress','INSERT') as auth_progress_insert \gset
\if :auth_progress_insert
  \echo 'authenticated must not directly insert learning progress'
  \quit 1
\endif
select has_table_privilege('authenticated','public.learning_credentials','INSERT') as auth_credential_insert \gset
\if :auth_credential_insert
  \echo 'authenticated must not directly insert credentials'
  \quit 1
\endif
select has_table_privilege('authenticated','public.achievement_badges','INSERT') as auth_badge_insert \gset
\if :auth_badge_insert
  \echo 'authenticated must not directly insert badges'
  \quit 1
\endif

-- Completion uses one public wrapper; the mint helper remains private.
select to_regprocedure('public.complete_learning_module(text,text,text)') is not null as completion_rpc_exists \gset
\if :completion_rpc_exists
\else
  \echo 'missing complete_learning_module'
  \quit 1
\endif
select has_function_privilege('authenticated','public.complete_learning_module(text,text,text)','EXECUTE') as auth_completion_exec \gset
\if :auth_completion_exec
\else
  \echo 'authenticated must execute governed learning completion'
  \quit 1
\endif
select has_function_privilege('anon','public.complete_learning_module(text,text,text)','EXECUTE') as anon_completion_exec \gset
\if :anon_completion_exec
  \echo 'anonymous users must not complete learning modules'
  \quit 1
\endif
select has_function_privilege('authenticated','private.record_learning_reward(uuid,text,text,integer,integer,text)','EXECUTE') as auth_reward_helper_exec \gset
\if :auth_reward_helper_exec
  \echo 'authenticated must not call private reward mint helper'
  \quit 1
\endif

-- Store remains on the existing canonical atomic authority; no parallel economy.
select to_regprocedure('public.redeem_store_product(uuid,jsonb,text)') is not null as store_rpc_exists \gset
\if :store_rpc_exists
\else
  \echo 'canonical store redemption RPC missing'
  \quit 1
\endif
select has_function_privilege('authenticated','public.redeem_store_product(uuid,jsonb,text)','EXECUTE') as auth_store_exec \gset
\if :auth_store_exec
\else
  \echo 'authenticated must execute canonical store redemption'
  \quit 1
\endif
select to_regclass('public.reward_store_items') is null as no_parallel_store_items \gset
\if :no_parallel_store_items
\else
  \echo 'parallel reward_store_items economy must not exist'
  \quit 1
\endif
select to_regclass('public.reward_store_redemptions') is null as no_parallel_redemptions \gset
\if :no_parallel_redemptions
\else
  \echo 'parallel reward_store_redemptions economy must not exist'
  \quit 1
\endif

-- Course completion and module completion are idempotent at the ledger source.
select count(*) = 1 as ledger_dedupe_index_exists
from pg_indexes
where schemaname='public' and tablename='coin_ledger' and indexdef ilike '%scholar_id%event_type%source_id%';
\gset
\if :ledger_dedupe_index_exists
\else
  \echo 'coin ledger idempotency index missing'
  \quit 1
\endif

rollback;
