alter table public.profiles
add column if not exists requested_role text,
add column if not exists verification_status text default 'email_confirmed',
add column if not exists onboarding_completed boolean default false,
add column if not exists onboarding_completed_at timestamptz,
add column if not exists onboarding_data jsonb default '{}'::jsonb,
add column if not exists public_profile_complete boolean default false;
