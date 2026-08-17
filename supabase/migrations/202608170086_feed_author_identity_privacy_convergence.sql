-- Phase 6 Feed author identity privacy convergence.
-- Feed consumes canonical presentation identity only after explicit public-profile consent.

create or replace function private.get_public_member_identities(requested_ids uuid[])
returns table (
  id uuid,
  username text,
  full_name text,
  first_name text,
  last_name text,
  role text,
  avatar_url text
)
language sql
stable
security definer
set search_path=''
as $$
  select
    p.id,
    p.username,
    p.full_name,
    p.first_name,
    p.last_name,
    private.normalize_playbook_profile_role(coalesce(p.profile_mode,p.role,p.requested_role)) as role,
    p.avatar_url
  from public.profiles p
  where cardinality(requested_ids) between 1 and 100
    and p.id=any(requested_ids)
    and (
      p.id=auth.uid()
      or (
        coalesce(p.profile_visibility,'private')='public'
        and exists (
          select 1
          from public.public_profile_publication_consents consent
          where consent.scholar_id=p.id
            and consent.consent_version='public-profile-v1'
            and consent.revoked_at is null
        )
      )
    );
$$;

revoke all on function private.get_public_member_identities(uuid[]) from public,anon,authenticated;
grant execute on function private.get_public_member_identities(uuid[]) to anon,authenticated;

create or replace function public.get_public_member_identities(requested_ids uuid[])
returns table (
  id uuid,
  username text,
  full_name text,
  first_name text,
  last_name text,
  role text,
  avatar_url text
)
language sql
stable
security invoker
set search_path=''
as $$
  select * from private.get_public_member_identities(requested_ids);
$$;

revoke all on function public.get_public_member_identities(uuid[]) from public,anon,authenticated;
grant execute on function public.get_public_member_identities(uuid[]) to anon,authenticated;

comment on function public.get_public_member_identities(uuid[]) is
  'Bounded presentation-grade identity projection. Non-owners resolve only explicitly publication-consented public profiles; owners may resolve their own canonical identity. Public wrapper is SECURITY INVOKER over a private SECURITY DEFINER helper.';
