\set ON_ERROR_STOP on
begin;

do $$
declare
  bucket_public boolean;
  bucket_limit bigint;
  bucket_mimes text[];
  read_policy_count integer;
  upload_policy_count integer;
  upload_roles name[];
  upload_check text;
begin
  select public,file_size_limit,allowed_mime_types
    into bucket_public,bucket_limit,bucket_mimes
  from storage.buckets
  where id='photos';

  if bucket_public is distinct from true then
    raise exception 'photos bucket must be public-read.';
  end if;
  if bucket_limit is distinct from 10485760 then
    raise exception 'photos bucket must enforce a 10 MiB file-size limit; got %.', bucket_limit;
  end if;
  if bucket_mimes is distinct from array['image/jpeg','image/png','image/webp']::text[] then
    raise exception 'photos bucket MIME allowlist is incorrect: %.', bucket_mimes;
  end if;

  select count(*) into read_policy_count
  from pg_policies
  where schemaname='storage'
    and tablename='objects'
    and cmd='SELECT'
    and coalesce(qual,'') ilike '%photos%';
  if read_policy_count<>1 then
    raise exception 'photos must expose exactly one SELECT policy; got %.', read_policy_count;
  end if;

  select count(*) into upload_policy_count
  from pg_policies
  where schemaname='storage'
    and tablename='objects'
    and cmd='INSERT'
    and coalesce(with_check,'') ilike '%photos%';
  if upload_policy_count<>1 then
    raise exception 'photos must expose exactly one INSERT policy; got %.', upload_policy_count;
  end if;

  select roles,with_check into upload_roles,upload_check
  from pg_policies
  where schemaname='storage'
    and tablename='objects'
    and cmd='INSERT'
    and coalesce(with_check,'') ilike '%photos%'
  limit 1;

  if upload_roles<>array['authenticated'::name] then
    raise exception 'photos upload policy must be authenticated-only.';
  end if;
  if upload_check !~ 'auth.uid' or upload_check !~ 'foldername' or upload_check !~ 'feed' or upload_check !~ 'gallery' then
    raise exception 'photos upload policy must enforce owner feed/gallery namespace.';
  end if;

  if exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and cmd in ('UPDATE','DELETE')
      and (
        coalesce(qual,'') ilike '%photos%'
        or coalesce(with_check,'') ilike '%photos%'
      )
  ) then
    raise exception 'Image Posts shall not receive UPDATE/DELETE Storage policies in this task.';
  end if;
end;
$$;

rollback;
