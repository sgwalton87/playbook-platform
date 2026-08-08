create table if not exists public.pbos_notifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  scholar_id uuid references auth.users(id) on delete cascade, type text not null, title text not null, body text not null,
  href text not null check (href like '/%'), priority text not null default 'medium' check (priority in ('low','medium','high','urgent')),
  read boolean not null default false, delivery_status text not null default 'in_app', source_event_key text not null,
  acknowledged_at timestamptz, provenance jsonb not null default '[]'::jsonb, created_at timestamptz not null default now(),
  unique(user_id,source_event_key)
);
create table if not exists public.pbos_notification_outbox (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null, event_key text not null, event_type text not null,
  event_payload jsonb not null, state text not null default 'PENDING' check (state in ('PENDING','DELIVERED','FAILED','SUPPRESSED','DIGEST_QUEUED')),
  attempt_count integer not null default 0 check (attempt_count>=0), last_error text, next_attempt_at timestamptz,
  processed_at timestamptz, created_at timestamptz not null default now(), unique(owner_id,event_key)
);
create table if not exists public.pbos_notification_preferences (
  owner_id uuid not null, notification_type text not null, mode text not null default 'immediate'
    check (mode in ('immediate','daily_digest','weekly_digest','muted')), updated_at timestamptz not null default now(),
  primary key(owner_id,notification_type)
);
create index if not exists pbos_notification_retry_idx on public.pbos_notification_outbox(state,next_attempt_at);
alter table public.pbos_notifications enable row level security;
alter table public.pbos_notification_outbox enable row level security;
alter table public.pbos_notification_preferences enable row level security;
drop policy if exists "Owners manage PBOS notifications" on public.pbos_notifications;
create policy "Owners manage PBOS notifications" on public.pbos_notifications for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
drop policy if exists "Owners manage notification outbox" on public.pbos_notification_outbox;
create policy "Owners manage notification outbox" on public.pbos_notification_outbox for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
drop policy if exists "Owners manage notification preferences" on public.pbos_notification_preferences;
create policy "Owners manage notification preferences" on public.pbos_notification_preferences for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
