-- Phase 6 Feed Create Post authority hardening.
-- Preserve canonical feed_posts while removing duplicate/latent mutation surfaces.

alter table public.feed_posts
  alter column user_id set not null,
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
with check ((select auth.uid()) = user_id);

-- Creation is authenticated-only. Edit/Delete get their own dedicated Phase 6 authority later.
revoke insert, update, delete on public.feed_posts from public, anon, authenticated;
grant insert on public.feed_posts to authenticated;

comment on policy feed_posts_insert_owner on public.feed_posts is
  'Canonical Create Post boundary: authenticated users may insert only their own Feed posts.';
