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
create policy "brand_evidence_owner_delete" on storage.objects for delete to authenticated
using (bucket_id='brand-verification-evidence' and (storage.foldername(name))[1]=(select auth.uid())::text);
