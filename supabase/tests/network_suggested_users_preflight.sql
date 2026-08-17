\set ON_ERROR_STOP on
begin;

do $$
declare
  public_definer boolean;
  private_definer boolean;
  body text;
begin
  if to_regprocedure('public.get_network_suggested_users(integer)') is null
     or to_regprocedure('private.get_network_suggested_users(integer)') is null then
    raise exception 'Suggested Users RPC chain is missing.';
  end if;

  select p.prosecdef into public_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_network_suggested_users';
  select p.prosecdef into private_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='get_network_suggested_users';

  if coalesce(public_definer,false) then
    raise exception 'Public Suggested Users RPC must remain SECURITY INVOKER.';
  end if;
  if not coalesce(private_definer,false) then
    raise exception 'Private Suggested Users helper must remain SECURITY DEFINER.';
  end if;
  if not has_function_privilege('authenticated','public.get_network_suggested_users(integer)','EXECUTE')
     or has_function_privilege('anon','public.get_network_suggested_users(integer)','EXECUTE') then
    raise exception 'Suggested Users public RPC grants are incorrect.';
  end if;

  select pg_get_functiondef('private.get_network_suggested_users(integer)'::regprocedure) into body;
  if body !~ 'public_profile_publication_consents'
     or body !~ 'public-profile-v1'
     or body !~ 'connection_requests'
     or body !~ 'user_connections'
     or body !~ 'mutual_count'
     or body !~ 'order by r.mutual_count desc' then
    raise exception 'Suggested Users must inherit public consent, relationship exclusions, mutual evidence, and deterministic ranking.';
  end if;
end;
$$;

insert into auth.users(id,email)
values
  ('00000000-0000-0000-0000-00000000a201','suggest-actor@example.invalid'),
  ('00000000-0000-0000-0000-00000000a202','suggest-b@example.invalid'),
  ('00000000-0000-0000-0000-00000000a203','suggest-c@example.invalid'),
  ('00000000-0000-0000-0000-00000000a204','suggest-d@example.invalid'),
  ('00000000-0000-0000-0000-00000000a205','suggest-mutual-1@example.invalid'),
  ('00000000-0000-0000-0000-00000000a206','suggest-mutual-2@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
  ('00000000-0000-0000-0000-00000000a201','suggest-actor','Suggest Actor','public'),
  ('00000000-0000-0000-0000-00000000a202','suggest-b','Beta Candidate','public'),
  ('00000000-0000-0000-0000-00000000a203','suggest-c','Charlie Candidate','public'),
  ('00000000-0000-0000-0000-00000000a204','suggest-d','Delta Candidate','public')
on conflict(id) do update set username=excluded.username,full_name=excluded.full_name,profile_visibility=excluded.profile_visibility;

insert into public.public_profile_publication_consents(scholar_id,consent_version,consented_at,revoked_at,updated_at)
values
  ('00000000-0000-0000-0000-00000000a202','public-profile-v1',now(),null,now()),
  ('00000000-0000-0000-0000-00000000a203','public-profile-v1',now(),null,now()),
  ('00000000-0000-0000-0000-00000000a204','public-profile-v1',now(),null,now())
on conflict(scholar_id) do update set consent_version=excluded.consent_version,consented_at=excluded.consented_at,revoked_at=null,updated_at=excluded.updated_at;

-- Actor shares two connections with B, one with C, and one with D.
insert into public.user_connections(user_id,connected_user_id)
values
  ('00000000-0000-0000-0000-00000000a201','00000000-0000-0000-0000-00000000a205'),
  ('00000000-0000-0000-0000-00000000a201','00000000-0000-0000-0000-00000000a206'),
  ('00000000-0000-0000-0000-00000000a202','00000000-0000-0000-0000-00000000a205'),
  ('00000000-0000-0000-0000-00000000a202','00000000-0000-0000-0000-00000000a206'),
  ('00000000-0000-0000-0000-00000000a203','00000000-0000-0000-0000-00000000a205'),
  ('00000000-0000-0000-0000-00000000a204','00000000-0000-0000-0000-00000000a205')
on conflict(user_id,connected_user_id) do nothing;

-- D would otherwise qualify but must be excluded because a request is pending.
insert into public.connection_requests(id,requester_id,recipient_id,status)
values(
  '00000000-0000-0000-0000-00000000a207',
  '00000000-0000-0000-0000-00000000a201',
  '00000000-0000-0000-0000-00000000a204',
  'pending'
)
on conflict(id) do update set status='pending';

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a201',true);

do $$
declare
  ids uuid[];
  counts bigint[];
begin
  select array_agg(id order by mutual_count desc,lower(coalesce(full_name,username,'')),id),
         array_agg(mutual_count order by mutual_count desc,lower(coalesce(full_name,username,'')),id)
    into ids,counts
  from public.get_network_suggested_users(12);

  if ids is null or array_length(ids,1) <> 2 then
    raise exception 'Expected exactly two eligible Suggested Users, got %.', coalesce(array_length(ids,1),0);
  end if;
  if ids[1] <> '00000000-0000-0000-0000-00000000a202'::uuid or counts[1] <> 2 then
    raise exception 'Highest mutual-count candidate must rank first.';
  end if;
  if ids[2] <> '00000000-0000-0000-0000-00000000a203'::uuid or counts[2] <> 1 then
    raise exception 'Second eligible candidate must retain deterministic order.';
  end if;
  if '00000000-0000-0000-0000-00000000a204'::uuid = any(ids) then
    raise exception 'Pending relationship candidate must not be suggested.';
  end if;
end;
$$;

rollback;