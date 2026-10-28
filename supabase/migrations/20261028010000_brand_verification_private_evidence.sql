-- Private business evidence: uploaded documentation supports review but never grants authority.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('brand-verification-evidence','brand-verification-evidence',false,5242880,
  array['application/pdf','image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=false,file_size_limit=5242880,
  allowed_mime_types=excluded.allowed_mime_types;

create policy "brand_evidence_owner_insert" on storage.objects for insert to authenticated
with check (
 bucket_id='brand-verification-evidence'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists (
  select 1 from public.profiles p where p.id=(select auth.uid())
    and coalesce(p.profile_mode,p.role::text)='brand-partner'
 )
);
create policy "brand_evidence_owner_read" on storage.objects for select to authenticated
using (bucket_id='brand-verification-evidence' and (storage.foldername(name))[1]=(select auth.uid())::text);
-- Reviewers may read submitted evidence through the existing narrowly governed
-- verification-reviewer authority; they cannot upload, replace or delete it.
create policy "brand_evidence_reviewer_read" on storage.objects for select to authenticated
using (
  bucket_id='brand-verification-evidence'
  and exists (select 1 from public.profiles reviewer where reviewer.id=(select auth.uid()) and reviewer.role in ('founder','admin'))
);

create policy "brand_evidence_owner_delete" on storage.objects for delete to authenticated
using (bucket_id='brand-verification-evidence' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Public-facing organization logos are distinct from private verification evidence.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('brand-organization-logos','brand-organization-logos',true,3145728,
  array['image/png','image/jpeg','image/webp'])
on conflict (id) do update set public=true,file_size_limit=3145728,
  allowed_mime_types=excluded.allowed_mime_types;

create policy "brand_logo_owner_insert" on storage.objects for insert to authenticated
with check (
 bucket_id='brand-organization-logos'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists (select 1 from public.profiles p where p.id=(select auth.uid())
   and coalesce(p.profile_mode,p.role::text)='brand-partner')
);
create policy "brand_logo_owner_read" on storage.objects for select to authenticated
using (bucket_id='brand-organization-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "brand_logo_owner_delete" on storage.objects for delete to authenticated
using (bucket_id='brand-organization-logos' and (storage.foldername(name))[1]=(select auth.uid())::text);

-- Scope legacy application-document storage to the same onboarded learner and
-- owned workspace without invoking a private non-executable helper from RLS.
-- Other application workspace/table policies still retain their private helper.
drop policy if exists "application-document-storage-own" on storage.objects;
create policy "application-document-storage-own" on storage.objects
for all to authenticated
using (
 bucket_id='application-documents'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists (select 1 from public.profiles p where p.id=(select auth.uid())
   and coalesce(p.profile_mode,p.role::text) in ('scholar','scholar-athlete','transition-youth')
   and p.onboarding_completed is true)
 and exists (select 1 from public.application_workspaces w
   where w.id::text=(storage.foldername(name))[2]
   and w.scholar_id=(select auth.uid()))
)
with check (
 bucket_id='application-documents'
 and (storage.foldername(name))[1]=(select auth.uid())::text
 and exists (select 1 from public.profiles p where p.id=(select auth.uid())
   and coalesce(p.profile_mode,p.role::text) in ('scholar','scholar-athlete','transition-youth')
   and p.onboarding_completed is true)
 and exists (select 1 from public.application_workspaces w
   where w.id::text=(storage.foldername(name))[2]
   and w.scholar_id=(select auth.uid()))
);
-- Reviewer reads require an authenticated founder/admin subject; direct review
-- decisions continue to be checked by governed review functions.
-- Fail closed at the database boundary: no direct reviewer RPC or alternate
-- application code path may approve a Brand Partner without stored evidence.
-- This trigger does not alter or downgrade already-approved historical rows.
create or replace function private.require_brand_partner_evidence_before_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'approved'
     and (TG_OP = 'INSERT' or old.status is distinct from 'approved') then
    if not exists (
      select 1 from storage.objects evidence
       where evidence.bucket_id = 'brand-verification-evidence'
         and evidence.name ~ (
           '^' || new.brand_user_id::text ||
           '/(letterhead|business-card)-[0-9a-f-]+\.(pdf|png|jpg|webp)$'
         )
    ) then
      raise exception 'Company letterhead or a business card is required before Brand Partner approval'
        using errcode = '23514';
    end if;
  end if;
  return new;
end;
$$;
revoke all on function private.require_brand_partner_evidence_before_approval()
  from public, anon, authenticated;
drop trigger if exists brand_evidence_before_approval on public.brand_partner_verification_requests;
create trigger brand_evidence_before_approval
before insert or update of status on public.brand_partner_verification_requests
for each row execute function private.require_brand_partner_evidence_before_approval();
