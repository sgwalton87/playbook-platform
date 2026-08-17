\set ON_ERROR_STOP on
begin;

-- Structural authority: public wrapper is invoker, private helper is definer,
-- authenticated only, and the projection returns counts rather than identities.
do $$
declare
  public_definer boolean;
  private_definer boolean;
  body text;
begin
  if to_regprocedure('public.get_network_mutual_connection_counts(uuid[])') is null
     or to_regprocedure('private.get_network_mutual_connection_counts(uuid[])') is null then
    raise exception 'Mutual Connections RPC chain is missing.';
  end if;

  select p.prosecdef into public_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_network_mutual_connection_counts';
  select p.prosecdef into private_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='get_network_mutual_connection_counts';

  if coalesce(public_definer,false) then
    raise exception 'Public Mutual Connections RPC must remain SECURITY INVOKER.';
  end if;
  if not coalesce(private_definer,false) then
    raise exception 'Private Mutual Connections helper must remain SECURITY DEFINER.';
  end if;
  if not has_function_privilege('authenticated','public.get_network_mutual_connection_counts(uuid[])','EXECUTE')
     or has_function_privilege('anon','public.get_network_mutual_connection_counts(uuid[])','EXECUTE') then
    raise exception 'Mutual Connections public RPC grants are incorrect.';
  end if;

  select pg_get_functiondef('private.get_network_mutual_connection_counts(uuid[])'::regprocedure) into body;
  if body !~ 'public_profile_publication_consents'
     or body !~ 'public-profile-v1'
     or body !~ 'private.can_resolve_network_identity'
     or body !~ 'count\(distinct'
     or body ~ 'returns table\([^)]*username' then
    raise exception 'Mutual Connections must be bounded by Network visibility and expose counts only.';
  end if;
end;
$$;

insert into auth.users(id,email)
values
  ('00000000-0000-0000-0000-00000000e101','mutual-a@example.invalid'),
  ('00000000-0000-0000-0000-00000000e102','mutual-b@example.invalid'),
  ('00000000-0000-0000-0000-00000000e103','mutual-c@example.invalid'),
  ('00000000-0000-0000-0000-00000000e104','mutual-d@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
  ('00000000-0000-0000-0000-00000000e101','mutual-a','Mutual A','public'),
  ('00000000-0000-0000-0000-00000000e102','mutual-b','Mutual B','public'),
  ('00000000-0000-0000-0000-00000000e103','mutual-c','Mutual C','public'),
  ('00000000-0000-0000-0000-00000000e104','mutual-d','Mutual D','public')
on conflict(id) do update set username=excluded.username,full_name=excluded.full_name,profile_visibility=excluded.profile_visibility;

insert into public.public_profile_publication_consents(scholar_id,consent_version,consented_at,revoked_at,updated_at)
values
  ('00000000-0000-0000-0000-00000000e101','public-profile-v1',now(),null,now()),
  ('00000000-0000-0000-0000-00000000e102','public-profile-v1',now(),null,now()),
  ('00000000-0000-0000-0000-00000000e103','public-profile-v1',now(),null,now()),
  ('00000000-0000-0000-0000-00000000e104','public-profile-v1',now(),null,now())
on conflict(scholar_id) do update set consent_version=excluded.consent_version,consented_at=excluded.consented_at,revoked_at=null,updated_at=excluded.updated_at;

-- A and B both connect to C. D has no overlap with A.
insert into public.user_connections(user_id,connected_user_id)
values
  ('00000000-0000-0000-0000-00000000e101','00000000-0000-0000-0000-00000000e103'),
  ('00000000-0000-0000-0000-00000000e103','00000000-0000-0000-0000-00000000e101'),
  ('00000000-0000-0000-0000-00000000e102','00000000-0000-0000-0000-00000000e103'),
  ('00000000-0000-0000-0000-00000000e103','00000000-0000-0000-0000-00000000e102')
on conflict(user_id,connected_user_id) do nothing;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000e101',true);

do $$
declare
  b_count bigint;
  d_count bigint;
begin
  select mutual_count into b_count
  from public.get_network_mutual_connection_counts(array['00000000-0000-0000-0000-00000000e102'::uuid]);
  if b_count <> 1 then
    raise exception 'Expected exactly one mutual connection between A and B, got %.', b_count;
  end if;

  select mutual_count into d_count
  from public.get_network_mutual_connection_counts(array['00000000-0000-0000-0000-00000000e104'::uuid]);
  if d_count <> 0 then
    raise exception 'Expected zero mutual connections between A and D, got %.', d_count;
  end if;
end;
$$;

rollback;