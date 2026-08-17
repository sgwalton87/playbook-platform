\set ON_ERROR_STOP on
begin;

-- Canonical extension tables exist and remain RLS protected.
do $$
declare rel regclass;
begin
  foreach rel in array array[
    'public.community_event_checkin_codes'::regclass,
    'public.community_event_checkins'::regclass,
    'public.community_event_networking_optins'::regclass
  ] loop
    if not (select c.relrowsecurity from pg_class c where c.oid=rel) then
      raise exception '% must keep RLS enabled', rel::text;
    end if;
  end loop;
end $$;

-- Plaintext check-in secrets never become readable table data.
do $$
begin
  if has_table_privilege('anon','public.community_event_checkin_codes','SELECT')
     or has_table_privilege('authenticated','public.community_event_checkin_codes','SELECT') then
    raise exception 'check-in token hashes must not be directly readable by clients';
  end if;
  if has_table_privilege('authenticated','public.community_event_checkin_codes','INSERT')
     or has_table_privilege('authenticated','public.community_event_checkin_codes','UPDATE')
     or has_table_privilege('authenticated','public.community_event_checkin_codes','DELETE') then
    raise exception 'check-in code lifecycle must remain behind operator RPC authority';
  end if;
end $$;

-- Arrival and networking rows are projection-readable only by their owner; client mutation is RPC-only.
do $$
begin
  if not has_table_privilege('authenticated','public.community_event_checkins','SELECT')
     or has_table_privilege('authenticated','public.community_event_checkins','INSERT')
     or has_table_privilege('authenticated','public.community_event_checkins','UPDATE')
     or has_table_privilege('authenticated','public.community_event_checkins','DELETE') then
    raise exception 'community_event_checkins client grants changed';
  end if;
  if not has_table_privilege('authenticated','public.community_event_networking_optins','SELECT')
     or has_table_privilege('authenticated','public.community_event_networking_optins','INSERT')
     or has_table_privilege('authenticated','public.community_event_networking_optins','UPDATE')
     or has_table_privilege('authenticated','public.community_event_networking_optins','DELETE') then
    raise exception 'community_event_networking_optins client grants changed';
  end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='community_event_checkins'
      and policyname='community_event_checkins_owner_select' and cmd='SELECT' and qual ilike '%auth.uid()%user_id%'
  ) then raise exception 'owner-only check-in read policy missing'; end if;
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='community_event_networking_optins'
      and policyname='community_event_networking_owner_select' and cmd='SELECT' and qual ilike '%auth.uid()%user_id%'
  ) then raise exception 'owner-only networking opt-in read policy missing'; end if;
end $$;

-- Public RPCs are invoker wrappers; private bodies hold the narrow authority.
do $$
declare public_proc regprocedure; private_proc regprocedure;
begin
  foreach public_proc in array array[
    'public.configure_community_event_experience(uuid,text,boolean,boolean)'::regprocedure,
    'public.create_community_event_checkin_code(uuid,timestamp with time zone,timestamp with time zone)'::regprocedure,
    'public.check_in_community_event(text)'::regprocedure,
    'public.set_community_event_networking_opt_in(uuid,boolean,text)'::regprocedure,
    'public.get_community_event_networking_directory(uuid)'::regprocedure,
    'public.get_community_event_detail(uuid)'::regprocedure,
    'public.get_community_event_operations()'::regprocedure
  ] loop
    if (select p.prosecdef from pg_proc p where p.oid=public_proc) then
      raise exception '% must be SECURITY INVOKER', public_proc::text;
    end if;
    if has_function_privilege('anon',public_proc,'EXECUTE') then
      raise exception 'anonymous must not execute %', public_proc::text;
    end if;
    if not has_function_privilege('authenticated',public_proc,'EXECUTE') then
      raise exception 'authenticated wrapper execute missing for %', public_proc::text;
    end if;
  end loop;

  foreach private_proc in array array[
    'private.configure_community_event_experience(uuid,text,boolean,boolean)'::regprocedure,
    'private.create_community_event_checkin_code(uuid,timestamp with time zone,timestamp with time zone)'::regprocedure,
    'private.check_in_community_event(text)'::regprocedure,
    'private.set_community_event_networking_opt_in(uuid,boolean,text)'::regprocedure,
    'private.get_community_event_networking_directory(uuid)'::regprocedure,
    'private.get_community_event_detail(uuid)'::regprocedure,
    'private.get_community_event_operations()'::regprocedure
  ] loop
    if not (select p.prosecdef from pg_proc p where p.oid=private_proc) then
      raise exception '% must retain SECURITY DEFINER authority', private_proc::text;
    end if;
    if has_function_privilege('anon',private_proc,'EXECUTE') then
      raise exception 'anonymous must not execute %', private_proc::text;
    end if;
    if not has_function_privilege('authenticated',private_proc,'EXECUTE') then
      raise exception 'authenticated wrapper path requires private execute on %', private_proc::text;
    end if;
  end loop;
end $$;

-- Check-in is arrival evidence only. It must not become attendance or reward authority.
do $$
declare body text;
begin
  select lower(pg_get_functiondef('private.check_in_community_event(text)'::regprocedure)) into body;
  if body !~ 'community_event_rsvps' or body !~ 'status=''going''' then
    raise exception 'check-in must require a confirmed RSVP';
  end if;
  if body !~ 'community_event_checkin_codes' or body !~ 'valid_from' or body !~ 'valid_until' then
    raise exception 'check-in must validate a time-bounded token';
  end if;
  if body !~ 'community_event_checkins' or body !~ 'attendee_arrival_evidence' then
    raise exception 'check-in must persist explicit arrival evidence';
  end if;
  if body ~ 'insert\s+into\s+public\.community_event_attendance'
     or body ~ 'update\s+public\.community_event_attendance'
     or body ~ 'record_learning_reward' then
    raise exception 'arrival check-in must not mutate verified attendance or rewards';
  end if;
end $$;

-- Check-in tokens are high entropy, hashed at rest, and bounded to <= 12 hours.
do $$
declare body text;
begin
  select lower(pg_get_functiondef('private.create_community_event_checkin_code(uuid,timestamp with time zone,timestamp with time zone)'::regprocedure)) into body;
  if body !~ 'gen_random_bytes\(32\)' or body !~ 'digest\(raw_token,''sha256''\)' then
    raise exception 'check-in token generation/hash contract changed';
  end if;
  if body !~ 'interval ''12 hours''' or body !~ 'current_user_is_platform_operator' then
    raise exception 'check-in code must remain operator-only and bounded to 12 hours';
  end if;
end $$;

-- Networking is explicit opt-in and safe projection only.
do $$
declare body text; result_signature text;
begin
  select lower(pg_get_functiondef('private.set_community_event_networking_opt_in(uuid,boolean,text)'::regprocedure)) into body;
  if body !~ 'networking_enabled=true' or body !~ 'community_event_rsvps' or body !~ 'community_event_attendance' then
    raise exception 'networking opt-in participation guard changed';
  end if;

  select lower(pg_get_function_result('public.get_community_event_networking_directory(uuid)'::regprocedure)) into result_signature;
  if result_signature ~ '\m(email|phone|guardian|household|gpa|transcript|eligibility|verification|support)\M' then
    raise exception 'event networking projection exposes a restricted field: %', result_signature;
  end if;
end $$;

-- Event detail remains a bounded published-event projection and operations stay operator-only.
do $$
declare detail_body text; operations_body text;
begin
  select lower(pg_get_functiondef('private.get_community_event_detail(uuid)'::regprocedure)) into detail_body;
  if detail_body !~ 'status=''published''' then
    raise exception 'event detail must remain bounded to published events';
  end if;
  if detail_body ~ '\m(email|phone|guardian|household|transcript|verification_note)\M' then
    raise exception 'event detail function contains restricted projection data';
  end if;

  select lower(pg_get_functiondef('private.get_community_event_operations()'::regprocedure)) into operations_body;
  if operations_body !~ 'current_user_is_platform_operator' then
    raise exception 'Event Operations projection must remain platform-operator-only';
  end if;
end $$;

rollback;
