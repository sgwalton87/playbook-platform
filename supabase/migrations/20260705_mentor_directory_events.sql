create table if not exists public.support_directory_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  role text not null,
  display_name text not null,
  organization text,
  expertise text[] not null default '{}',
  searchable boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.community_events (
  id uuid primary key default gen_random_uuid(),
  created_by uuid,
  title text not null,
  description text,
  event_type text not null default 'community',
  location text,
  starts_at timestamptz,
  ends_at timestamptz,
  visibility text not null default 'public',
  created_at timestamptz not null default now()
);

create table if not exists public.community_event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.community_events(id) on delete cascade,
  user_id uuid not null,
  status text not null default 'going',
  created_at timestamptz not null default now(),
  unique(event_id,user_id)
);

alter table public.support_directory_profiles enable row level security;
alter table public.community_events enable row level security;
alter table public.community_event_rsvps enable row level security;

create policy "Read searchable directory"
on public.support_directory_profiles for select to authenticated
using (searchable=true or auth.uid()=user_id);

create policy "Users manage own directory profile"
on public.support_directory_profiles for all to authenticated
using (auth.uid()=user_id)
with check (auth.uid()=user_id);

create policy "Read public events"
on public.community_events for select to authenticated
using (visibility='public' or auth.uid()=created_by);

create policy "Users manage own rsvps"
on public.community_event_rsvps for all to authenticated
using (auth.uid()=user_id)
with check (auth.uid()=user_id);
