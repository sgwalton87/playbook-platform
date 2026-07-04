create table if not exists public.playbook_events (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  scholar_id text not null,
  actor_id uuid,
  actor_role text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  scholar_id text,
  type text not null,
  title text not null,
  body text not null,
  href text not null,
  priority text not null default 'medium',
  read boolean not null default false,
  delivery_status text not null default 'in_app',
  source_event_id uuid,
  created_at timestamptz not null default now()
);

alter table public.playbook_events enable row level security;
alter table public.notifications enable row level security;
