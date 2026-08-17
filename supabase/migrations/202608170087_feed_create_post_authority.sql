-- Phase 6 Feed baseline reconciliation + Create Post authority hardening.
-- Production already owns feed_posts, while historical repository migrations did
-- not create it from zero. Reconcile the production-compatible canonical shape
-- when absent, preserve existing rows when present, then harden creation authority.

create table if not exists public.feed_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  post_type text not null,
  title text,
  body text,
  image_url text,
  created_at timestamptz default now(),
  visibility text default 'public',
  media_url text,
  media_type text,
  album_id uuid
);

-- Preserve compatibility if a partially historical Feed table is encountered.
alter table public.feed_posts add column if not exists user_id uuid;
alter table public.feed_posts add column if not exists post_type text;
alter table public.feed_posts add column if not exists title text;
alter table public.feed_posts add column if not exists body text;
alter table public.feed_posts add column if not exists image_url text;
alter table public.feed_posts add column if not exists created_at timestamptz default now();
alter table public.feed_posts add column if not exists visibility text default 'public';
alter table public.feed_posts add column if not exists media_url text;
alter table public.feed_posts add column if not exists media_type text;
alter table public.feed_posts add column if not exists album_id uuid;

-- Reconcile the production foreign-key lineage without duplicating constraints.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.feed_posts'::regclass
      and conname='feed_posts_user_id_fkey'
  ) then
    alter table public.feed_posts
      add constraint feed_posts_user_id_fkey
      foreign key (user_id) references public.profiles(id) on delete cascade;
  end if;

  if to_regclass('public.albums') is not null
     and not exists (
       select 1 from pg_constraint
       where conrelid='public.feed_posts'::regclass
         and conname='feed_posts_album_id_fkey'
     ) then
    alter table public.feed_posts
      add constraint feed_posts_album_id_fkey
      foreign key (album_id) references public.albums(id) on delete set null;
  end if;
end;
$$;

alter table public.feed_posts enable row level security;

alter table public.feed_posts
  alter column user_id set not null,
  alter column post_type set not null,
  alter column visibility set default 'public';

alter table public.feed_posts drop constraint if exists feed_posts_post_type_nonempty_check;
alter table public.feed_posts add constraint feed_posts_post_type_nonempty_check
  check (char_length(btrim(post_type)) > 0);

alter table public.feed_posts drop constraint if exists feed_posts_visibility_check;
alter table public.feed_posts add constraint feed_posts_visibility_check
  check (visibility in ('public','private'));

alter table public.feed_posts drop constraint if exists feed_posts_content_present_check;
alter table public.feed_posts add constraint feed_posts_content_present_check
  check (
    nullif(btrim(coalesce(body,'')),'') is not null
    or nullif(btrim(coalesce(image_url,'')),'') is not null
    or nullif(btrim(coalesce(media_url,'')),'') is not null
  );

-- Reconcile read authority because migration 030 could only harden feed_posts when
-- the legacy table already existed. Fresh replays now receive the same canonical surface.
do $$
declare policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname='public'
      and tablename='feed_posts'
      and cmd='SELECT'
  loop
    execute format('drop policy if exists %I on public.feed_posts', policy_record.policyname);
  end loop;
end;
$$;

create policy feed_posts_select_public
on public.feed_posts
for select
to anon, authenticated
using (visibility='public');

create policy feed_posts_select_owner
on public.feed_posts
for select
to authenticated
using ((select auth.uid())=user_id);

-- Remove every historical INSERT policy, regardless of name, then recreate one canonical policy.
do $$
declare policy_record record;
begin
  for policy_record in
    select policyname
    from pg_policies
    where schemaname='public'
      and tablename='feed_posts'
      and cmd='INSERT'
  loop
    execute format('drop policy if exists %I on public.feed_posts', policy_record.policyname);
  end loop;
end;
$$;

create policy feed_posts_insert_owner
on public.feed_posts
for insert
to authenticated
with check ((select auth.uid())=user_id);

-- Explicit table grants match the current Phase 6 surface.
revoke all on public.feed_posts from public, anon, authenticated;
grant select on public.feed_posts to anon, authenticated;
grant insert on public.feed_posts to authenticated;

comment on table public.feed_posts is
  'Canonical Feed post record reconciled from the production-compatible legacy shape into repository-owned migration history.';
comment on policy feed_posts_insert_owner on public.feed_posts is
  'Canonical Create Post boundary: authenticated users may insert only their own Feed posts.';
