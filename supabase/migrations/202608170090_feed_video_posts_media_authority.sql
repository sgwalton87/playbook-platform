-- Phase 6 Feed Video Posts shared-media authority.
-- Public video publication is intentionally separate from the public photos bucket.

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values (
  'feed-videos',
  'feed-videos',
  true,
  52428800,
  array['video/mp4','video/webm','video/quicktime']::text[]
)
on conflict(id) do update set
  name=excluded.name,
  public=excluded.public,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

-- Reconcile any prior policy experiments into one explicit public-read and one owner-upload boundary.
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and (
        coalesce(qual,'') ilike '%feed-videos%'
        or coalesce(with_check,'') ilike '%feed-videos%'
        or policyname ilike '%video%'
      )
  loop
    execute format('drop policy if exists %I on storage.objects', p.policyname);
  end loop;
end $$;

create policy feed_videos_public_read
on storage.objects
for select
to public
using (bucket_id='feed-videos');

create policy feed_videos_owner_upload
on storage.objects
for insert
to authenticated
with check (
  bucket_id='feed-videos'
  and (storage.foldername(name))[1]=((select auth.uid()))::text
  and (storage.foldername(name))[2]='feed'
);

-- Video Posts use the existing canonical Feed record.
alter table public.feed_posts
  drop constraint if exists feed_posts_media_type_check;

alter table public.feed_posts
  add constraint feed_posts_media_type_check
  check (media_type is null or media_type in ('image','video')) not valid;

alter table public.feed_posts validate constraint feed_posts_media_type_check;

alter table public.feed_posts
  drop constraint if exists feed_posts_video_media_shape_check;

alter table public.feed_posts
  add constraint feed_posts_video_media_shape_check
  check (
    media_type <> 'video'
    or (media_url is not null and image_url is null)
  ) not valid;

alter table public.feed_posts validate constraint feed_posts_video_media_shape_check;
