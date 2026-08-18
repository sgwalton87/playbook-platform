-- Phase 6 Feed Shares authority.
-- Share completion is an append-only audit record over canonical public Feed posts.

create table if not exists public.feed_post_shares (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.feed_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  channel text not null,
  created_at timestamptz not null default now(),
  constraint feed_post_shares_channel_check check (channel in ('native','copy_link'))
);

alter table public.feed_post_shares enable row level security;

-- Reconcile policy surface deterministically.
do $$
declare p record;
begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='feed_post_shares'
  loop
    execute format('drop policy if exists %I on public.feed_post_shares',p.policyname);
  end loop;
end $$;

create policy feed_post_shares_select_owner
on public.feed_post_shares
for select
to authenticated
using (user_id=(select auth.uid()));

create policy feed_post_shares_insert_owner_public_post
on public.feed_post_shares
for insert
to authenticated
with check (
  user_id=(select auth.uid())
  and exists (
    select 1 from public.feed_posts fp
    where fp.id=feed_post_shares.post_id
      and fp.visibility='public'
  )
);

revoke all on table public.feed_post_shares from public,anon,authenticated;
grant select,insert on table public.feed_post_shares to authenticated;
