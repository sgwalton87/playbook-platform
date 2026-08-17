-- Phase 6 Feed Comments + Likes authority reconciliation.
-- Production drift currently lacks these tables even though the committed historical
-- chain and UI/API surfaces expect them. Recreate/preserve canonically, then harden.

create table if not exists public.feed_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.feed_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid not null,
  reaction text not null default 'like',
  created_at timestamptz not null default now()
);

alter table public.feed_post_comments add column if not exists updated_at timestamptz;
update public.feed_post_comments set updated_at=coalesce(updated_at,created_at,now()) where updated_at is null;
alter table public.feed_post_comments alter column updated_at set default now();
alter table public.feed_post_comments alter column updated_at set not null;

-- Canonical referential lineage.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.feed_post_comments'::regclass
      and conname='feed_post_comments_post_id_fkey'
  ) then
    alter table public.feed_post_comments
      add constraint feed_post_comments_post_id_fkey
      foreign key(post_id) references public.feed_posts(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.feed_post_comments'::regclass
      and conname='feed_post_comments_user_id_fkey'
  ) then
    alter table public.feed_post_comments
      add constraint feed_post_comments_user_id_fkey
      foreign key(user_id) references public.profiles(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.feed_post_reactions'::regclass
      and conname='feed_post_reactions_post_id_fkey'
  ) then
    alter table public.feed_post_reactions
      add constraint feed_post_reactions_post_id_fkey
      foreign key(post_id) references public.feed_posts(id) on delete cascade;
  end if;
  if not exists (
    select 1 from pg_constraint
    where conrelid='public.feed_post_reactions'::regclass
      and conname='feed_post_reactions_user_id_fkey'
  ) then
    alter table public.feed_post_reactions
      add constraint feed_post_reactions_user_id_fkey
      foreign key(user_id) references public.profiles(id) on delete cascade;
  end if;
end;
$$;

alter table public.feed_post_comments drop constraint if exists feed_post_comments_body_check;
alter table public.feed_post_comments add constraint feed_post_comments_body_check
  check (char_length(btrim(body)) between 1 and 4000);

alter table public.feed_post_reactions drop constraint if exists feed_post_reactions_reaction_check;
alter table public.feed_post_reactions add constraint feed_post_reactions_reaction_check
  check (reaction='like');

create unique index if not exists feed_post_reactions_one_like_per_user_post
  on public.feed_post_reactions(post_id,user_id)
  where reaction='like';

alter table public.feed_post_comments enable row level security;
alter table public.feed_post_reactions enable row level security;

-- Reconcile all historical policies on these two tables.
do $$
declare policy_record record;
begin
  for policy_record in select policyname from pg_policies where schemaname='public' and tablename='feed_post_comments'
  loop execute format('drop policy if exists %I on public.feed_post_comments',policy_record.policyname); end loop;
  for policy_record in select policyname from pg_policies where schemaname='public' and tablename='feed_post_reactions'
  loop execute format('drop policy if exists %I on public.feed_post_reactions',policy_record.policyname); end loop;
end;
$$;

create policy feed_comments_select_visible_post
on public.feed_post_comments for select to authenticated
using (
  exists (
    select 1 from public.feed_posts fp
    where fp.id=feed_post_comments.post_id
      and (fp.visibility='public' or fp.user_id=(select auth.uid()))
  )
);

create policy feed_comments_insert_owner_visible_post
on public.feed_post_comments for insert to authenticated
with check (
  user_id=(select auth.uid())
  and exists (
    select 1 from public.feed_posts fp
    where fp.id=feed_post_comments.post_id
      and (fp.visibility='public' or fp.user_id=(select auth.uid()))
  )
);

create policy feed_comments_update_owner
on public.feed_post_comments for update to authenticated
using (user_id=(select auth.uid()))
with check (user_id=(select auth.uid()));

create policy feed_comments_delete_owner
on public.feed_post_comments for delete to authenticated
using (user_id=(select auth.uid()));

create policy feed_reactions_select_visible_post
on public.feed_post_reactions for select to authenticated
using (
  exists (
    select 1 from public.feed_posts fp
    where fp.id=feed_post_reactions.post_id
      and (fp.visibility='public' or fp.user_id=(select auth.uid()))
  )
);

create policy feed_reactions_insert_owner_visible_post
on public.feed_post_reactions for insert to authenticated
with check (
  user_id=(select auth.uid())
  and reaction='like'
  and exists (
    select 1 from public.feed_posts fp
    where fp.id=feed_post_reactions.post_id
      and (fp.visibility='public' or fp.user_id=(select auth.uid()))
  )
);

create policy feed_reactions_delete_owner
on public.feed_post_reactions for delete to authenticated
using (user_id=(select auth.uid()));

-- Explicit least-privilege table grants.
revoke all on public.feed_post_comments from public,anon,authenticated;
grant select,insert,update,delete on public.feed_post_comments to authenticated;

revoke all on public.feed_post_reactions from public,anon,authenticated;
grant select,insert,delete on public.feed_post_reactions to authenticated;

comment on table public.feed_post_comments is
  'Canonical Feed comments. Social visibility inherits the parent Feed post boundary.';
comment on table public.feed_post_reactions is
  'Canonical Feed reactions. Phase 6 currently supports one like per user/post.';
