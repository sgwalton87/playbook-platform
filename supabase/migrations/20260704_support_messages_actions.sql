create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  sender_id uuid,
  sender_role text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.shared_actions (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  assigned_role text not null,
  title text not null,
  detail text,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'complete')),
  due_date date,
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;
alter table public.shared_actions enable row level security;
