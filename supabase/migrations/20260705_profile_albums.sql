create table if not exists public.profile_albums (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  description text,
  category text not null default 'story',
  visibility text not null default 'public',
  cover_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz
);

create table if not exists public.profile_album_photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.profile_albums(id) on delete cascade,
  user_id uuid not null,
  image_url text not null,
  caption text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profile_albums enable row level security;
alter table public.profile_album_photos enable row level security;

create policy "Users can read public albums"
on public.profile_albums for select to authenticated
using (visibility='public' or auth.uid()=user_id);

create policy "Users manage own albums"
on public.profile_albums for all to authenticated
using (auth.uid()=user_id)
with check (auth.uid()=user_id);

create policy "Users can read album photos"
on public.profile_album_photos for select to authenticated
using (true);

create policy "Users manage own album photos"
on public.profile_album_photos for all to authenticated
using (auth.uid()=user_id)
with check (auth.uid()=user_id);
