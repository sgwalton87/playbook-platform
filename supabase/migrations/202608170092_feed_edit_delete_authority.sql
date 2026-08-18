-- Phase 6 Feed Edit Post + Delete Post lifecycle authority.
-- Direct table UPDATE/DELETE remain revoked. Authenticated owners mutate through
-- narrow SECURITY DEFINER RPCs with explicit ownership checks.

alter table public.feed_posts
  add column if not exists updated_at timestamptz;

create or replace function public.update_feed_post_owner(
  p_post_id uuid,
  p_body text,
  p_post_type text
)
returns public.feed_posts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  updated_post public.feed_posts;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  if p_post_id is null then
    raise exception 'Post ID is required.' using errcode='22023';
  end if;

  if nullif(btrim(coalesce(p_post_type,'')),'') is null then
    raise exception 'Post category is required.' using errcode='22023';
  end if;

  update public.feed_posts
  set body = btrim(coalesce(p_body,'')),
      post_type = btrim(p_post_type),
      updated_at = now()
  where id = p_post_id
    and user_id = actor_id
  returning * into updated_post;

  if not found then
    raise exception 'Post not found or not owned by current user.' using errcode='42501';
  end if;

  return updated_post;
end;
$$;

create or replace function public.delete_feed_post_owner(p_post_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  deleted_post public.feed_posts;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;

  if p_post_id is null then
    raise exception 'Post ID is required.' using errcode='22023';
  end if;

  delete from public.feed_posts
  where id = p_post_id
    and user_id = actor_id
  returning * into deleted_post;

  if not found then
    raise exception 'Post not found or not owned by current user.' using errcode='42501';
  end if;

  return jsonb_build_object(
    'id', deleted_post.id,
    'image_url', deleted_post.image_url,
    'media_url', deleted_post.media_url,
    'media_type', deleted_post.media_type
  );
end;
$$;

revoke all on function public.update_feed_post_owner(uuid,text,text) from public, anon, authenticated;
revoke all on function public.delete_feed_post_owner(uuid) from public, anon, authenticated;
grant execute on function public.update_feed_post_owner(uuid,text,text) to authenticated;
grant execute on function public.delete_feed_post_owner(uuid) to authenticated;

-- Preserve the hardened table surface: authenticated users still cannot mutate
-- feed_posts directly.
revoke update, delete on table public.feed_posts from public, anon, authenticated;

-- Storage policy surfaces intentionally remain unchanged. Image/video publication
-- buckets remain public-read + owner-upload only. Post-delete media cleanup is a
-- narrow server-side privileged operation after the owner-only canonical delete.

comment on function public.update_feed_post_owner(uuid,text,text) is
  'Owner-only Feed edit authority. Updates body/category while preserving visibility and media.';
comment on function public.delete_feed_post_owner(uuid) is
  'Owner-only Feed deletion authority. Returns canonical media references for immediate server-side cleanup.';
