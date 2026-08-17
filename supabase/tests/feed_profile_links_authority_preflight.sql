\set ON_ERROR_STOP on
begin;

insert into auth.users(id,email)
values
  ('00000000-0000-0000-0000-00000000f501','feed-link-public@example.invalid'),
  ('00000000-0000-0000-0000-00000000f502','feed-link-private@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility,role)
values
  ('00000000-0000-0000-0000-00000000f501','feed-link-public','Feed Link Public','public','scholar'),
  ('00000000-0000-0000-0000-00000000f502','feed-link-private','Feed Link Private','private','scholar')
on conflict(id) do update set
  username=excluded.username,
  full_name=excluded.full_name,
  profile_visibility=excluded.profile_visibility,
  role=excluded.role;

insert into public.public_profile_publication_consents(
  scholar_id,consent_version,consented_at,revoked_at,updated_at
)
values (
  '00000000-0000-0000-0000-00000000f501','public-profile-v1',now(),null,now()
)
on conflict(scholar_id) do update set
  consent_version=excluded.consent_version,
  consented_at=excluded.consented_at,
  revoked_at=null,
  updated_at=now();

set local role anon;

do $$
declare
  public_count integer;
  private_count integer;
begin
  select count(*) into public_count
  from public.get_public_member_identities(array[
    '00000000-0000-0000-0000-00000000f501'::uuid,
    '00000000-0000-0000-0000-00000000f502'::uuid
  ]) where id='00000000-0000-0000-0000-00000000f501'::uuid and username='feed-link-public';

  select count(*) into private_count
  from public.get_public_member_identities(array[
    '00000000-0000-0000-0000-00000000f501'::uuid,
    '00000000-0000-0000-0000-00000000f502'::uuid
  ]) where id='00000000-0000-0000-0000-00000000f502'::uuid;

  if public_count<>1 then
    raise exception 'Consented public Feed author did not resolve to a profile-linkable username.';
  end if;
  if private_count<>0 then
    raise exception 'Unpublished Feed author identity leaked into Profile Links.';
  end if;
end;
$$;

reset role;

update public.public_profile_publication_consents
set revoked_at=now(),updated_at=now()
where scholar_id='00000000-0000-0000-0000-00000000f501';

set local role anon;

do $$
begin
  if exists (
    select 1 from public.get_public_member_identities(array['00000000-0000-0000-0000-00000000f501'::uuid])
  ) then
    raise exception 'Revoked public-profile consent did not remove Feed Profile Link identity.';
  end if;
end;
$$;

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000f502',true);

do $$
begin
  if not exists (
    select 1 from public.get_public_member_identities(array['00000000-0000-0000-0000-00000000f502'::uuid])
    where id='00000000-0000-0000-0000-00000000f502'::uuid and username='feed-link-private'
  ) then
    raise exception 'Authenticated owner could not resolve their own private Feed profile link identity.';
  end if;
end;
$$;

reset role;
rollback;
