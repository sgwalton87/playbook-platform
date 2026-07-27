-- PBOS-RLS-001
-- Restored canonical profiles foundation
-- Source: remote Supabase schema recovery 2026-07-27

CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    username text,
    full_name text,
    role text DEFAULT 'scholar_athlete'::public.member_role NOT NULL,
    avatar_url text,
    cover_url text,
    bio text,
    location text,
    school text,
    sport text,
    grad_year integer,
    gpa numeric(3,2),
    instagram text,
    twitter text,
    linkedin text,
    onboarding_complete boolean DEFAULT false,
    coin_balance integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true,
    last_seen timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    first_name text,
    last_name text,
    xp integer DEFAULT 0,
    level integer DEFAULT 1,
    streak integer DEFAULT 0,
    intended_major text,
    dream_school text,
    dream_school_name text,
    dream_school_id text,
    grade text,
    profile_visibility text DEFAULT 'public',
    onboarding_data jsonb DEFAULT '{}'::jsonb,
    onboarding_completed boolean DEFAULT false,
    onboarding_completed_at timestamptz,
    public_profile_complete boolean DEFAULT false,
    community_safety_agreed boolean DEFAULT false,
    community_safety_agreed_at timestamptz,
    community_safety_policy_version text,
    profile_mode text,
    email text,

    CONSTRAINT profiles_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_role
ON public.profiles(role);

CREATE INDEX IF NOT EXISTS idx_profiles_username
ON public.profiles(username);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE OR REPLACE TRIGGER profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();
