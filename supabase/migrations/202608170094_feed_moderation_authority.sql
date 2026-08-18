-- Phase 6 Feed Moderation.
-- Reuses canonical moderation_reports/moderation_actions while adding only the
-- current publication-enforcement state required for deterministic Feed reads.

alter table public.feed_posts
  add column if not exists moderation_state text not null default 'visible',
  add column if not exists moderation_updated_at timestamptz,
  add column if not exists moderation_updated_by uuid references public.profiles(id) on delete set null;

alter table public.feed_posts
  drop constraint if exists feed_posts_moderation_state_check;
alter table public.feed_posts
  add constraint feed_posts_moderation_state_check
  check (moderation_state in ('visible','hidden'));

-- Public visibility must honor both user publication choice and moderation.
drop policy if exists feed_posts_select_public on public.feed_posts;
create policy feed_posts_select_public
on public.feed_posts
for select
to anon, authenticated
using (visibility = 'public' and moderation_state = 'visible');

-- Owner transparency remains unchanged: authors can still see their own hidden post.
drop policy if exists feed_posts_select_owner on public.feed_posts;
create policy feed_posts_select_owner
on public.feed_posts
for select
to authenticated
using ((select auth.uid()) = user_id);

-- Moderators need review access to hidden Feed targets, but this does not grant
-- generic mutation authority.
drop policy if exists feed_posts_select_moderator on public.feed_posts;
create policy feed_posts_select_moderator
on public.feed_posts
for select
to authenticated
using ((select private.current_user_is_platform_moderator()));

create or replace function public.moderate_feed_post(
  p_post_id uuid,
  p_action text,
  p_report_id uuid default null,
  p_note text default null
)
returns public.feed_posts
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  actor_id uuid := auth.uid();
  next_state text;
  target_post public.feed_posts;
  target_report public.moderation_reports;
begin
  if actor_id is null then
    raise exception 'Authentication required.' using errcode='42501';
  end if;
  if not private.current_user_is_platform_moderator() then
    raise exception 'Moderator authority required.' using errcode='42501';
  end if;
  if p_post_id is null then
    raise exception 'Post ID is required.' using errcode='22023';
  end if;
  if p_action not in ('hide_content','restore_content') then
    raise exception 'Unsupported Feed moderation action.' using errcode='22023';
  end if;

  select * into target_post from public.feed_posts where id = p_post_id;
  if not found then
    raise exception 'Feed post not found.' using errcode='P0002';
  end if;

  if p_report_id is not null then
    select * into target_report
    from public.moderation_reports
    where id = p_report_id
      and target_type = 'post'
      and target_id = p_post_id::text;
    if not found then
      raise exception 'Moderation report does not match Feed post.' using errcode='22023';
    end if;
  end if;

  next_state := case when p_action='hide_content' then 'hidden' else 'visible' end;

  update public.feed_posts
  set moderation_state = next_state,
      moderation_updated_at = now(),
      moderation_updated_by = actor_id
  where id = p_post_id
  returning * into target_post;

  insert into public.moderation_actions(
    report_id, moderator_id, action_type, target_type, target_id, note
  ) values (
    p_report_id, actor_id, p_action, 'post', p_post_id::text, nullif(btrim(coalesce(p_note,'')),'')
  );

  if p_report_id is not null then
    update public.moderation_reports
    set status='resolved',
        resolution_note=nullif(btrim(coalesce(p_note,'')),''),
        reviewed_by=actor_id,
        reviewed_at=now()
    where id=p_report_id;
  end if;

  return target_post;
end;
$$;

revoke all on function public.moderate_feed_post(uuid,text,uuid,text) from public, anon, authenticated;
grant execute on function public.moderate_feed_post(uuid,text,uuid,text) to authenticated;

-- Preserve direct table hardening. Authenticated clients cannot directly edit
-- moderation state (or any Feed row) outside governed owner/moderator functions.
revoke update on table public.feed_posts from public, anon, authenticated;

comment on function public.moderate_feed_post(uuid,text,uuid,text) is
  'Founder/Admin-only Feed hide/restore authority. Atomically updates publication enforcement and appends moderation audit evidence.';