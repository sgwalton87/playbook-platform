create table if not exists public.feed_post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid not null,
  reaction text not null default 'like',
  created_at timestamptz not null default now(),
  unique(post_id, user_id, reaction)
);

create table if not exists public.feed_post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  user_id uuid not null,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.feed_post_reactions enable row level security;
alter table public.feed_post_comments enable row level security;

drop policy if exists "Users can view feed reactions" on public.feed_post_reactions;
create policy "Users can view feed reactions"
on public.feed_post_reactions for select
to authenticated
using (true);

drop policy if exists "Users can manage own feed reactions" on public.feed_post_reactions;
create policy "Users can manage own feed reactions"
on public.feed_post_reactions for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can view feed comments" on public.feed_post_comments;
create policy "Users can view feed comments"
on public.feed_post_comments for select
to authenticated
using (true);

drop policy if exists "Users can create own feed comments" on public.feed_post_comments;
create policy "Users can create own feed comments"
on public.feed_post_comments for insert
to authenticated
with check (auth.uid() = user_id);
