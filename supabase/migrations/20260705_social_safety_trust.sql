create table if not exists public.moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null,
  target_type text not null check (
    target_type in ('post','comment','profile','event','album')
  ),
  target_id text not null,
  reason text not null,
  detail text,
  status text not null default 'open' check (
    status in ('open','reviewing','resolved','dismissed')
  ),
  resolution_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists moderation_reports_status_idx
on public.moderation_reports(status, created_at desc);


create table if not exists public.user_blocks (
  id uuid primary key default gen_random_uuid(),
  blocker_id uuid not null,
  blocked_user_id uuid not null,
  created_at timestamptz not null default now(),

  constraint user_blocks_not_self
    check (blocker_id <> blocked_user_id),

  constraint user_blocks_unique
    unique(blocker_id, blocked_user_id)
);


create table if not exists public.user_mutes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  muted_user_id uuid not null,
  created_at timestamptz not null default now(),

  constraint user_mutes_not_self
    check (user_id <> muted_user_id),

  constraint user_mutes_unique
    unique(user_id, muted_user_id)
);


create table if not exists public.content_mutes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  target_type text not null check (
    target_type in ('post','comment','event','album')
  ),
  target_id text not null,
  created_at timestamptz not null default now(),

  constraint content_mutes_unique
    unique(user_id, target_type, target_id)
);


create table if not exists public.moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.moderation_reports(id) on delete set null,
  moderator_id uuid not null,
  action_type text not null check (
    action_type in (
      'dismiss',
      'warn',
      'hide_content',
      'restore_content',
      'restrict_user',
      'resolve'
    )
  ),
  target_type text not null,
  target_id text not null,
  note text,
  created_at timestamptz not null default now()
);


alter table public.moderation_reports enable row level security;
alter table public.user_blocks enable row level security;
alter table public.user_mutes enable row level security;
alter table public.content_mutes enable row level security;
alter table public.moderation_actions enable row level security;


drop policy if exists "Users create own reports" on public.moderation_reports;
create policy "Users create own reports"
on public.moderation_reports
for insert
to authenticated
with check (auth.uid() = reporter_id);


drop policy if exists "Users view own reports" on public.moderation_reports;
create policy "Users view own reports"
on public.moderation_reports
for select
to authenticated
using (auth.uid() = reporter_id);


drop policy if exists "Users manage own blocks" on public.user_blocks;
create policy "Users manage own blocks"
on public.user_blocks
for all
to authenticated
using (auth.uid() = blocker_id)
with check (auth.uid() = blocker_id);


drop policy if exists "Users manage own mutes" on public.user_mutes;
create policy "Users manage own mutes"
on public.user_mutes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);


drop policy if exists "Users manage own content mutes" on public.content_mutes;
create policy "Users manage own content mutes"
on public.content_mutes
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
