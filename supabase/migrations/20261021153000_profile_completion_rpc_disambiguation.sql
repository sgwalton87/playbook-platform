-- Keep the governed onboarding mutation fail-closed while disambiguating the
-- profiles column from the RETURNS TABLE output variable of the same name.
create or replace function private.complete_playbook_onboarding(
  expected_role text,
  mark_verification_pending boolean default false
)
returns table (
  onboarding_completed_at timestamptz,
  verification_status text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  authenticated_user_id uuid := auth.uid();
  normalized_expected_role text := private.normalize_playbook_profile_role(expected_role);
  durable_role text;
  completed_at timestamptz := now();
begin
  if authenticated_user_id is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;

  if normalized_expected_role is null then
    raise exception 'Unsupported Playbook role.' using errcode = '22023';
  end if;

  select private.normalize_playbook_profile_role(
           coalesce(p.profile_mode, p.role, p.requested_role)
         )
    into durable_role
    from public.profiles p
   where p.id = authenticated_user_id
   for update;

  if not found then
    raise exception 'A durable Playbook profile is required.' using errcode = 'P0002';
  end if;

  if durable_role is distinct from normalized_expected_role then
    raise exception 'Authenticated profile role does not match onboarding role.' using errcode = '42501';
  end if;

  update public.profiles as profile
     set onboarding_completed = true,
         onboarding_completed_at = coalesce(profile.onboarding_completed_at, completed_at),
         verification_status = case
           when mark_verification_pending
             and profile.verification_status is distinct from 'approved'
           then 'pending'
           else profile.verification_status
         end,
         updated_at = now()
   where profile.id = authenticated_user_id;

  return query
    select profile.onboarding_completed_at, profile.verification_status
      from public.profiles as profile
     where profile.id = authenticated_user_id;
end;
$$;

revoke all on function private.complete_playbook_onboarding(text, boolean)
  from public, anon, authenticated;
grant execute on function private.complete_playbook_onboarding(text, boolean)
  to authenticated;
