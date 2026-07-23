alter table public.support_invitations
add column if not exists invited_role text;

update public.support_invitations
set invited_role = case relationship
  when 'parent_guardian' then 'family'
  when 'educator' then 'educator'
  when 'mentor' then 'mentor'
  when 'district_admin' then 'district'
  when 'university_partner' then 'college-coach'
  when 'employer_partner' then 'employer'
  else 'scholar'
end
where invited_role is null;

alter table public.support_invitations
alter column invited_role set not null;

comment on column public.support_invitations.invited_role is
'Canonical Playbook onboarding role the invitee must complete before relationship activation.';
