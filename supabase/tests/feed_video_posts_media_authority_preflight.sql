\set ON_ERROR_STOP on
begin;

do $$
declare
  bucket_record record;
  policy_count integer;
  video_constraint_count integer;
begin
  select id,name,public,file_size_limit,allowed_mime_types
    into bucket_record
  from storage.buckets
  where id='feed-videos';

  if bucket_record.id is null then
    raise exception 'feed-videos bucket is missing.';
  end if;
  if bucket_record.public is distinct from true then
    raise exception 'feed-videos bucket must be explicitly public for public Video Posts.';
  end if;
  if bucket_record.file_size_limit is distinct from 52428800 then
    raise exception 'feed-videos bucket must enforce a 50 MiB limit.';
  end if;
  if bucket_record.allowed_mime_types is distinct from array['video/mp4','video/webm','video/quicktime']::text[] then
    raise exception 'feed-videos MIME allowlist is incorrect: %.', bucket_record.allowed_mime_types;
  end if;

  select count(*) into policy_count
  from pg_policies
  where schemaname='storage'
    and tablename='objects'
    and (coalesce(qual,'') ilike '%feed-videos%' or coalesce(with_check,'') ilike '%feed-videos%');
  if policy_count<>2 then
    raise exception 'feed-videos must expose exactly two canonical object policies; got %.', policy_count;
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname='feed_videos_public_read' and cmd='SELECT'
      and roles='{public}'
      and qual ilike '%feed-videos%'
  ) then
    raise exception 'feed-videos public-read policy is missing.';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='storage' and tablename='objects'
      and policyname='feed_videos_owner_upload' and cmd='INSERT'
      and roles='{authenticated}'
      and with_check ilike '%auth.uid%'
      and with_check ilike '%feed%'
  ) then
    raise exception 'feed-videos owner upload policy is missing or not namespaced.';
  end if;

  select count(*) into video_constraint_count
  from pg_constraint
  where conrelid='public.feed_posts'::regclass
    and conname in ('feed_posts_media_type_check','feed_posts_video_media_shape_check')
    and convalidated;
  if video_constraint_count<>2 then
    raise exception 'Feed video media constraints are incomplete or unvalidated.';
  end if;
end;
$$;

insert into auth.users(id,email)
values ('00000000-0000-0000-0000-00000000f501','feed-video-owner@example.invalid')
on conflict(id) do nothing;

insert into public.profiles(id,username,full_name,profile_visibility)
values ('00000000-0000-0000-0000-00000000f501','feed-video-owner','Feed Video Owner','private')
on conflict(id) do update set username=excluded.username,full_name=excluded.full_name;

insert into public.feed_posts(id,user_id,post_type,body,media_url,media_type,visibility)
values (
  '00000000-0000-0000-0000-00000000f511',
  '00000000-0000-0000-0000-00000000f501',
  'community',
  'Video preflight',
  'https://example.invalid/video.mp4',
  'video',
  'public'
);

do $$
begin
  if not exists (
    select 1 from public.feed_posts
    where id='00000000-0000-0000-0000-00000000f511'
      and media_type='video'
      and media_url is not null
      and image_url is null
  ) then
    raise exception 'Canonical Video Post shape was not persisted.';
  end if;

  begin
    insert into public.feed_posts(id,user_id,post_type,body,image_url,media_url,media_type,visibility)
    values (
      '00000000-0000-0000-0000-00000000f512',
      '00000000-0000-0000-0000-00000000f501',
      'community',
      'Invalid mixed-media preflight',
      'https://example.invalid/image.jpg',
      'https://example.invalid/video.mp4',
      'video',
      'public'
    );
    raise exception 'Video Post incorrectly allowed image_url and media_url together.';
  exception when check_violation then null;
  end;

  begin
    insert into public.feed_posts(id,user_id,post_type,body,media_url,media_type,visibility)
    values (
      '00000000-0000-0000-0000-00000000f513',
      '00000000-0000-0000-0000-00000000f501',
      'community',
      'Invalid media type preflight',
      'https://example.invalid/file.bin',
      'audio',
      'public'
    );
    raise exception 'Unsupported Feed media_type was allowed.';
  exception when check_violation then null;
  end;
end;
$$;

rollback;
