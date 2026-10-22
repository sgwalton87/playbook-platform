-- P0: stop legacy auth.users insert trigger from silently assigning Scholar-Athlete.
-- Role authority still governed by the verified initialize_playbook_profile RPC.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  selected_role text;
begin
  selected_role := private.normalize_playbook_profile_role(
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'profile_mode'),''),
      nullif(trim(new.raw_user_meta_data->>'role'),''),
      nullif(trim(new.raw_user_meta_data->>'requested_role'),'')
    )
  );
  -- OAuth and external identities without a selected pathway are not silently
  -- assigned Scholar-Athlete. Verified callback RPC will create their profile
  -- after a canonical role has been selected.
  if selected_role is null then
    return new;
  end if;
  insert into public.profiles (
    id, email, username, full_name, coin_balance, badges,
    role, profile_mode, requested_role, verification_status,
    onboarding_completed, created_at
  ) values (
    new.id, new.email,
    coalesce(new.raw_user_meta_data->>'username',''),
    coalesce(new.raw_user_meta_data->>'full_name',''),
    0, '{}',
    selected_role, selected_role, selected_role, 'email_pending',
    false, now()
  );
  return new;
end;
$$;