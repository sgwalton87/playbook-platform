-- Canonical learning schema. Store/reward redemption intentionally continues to
-- use the already-governed store_products -> store_redemptions -> coin_ledger
-- authority rather than introducing a parallel economy.
create table if not exists public.learning_courses (
  slug text primary key,
  title text not null,
  description text not null,
  pillar text not null,
  image_url text,
  status text not null default 'published' check (status in ('draft','published','coming_soon','archived')),
  xp_per_module integer not null default 50 check (xp_per_module >= 0),
  coins_per_module integer not null default 20 check (coins_per_module >= 0),
  course_xp_bonus integer not null default 250 check (course_xp_bonus >= 0),
  course_coin_bonus integer not null default 100 check (course_coin_bonus >= 0),
  certificate_name text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_modules (
  id uuid primary key default gen_random_uuid(),
  course_slug text not null references public.learning_courses(slug) on delete cascade,
  module_key text not null,
  position integer not null check (position > 0),
  title text not null,
  duration_minutes integer not null default 15 check (duration_minutes > 0),
  module_type text not null default 'lesson',
  summary text not null,
  content text not null,
  completion_mode text not null default 'acknowledge' check (completion_mode in ('acknowledge','reflection')),
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(course_slug, module_key),
  unique(course_slug, position)
);

create table if not exists public.learning_module_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_slug text not null references public.learning_courses(slug) on delete cascade,
  module_key text not null,
  reflection text,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, course_slug, module_key),
  foreign key (course_slug, module_key) references public.learning_modules(course_slug, module_key) on delete cascade
);

create table if not exists public.learning_credentials (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  course_slug text not null references public.learning_courses(slug) on delete cascade,
  credential_name text not null,
  issued_at timestamptz not null default now(),
  evidence jsonb not null default '{}'::jsonb,
  unique(user_id, course_slug)
);

create table if not exists public.achievement_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  badge_key text not null,
  badge_name text not null,
  description text not null,
  source_type text not null,
  source_id text not null,
  awarded_at timestamptz not null default now(),
  unique(user_id, badge_key, source_id)
);

alter table public.learning_courses enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_module_progress enable row level security;
alter table public.learning_credentials enable row level security;
alter table public.achievement_badges enable row level security;

grant select on public.learning_courses, public.learning_modules to authenticated;
grant select on public.learning_module_progress, public.learning_credentials, public.achievement_badges to authenticated;

drop policy if exists "Authenticated can view published learning courses" on public.learning_courses;
create policy "Authenticated can view published learning courses" on public.learning_courses for select to authenticated
using (status in ('published','coming_soon'));

drop policy if exists "Authenticated can view published learning modules" on public.learning_modules;
create policy "Authenticated can view published learning modules" on public.learning_modules for select to authenticated
using (exists (select 1 from public.learning_courses c where c.slug = learning_modules.course_slug and c.status in ('published','coming_soon')));

drop policy if exists "Users view own learning progress" on public.learning_module_progress;
create policy "Users view own learning progress" on public.learning_module_progress for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users view own learning credentials" on public.learning_credentials;
create policy "Users view own learning credentials" on public.learning_credentials for select to authenticated using (user_id = auth.uid());

drop policy if exists "Users view own achievement badges" on public.achievement_badges;
create policy "Users view own achievement badges" on public.achievement_badges for select to authenticated using (user_id = auth.uid());
