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
  and (select private.current_user_is_verification_reviewer())
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

-- A pre-existing application-document storage RLS policy references this
-- current-user-only boolean helper. PostgreSQL must be able to evaluate all
-- applicable RLS predicates when any authenticated user accesses storage.
-- EXECUTE reveals only whether the *caller* is an onboarded learner and does
-- not grant access to learner workspaces, documents, or other users' data.
grant execute on function private.current_user_is_onboarded_learner() to authenticated;

-- The private evidence SELECT policy invokes a current-user-only reviewer
-- boolean. Permit predicate evaluation without granting review decisions or
-- unrestricted access to any verification records.
grant execute on function private.current_user_is_verification_reviewer() to authenticated;
