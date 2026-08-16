-- Read-only post-migration preflight for support invitation authority.
-- Run after the full relationship migration chain on a non-production branch.

begin;

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='support_invitations'
       and policyname='Scholar Record owners can create governed support invitations'
  ) then
    raise exception 'Governed support invitation INSERT policy is missing.';
  end if;

  if exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='support_invitations'
       and policyname in (
         'Users can create support invitations',
         'Scholar Record owners can create support invitations',
         'Invitees can update their invitation status'
       )
  ) then
    raise exception 'Legacy broad support invitation policy is still present.';
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='support_invitations'
       and policyname='Invitation participants can view invitations'
  ) then
    raise exception 'Consolidated invitation participant SELECT policy is missing.';
  end if;
end;
$$;

-- Authenticated clients may create and read governed invitations but may not
-- directly mutate or delete them. Claim/decline goes through the RPC boundary.
do $$
begin
  if has_table_privilege('authenticated', 'public.support_invitations', 'UPDATE')
     or has_table_privilege('authenticated', 'public.support_invitations', 'DELETE') then
    raise exception 'Authenticated role has direct UPDATE/DELETE access to support_invitations.';
  end if;

  if not has_table_privilege('authenticated', 'public.support_invitations', 'SELECT')
     or not has_table_privilege('authenticated', 'public.support_invitations', 'INSERT') then
    raise exception 'Authenticated invitation SELECT/INSERT grants are incomplete.';
  end if;
end;
$$;

-- Public RPC wrapper must remain invoker-mode while the mature mutating claim
-- implementation lives outside the exposed public schema.
do $$
declare
  public_prosecdef boolean;
  private_prosecdef boolean;
begin
  if to_regprocedure('public.claim_support_invitation(text,text)') is null then
    raise exception 'Public invitation claim RPC wrapper is missing.';
  end if;
  if to_regprocedure('private.claim_support_invitation(text,text)') is null then
    raise exception 'Private invitation claim implementation is missing.';
  end if;

  select p.prosecdef into public_prosecdef
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname='public' and p.proname='claim_support_invitation'
     and pg_get_function_identity_arguments(p.oid)='invitation_token text, desired_status text';

  select p.prosecdef into private_prosecdef
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
   where n.nspname='private' and p.proname='claim_support_invitation'
     and pg_get_function_identity_arguments(p.oid)='invitation_token text, desired_status text';

  if coalesce(public_prosecdef, true) then
    raise exception 'Public claim wrapper must not be SECURITY DEFINER.';
  end if;
  if not coalesce(private_prosecdef, false) then
    raise exception 'Private claim implementation must be SECURITY DEFINER.';
  end if;
end;
$$;

rollback;
