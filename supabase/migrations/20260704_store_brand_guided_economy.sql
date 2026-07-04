create table if not exists public.guided_tour_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null,
  completed_step_ids jsonb not null default '[]'::jsonb,
  skipped boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.store_products (
  id uuid primary key default gen_random_uuid(),
  product_key text not null unique,
  name text not null,
  category text not null,
  coin_price integer not null,
  partner_id text,
  inventory integer not null default 0,
  requires_approval boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.store_redemptions (
  id uuid primary key default gen_random_uuid(),
  scholar_id uuid not null,
  product_id uuid not null references public.store_products(id),
  coins_spent integer not null,
  fulfillment_status text not null default 'pending',
  shipping_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.brand_partners (
  id uuid primary key default gen_random_uuid(),
  partner_key text not null unique,
  name text not null,
  category text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.nil_store_campaigns (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid references public.brand_partners(id),
  store_product_id uuid references public.store_products(id),
  scholar_id uuid not null,
  athlete_profile_id uuid,
  nil_deal_id uuid,
  status text not null default 'review',
  deliverables jsonb not null default '[]'::jsonb,
  disclosure_required boolean not null default true,
  disclosure_approved boolean not null default false,
  athlete_approved boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.guided_tour_progress enable row level security;
alter table public.store_products enable row level security;
alter table public.store_redemptions enable row level security;
alter table public.brand_partners enable row level security;
alter table public.nil_store_campaigns enable row level security;
