-- Phase 6 Feed Image Posts shared-media authority.
-- Reconcile the public photos bucket into repository-owned configuration while
-- preserving existing objects and restricting uploads to authenticated owners.

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values (
  'photos',
  'photos',
  true,
  10485760,
  array['image/jpeg','image/png','image/webp']::text[]
)
on conflict(id) do update set
  name=excluded.name,
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types,
  updated_at=now();

-- Remove historical SELECT policies whose scope includes the photos bucket.
do $$
declare policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and cmd='SELECT'
      and coalesce(qual,'') ilike '%photos%'
  loop
    execute format('drop policy if exists %I on storage.objects', policy_record.policyname);
  end loop;
end;
$$;

create policy photos_public_read
on storage.objects
for select
to public
using (bucket_id='photos');

-- Remove historical INSERT policies whose scope includes the photos bucket.
do $$
declare policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and cmd='INSERT'
      and coalesce(with_check,'') ilike '%photos%'
  loop
    execute format('drop policy if exists %I on storage.objects', policy_record.policyname);
  end loop;
end;
$$;

create policy photos_owner_upload
on storage.objects
for insert
to authenticated
with check (
  bucket_id='photos'
  and (storage.foldername(name))[1]=(select auth.uid())::text
  and (storage.foldername(name))[2] in ('feed','gallery')
);

comment on policy photos_public_read on storage.objects is
  'Canonical public-read boundary for intentionally published Playbook photos.';
comment on policy photos_owner_upload on storage.objects is
  'Canonical Image Posts upload boundary: authenticated users may upload only to their own feed/gallery namespace.';
