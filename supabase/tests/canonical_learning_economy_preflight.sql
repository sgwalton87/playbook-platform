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
select not has_table_privilege('authenticated','public.learning_module_progress','INSERT')
   and not has_table_privilege('authenticated','public.learning_credentials','INSERT')
   and not has_table_privilege('authenticated','public.achievement_badges','INSERT') as no_direct_learning_mint \gset
\if :no_direct_learning_mint
\else
  \echo 'authenticated clients must not directly mint learning progress, credentials, or badges'
  \quit 1
\endif

-- Completion is exposed only as an invoker wrapper; private helper retains authority.
select to_regprocedure('public.complete_learning_module(text,text,text)') is not null
   and to_regprocedure('private.complete_learning_module(text,text,text)') is not null as completion_chain_exists \gset
\if :completion_chain_exists
\else
  \echo 'learning completion wrapper/helper chain is incomplete'
  \quit 1
\endif

select not (select prosecdef from pg_proc where oid='public.complete_learning_module(text,text,text)'::regprocedure) as public_completion_invoker \gset
\if :public_completion_invoker
\else
  \echo 'public complete_learning_module must be SECURITY INVOKER'
  \quit 1
\endif

select (select prosecdef from pg_proc where oid='private.complete_learning_module(text,text,text)'::regprocedure) as private_completion_definer \gset
\if :private_completion_definer
\else
  \echo 'private complete_learning_module must retain SECURITY DEFINER authority'
  \quit 1
\endif

select has_function_privilege('authenticated','public.complete_learning_module(text,text,text)','EXECUTE')
   and has_function_privilege('authenticated','private.complete_learning_module(text,text,text)','EXECUTE') as auth_completion_chain \gset
\if :auth_completion_chain
\else
  \echo 'authenticated learners require the narrow learning completion wrapper/helper chain'
  \quit 1
\endif

select not has_function_privilege('anon','public.complete_learning_module(text,text,text)','EXECUTE')
   and not has_function_privilege('anon','private.complete_learning_module(text,text,text)','EXECUTE') as anon_completion_denied \gset
\if :anon_completion_denied
\else
  \echo 'anonymous users must not complete learning modules'
  \quit 1
\endif

select not has_function_privilege('authenticated','private.record_learning_reward(uuid,text,text,integer,integer,text)','EXECUTE') as auth_reward_helper_private \gset
\if :auth_reward_helper_private
\else
  \echo 'authenticated clients must not call private reward mint helper'
  \quit 1
\endif

-- Completion body must preserve learner-role, published-course, required-module, reflection, and idempotency gates.
select pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'auth\.uid\(\)'
   and pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'current_user_is_onboarded_learner'
   and pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'status\s*=\s*''published'''
   and pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'required\s*=\s*true' as learner_course_module_gates \gset
\if :learner_course_module_gates
\else
  \echo 'learning completion must remain learner-scoped to published courses and required modules'
  \quit 1
\endif

select pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'completion_mode\s*=\s*''reflection'''
   and pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'at least 20 characters' as reflection_guard \gset
\if :reflection_guard
\else
  \echo 'reflection modules must retain meaningful reflection requirement'
  \quit 1
\endif

select pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'on conflict\s*\(user_id,course_slug,module_key\)\s*do nothing'
   and pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'module_rewarded\s*:=\s*private\.record_learning_reward'
   and pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'course_rewarded\s*:=\s*private\.record_learning_reward' as completion_reward_idempotent \gset
\if :completion_reward_idempotent
\else
  \echo 'module/course completion reward idempotency is missing'
  \quit 1
\endif

select pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'on conflict\s*\(user_id,course_slug\)\s*do update'
   and pg_get_functiondef('private.complete_learning_module(text,text,text)'::regprocedure) ~ 'on conflict\s*\(user_id,badge_key,source_id\)\s*do update' as durable_credential_badge_upserts \gset
\if :durable_credential_badge_upserts
\else
  \echo 'credential/badge issuance must remain durable idempotent upserts'
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

select pg_get_functiondef('private.record_learning_reward(uuid,text,text,integer,integer,text)'::regprocedure) ~ 'pg_advisory_xact_lock'
   and pg_get_functiondef('private.record_learning_reward(uuid,text,text,integer,integer,text)'::regprocedure) ~ 'coin_ledger' as reward_helper_serialized \gset
\if :reward_helper_serialized
\else
  \echo 'private reward helper must retain transaction lock and ledger dedupe'
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
select to_regclass('public.reward_store_items') is null
   and to_regclass('public.reward_store_redemptions') is null as no_parallel_economy \gset
\if :no_parallel_economy
\else
  \echo 'parallel reward store economy must not exist'
  \quit 1
\endif

-- Public-profile private exposure must remain the only anonymous private execution surface.
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
