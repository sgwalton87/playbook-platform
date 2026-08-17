\set ON_ERROR_STOP on
begin;

do $$
declare
  public_definer boolean;
  private_definer boolean;
  body text;
begin
  if to_regprocedure('public.get_public_member_identities(uuid[])') is null
     or to_regprocedure('private.get_public_member_identities(uuid[])') is null then
    raise exception 'Feed author identity RPC chain is missing.';
  end if;

  select p.prosecdef into public_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_public_member_identities';
  select p.prosecdef into private_definer
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='private' and p.proname='get_public_member_identities';

  if coalesce(public_definer,false) then
    raise exception 'Public Feed identity RPC must remain SECURITY INVOKER.';
  end if;
  if not coalesce(private_definer,false) then
    raise exception 'Private Feed identity helper must remain SECURITY DEFINER.';
  end if;
  if not has_function_privilege('anon','public.get_public_member_identities(uuid[])','EXECUTE')
     or not has_function_privilege('authenticated','public.get_public_member_identities(uuid[])','EXECUTE') then
    raise exception 'Feed identity public RPC grants are incorrect.';
  end if;

  select pg_get_functiondef('private.get_public_member_identities(uuid[])'::regprocedure) into body;
  if body !~ 'public_profile_publication_consents'
     or body !~ 'public-profile-v1'
     or body !~ 'revoked_at is null'
     or body !~ 'profile_visibility' then
    raise exception 'Feed identity helper does not enforce the explicit publication-consent boundary.';
  end if;
end;
$$;

insert into auth.users(id,email)
values
  ('00000000-0000-0000-0000-00000000f201','feed-public-consented@example.invalid'),
  ('00000000-0000-0000-0000-00000000f202','feed-public-unconsented@example.invalid'),
  ('00000000-0000-0000-0000-00000000f203','feed-private-owner@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
  ('00000000-0000-0000-0000-00000000f201','feed-consented','Feed Consented','public'),
  ('00000000-0000-0000-0000-00000000f202','feed-unconsented','Feed Unconsented','public'),
  ('00000000-0000-0000-0000-00000000f203','feed-private','Feed Private Owner','private')
on conflict(id) do update set
  username=excluded.username,
  full_name=excluded.full_name,
  profile_visibility=excluded.profile_visibility;

insert into public.public_profile_publication_consents(scholar_id,consent_version,consented_at,revoked_at,updated_at)
values ('00000000-0000-0000-0000-00000000f201','public-profile-v1',now(),null,now())
on conflict(scholar_id) do update set
  consent_version=excluded.consent_version,
  consented_at=excluded.consented_at,
  revoked_at=null,
  updated_at=excluded.updated_at;

select set_config('request.jwt.claim.sub','',true);

do $$
declare
  visible_count integer;
  leaked_count integer;
begin
  select count(*) into visible_count
  from public.get_public_member_identities(array[
    '00000000-0000-0000-0000-00000000f201'::uuid,
    '00000000-0000-0000-0000-00000000f202'::uuid,
    '00000000-0000-0000-0000-00000000f203'::uuid
  ]);
  if visible_count<>1 then
    raise exception 'Anonymous Feed identity projection must expose exactly the consented public identity; got %.', visible_count;
  end if;

  select count(*) into leaked_count
  from public.get_public_member_identities(array['00000000-0000-0000-0000-00000000f202'::uuid]);
  if leaked_count<>0 then
    raise exception 'A public profile without publication consent leaked into Feed identity.';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000f203',true);

do $$
declare owner_count integer;
begin
  select count(*) into owner_count
  from public.get_public_member_identities(array['00000000-0000-0000-0000-00000000f203'::uuid]);
  if owner_count<>1 then
    raise exception 'Authenticated owner must be able to resolve their own Feed identity.';
  end if;
end;
$$;

update public.public_profile_publication_consents
set revoked_at=now(),updated_at=now()
where scholar_id='00000000-0000-0000-0000-00000000f201';
select set_config('request.jwt.claim.sub','',true);

do $$
declare revoked_count integer;
begin
  select count(*) into revoked_count
  from public.get_public_member_identities(array['00000000-0000-0000-0000-00000000f201'::uuid]);
  if revoked_count<>0 then
    raise exception 'Revoked publication consent must immediately remove Feed identity projection.';
  end if;
end;
$$;

rollback;
