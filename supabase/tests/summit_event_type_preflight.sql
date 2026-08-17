\set ON_ERROR_STOP on
begin;

select to_regclass('public.community_events') is not null as event_owner_exists \gset
\if :event_owner_exists \else \echo 'canonical community_events owner is missing' \quit 1 \endif

select to_regclass('public.summit_events') is null as no_parallel_summit_owner \gset
\if :no_parallel_summit_owner \else \echo 'Summit must not create a parallel summit_events canonical owner' \quit 1 \endif

select count(*) = 1 as event_type_constraint_exists
from pg_constraint c
join pg_class r on r.oid=c.conrelid
join pg_namespace n on n.oid=r.relnamespace
where n.nspname='public'
  and r.relname='community_events'
  and c.conname='community_events_event_type_check'
  and pg_get_constraintdef(c.oid) ilike '%summit%'
  and pg_get_constraintdef(c.oid) ilike '%workshop%'
  and pg_get_constraintdef(c.oid) ilike '%community%' \gset
\if :event_type_constraint_exists \else \echo 'canonical Event taxonomy must explicitly include Summit and existing Event types' \quit 1 \endif

select to_regprocedure('private.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)') is not null
   and to_regprocedure('public.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)') is not null as create_chain_exists \gset
\if :create_chain_exists \else \echo 'governed Event creation chain is incomplete' \quit 1 \endif

select pg_get_functiondef('private.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)'::regprocedure) ilike '%current_user_is_platform_operator%'
   and pg_get_functiondef('private.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)'::regprocedure) ilike '%summit%'
   and pg_get_functiondef('private.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)'::regprocedure) ilike '%unsupported event type%' as summit_creation_operator_guarded \gset
\if :summit_creation_operator_guarded \else \echo 'Summit creation must use the operator-gated canonical Event creator' \quit 1 \endif

select not p.prosecdef as public_wrapper_invoker
from pg_proc p join pg_namespace n on n.oid=p.pronamespace
where n.nspname='public'
  and p.proname='create_community_event'
  and pg_get_function_identity_arguments(p.oid)='event_title text, event_description text, event_type_input text, pillar_input text, starts_at_input timestamp with time zone, ends_at_input timestamp with time zone, timezone_input text, location_input text, virtual_url_input text, capacity_input integer, xp_reward_input integer, coin_reward_input integer, publish_now boolean' \gset
\if :public_wrapper_invoker \else \echo 'public Event creator must remain SECURITY INVOKER' \quit 1 \endif

select has_function_privilege('authenticated','public.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)','EXECUTE')
   and not has_function_privilege('anon','public.create_community_event(text,text,text,text,timestamp with time zone,timestamp with time zone,text,text,text,integer,integer,integer,boolean)','EXECUTE') as wrapper_access_bounded \gset
\if :wrapper_access_bounded \else \echo 'Event creation wrapper permissions broadened unexpectedly' \quit 1 \endif

select not has_table_privilege('authenticated','public.community_events','INSERT')
   and not has_table_privilege('authenticated','public.community_events','UPDATE')
   and not has_table_privilege('authenticated','public.community_events','DELETE') as direct_event_mutation_closed \gset
\if :direct_event_mutation_closed \else \echo 'Summit/Event creation must remain behind governed RPCs' \quit 1 \endif

rollback;
