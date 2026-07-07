create table if not exists public.onboarding_options (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  value text not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now(),
  unique(type, value)
);

alter table public.onboarding_options enable row level security;

drop policy if exists "Options are viewable by authenticated users" on public.onboarding_options;
create policy "Options are viewable by authenticated users"
on public.onboarding_options
for select
to authenticated
using (true);

drop policy if exists "Authenticated users can add options" on public.onboarding_options;
create policy "Authenticated users can add options"
on public.onboarding_options
for insert
to authenticated
with check (auth.uid() = created_by);
