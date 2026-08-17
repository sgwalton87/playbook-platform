\set ON_ERROR_STOP on
begin;

-- Structural authority boundary: participant reads only, no direct client writes.
do $$
begin
  if to_regclass('public.connection_requests') is null
     or to_regclass('public.user_connections') is null then
    raise exception 'Canonical Network relationship tables are missing.';
  end if;

  if not (select relrowsecurity from pg_class where oid='public.connection_requests'::regclass)
     or not (select relrowsecurity from pg_class where oid='public.user_connections'::regclass) then
    raise exception 'Network relationship tables must keep RLS enabled.';
  end if;

  if has_table_privilege('authenticated','public.connection_requests','INSERT')
     or has_table_privilege('authenticated','public.connection_requests','UPDATE')
     or has_table_privilege('authenticated','public.connection_requests','DELETE')
     or has_table_privilege('authenticated','public.user_connections','INSERT')
     or has_table_privilege('authenticated','public.user_connections','UPDATE')
     or has_table_privilege('authenticated','public.user_connections','DELETE') then
    raise exception 'Authenticated clients must not directly mutate canonical Network relationship tables.';
  end if;

  if not has_table_privilege('authenticated','public.connection_requests','SELECT')
     or not has_table_privilege('authenticated','public.user_connections','SELECT') then
    raise exception 'Authenticated participant/owner Network reads are missing.';
  end if;
end;
$$;

-- Required RPC chain and invoker/definer split.
do $$
declare
  fn text;
  public_definer boolean;
  private_definer boolean;
begin
  foreach fn in array array[
    'send_connection_request',
    'respond_to_connection_request',
    'cancel_connection_request',
    'remove_connection'
  ] loop
    if not exists (
      select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=fn
    ) or not exists (
      select 1 from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='private' and p.proname=fn
    ) then
      raise exception 'Network RPC chain is incomplete for %.', fn;
    end if;

    select bool_or(p.prosecdef) into public_definer
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='public' and p.proname=fn;
    select bool_or(p.prosecdef) into private_definer
      from pg_proc p join pg_namespace n on n.oid=p.pronamespace
      where n.nspname='private' and p.proname=fn;

    if coalesce(public_definer,false) then
      raise exception 'Public Network RPC % must remain SECURITY INVOKER.', fn;
    end if;
    if not coalesce(private_definer,false) then
      raise exception 'Private Network RPC % must remain SECURITY DEFINER.', fn;
    end if;
  end loop;
end;
$$;

-- Public discovery and send eligibility must inherit versioned publication consent.
do $$
declare
  send_body text;
  directory_body text;
  identities_body text;
begin
  select pg_get_functiondef('private.send_connection_request(uuid,text)'::regprocedure) into send_body;
  select pg_get_functiondef('private.get_public_network_directory(text,integer)'::regprocedure) into directory_body;
  select pg_get_functiondef('private.get_network_member_identities(uuid[])'::regprocedure) into identities_body;

  if send_body !~ 'public_profile_publication_consents'
     or send_body !~ 'public-profile-v1'
     or send_body !~ 'revoked_at is null' then
    raise exception 'Network send eligibility must require active versioned public-profile publication consent.';
  end if;

  if directory_body !~ 'public_profile_publication_consents'
     or directory_body !~ 'public-profile-v1'
     or directory_body !~ 'revoked_at is null' then
    raise exception 'Public Network discovery must require active versioned publication consent.';
  end if;

  if identities_body !~ 'public_profile_publication_consents'
     or identities_body !~ 'private.can_resolve_network_identity'
     or identities_body !~ 'revoked_at is null' then
    raise exception 'Network identity resolution must require publication consent or an authorized participant relationship.';
  end if;
end;
$$;

-- Seed disposable identities inside this transaction. auth.users accepts id/email
-- as the only non-default values required by the local Supabase schema. Any
-- profile trigger is reconciled by the ON CONFLICT update below.
insert into auth.users(id,email)
values
  ('00000000-0000-0000-0000-00000000a001','network-audit-a@example.invalid'),
  ('00000000-0000-0000-0000-00000000b001','network-audit-b@example.invalid'),
  ('00000000-0000-0000-0000-00000000c001','network-audit-c@example.invalid'),
  ('00000000-0000-0000-0000-00000000d001','network-audit-d@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values
  ('00000000-0000-0000-0000-00000000a001','network-audit-a','Network Audit A','public'),
  ('00000000-0000-0000-0000-00000000b001','network-audit-b','Network Audit B','public'),
  ('00000000-0000-0000-0000-00000000c001','network-audit-c','Network Audit C','public'),
  ('00000000-0000-0000-0000-00000000d001','network-audit-d','Network Audit D','public')
on conflict(id) do update set
  username=excluded.username,
  full_name=excluded.full_name,
  profile_visibility=excluded.profile_visibility;

-- A, B, and D are actively publication-consented. C deliberately is not.
insert into public.public_profile_publication_consents(
  scholar_id,consent_version,consented_at,revoked_at,updated_at
)
values
  ('00000000-0000-0000-0000-00000000a001','public-profile-v1',now(),null,now()),
  ('00000000-0000-0000-0000-00000000b001','public-profile-v1',now(),null,now()),
  ('00000000-0000-0000-0000-00000000d001','public-profile-v1',now(),null,now())
on conflict(scholar_id) do update set
  consent_version=excluded.consent_version,
  consented_at=excluded.consented_at,
  revoked_at=null,
  updated_at=excluded.updated_at;

-- Public-but-unconsented C must fail closed for request creation.
do $$
begin
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
  begin
    perform * from public.send_connection_request(
      '00000000-0000-0000-0000-00000000c001'::uuid,
      null
    );
    raise exception 'Expected unconsented Network recipient to be rejected.';
  exception
    when insufficient_privilege then null;
  end;

  if exists (
    select 1 from public.connection_requests
    where requester_id='00000000-0000-0000-0000-00000000a001'::uuid
      and recipient_id='00000000-0000-0000-0000-00000000c001'::uuid
  ) then
    raise exception 'Failed publication-consent eligibility check persisted a Network request.';
  end if;
end;
$$;

-- Requester A sends a valid request to consented recipient B.
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
select request_id as accepted_candidate_id
from public.send_connection_request(
  '00000000-0000-0000-0000-00000000b001'::uuid,
  'audit acceptance'
) \gset

-- Requester self-accept must fail and leave both request and graph unchanged.
do $$
declare
  target_id uuid := :'accepted_candidate_id';
begin
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
  begin
    perform * from public.respond_to_connection_request(target_id,'accepted');
    raise exception 'Expected requester self-accept to fail.';
  exception
    when insufficient_privilege then null;
  end;

  if not exists (select 1 from public.connection_requests where id=target_id and status='pending') then
    raise exception 'Requester self-accept changed request state.';
  end if;
  if exists (
    select 1 from public.user_connections
    where user_id in (
      '00000000-0000-0000-0000-00000000a001'::uuid,
      '00000000-0000-0000-0000-00000000b001'::uuid
    ) and connected_user_id in (
      '00000000-0000-0000-0000-00000000a001'::uuid,
      '00000000-0000-0000-0000-00000000b001'::uuid
    )
  ) then
    raise exception 'Requester self-accept created a partial connection edge.';
  end if;
end;
$$;

-- Recipient B accepts. Both reciprocal edges must appear in the same RPC result.
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000b001',true);
select * from public.respond_to_connection_request(:'accepted_candidate_id'::uuid,'accepted');

do $$
declare
  target_id uuid := :'accepted_candidate_id';
  edge_count integer;
begin
  if not exists (select 1 from public.connection_requests where id=target_id and status='accepted' and responded_at is not null) then
    raise exception 'Recipient acceptance did not durably transition the request.';
  end if;

  select count(*) into edge_count
  from public.user_connections
  where (user_id='00000000-0000-0000-0000-00000000a001'::uuid and connected_user_id='00000000-0000-0000-0000-00000000b001'::uuid)
     or (user_id='00000000-0000-0000-0000-00000000b001'::uuid and connected_user_id='00000000-0000-0000-0000-00000000a001'::uuid);

  if edge_count <> 2 then
    raise exception 'Recipient acceptance must create exactly two reciprocal connection edges; found %.', edge_count;
  end if;
end;
$$;

-- Either participant may disconnect; both directions must be removed together.
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
select public.remove_connection('00000000-0000-0000-0000-00000000b001'::uuid);

do $$
begin
  if exists (
    select 1 from public.user_connections
    where (user_id='00000000-0000-0000-0000-00000000a001'::uuid and connected_user_id='00000000-0000-0000-0000-00000000b001'::uuid)
       or (user_id='00000000-0000-0000-0000-00000000b001'::uuid and connected_user_id='00000000-0000-0000-0000-00000000a001'::uuid)
  ) then
    raise exception 'Disconnect left a one-way Network edge behind.';
  end if;
end;
$$;

-- Cancellation is requester-only.
select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
select request_id as cancel_candidate_id
from public.send_connection_request(
  '00000000-0000-0000-0000-00000000d001'::uuid,
  'audit cancellation'
) \gset

do $$
declare
  target_id uuid := :'cancel_candidate_id';
begin
  perform set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000d001',true);
  begin
    perform * from public.cancel_connection_request(target_id);
    raise exception 'Expected recipient cancellation to fail.';
  exception
    when insufficient_privilege then null;
  end;

  if not exists (select 1 from public.connection_requests where id=target_id and status='pending') then
    raise exception 'Non-requester cancellation changed request state.';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub','00000000-0000-0000-0000-00000000a001',true);
select * from public.cancel_connection_request(:'cancel_candidate_id'::uuid);

do $$
begin
  if not exists (
    select 1 from public.connection_requests
    where id=:'cancel_candidate_id'::uuid and status='cancelled' and responded_at is not null
  ) then
    raise exception 'Requester cancellation did not transition the request to cancelled.';
  end if;
end;
$$;

-- Certification is transactional and leaves the isolated replay database unchanged.
rollback;
