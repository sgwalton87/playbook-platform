begin;

-- The canonical profile table must remain RLS-protected.
do $$
begin
  if not exists (
    select 1 from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relname = 'profiles' and c.relrowsecurity
  ) then
    raise exception 'public.profiles must remain RLS enabled';
  end if;
end $$;

-- Public profile access is intentionally mediated through narrow RPCs.
do $$
begin
  if to_regprocedure('public.get_public_scholar_profile(text)') is null then
    raise exception 'get_public_scholar_profile(text) is missing';
  end if;
  if to_regprocedure('public.get_public_scholar_identities(uuid[])') is null then
    raise exception 'get_public_scholar_identities(uuid[]) is missing';
  end if;
end $$;

-- Both RPCs must execute with an empty search_path and must not expose authority fields.
do $$
declare
  definition text;
begin
  select pg_get_functiondef('public.get_public_scholar_profile(text)'::regprocedure) into definition;
  if definition not ilike '%set search_path = %''%''%' and definition not ilike '%SET search_path TO %''%''%' then
    raise exception 'public profile projection must use an empty search_path';
  end if;

  foreach definition in array array[
    pg_get_functiondef('public.get_public_scholar_profile(text)'::regprocedure),
    pg_get_functiondef('public.get_public_scholar_identities(uuid[])'::regprocedure)
  ] loop
    if definition ~* '\m(onboarding_completed|verification_status|requested_role|profile_mode|is_admin|email|phone|household|guardian|safety)\M' then
      -- profile_mode/requested_role are allowed internally only for role normalization, but not in RETURNS TABLE.
      if definition ~* 'returns table[\s\S]*\m(onboarding_completed|verification_status|requested_role|profile_mode|is_admin|email|phone|household|guardian|safety)\M' then
        raise exception 'public Scholar projection exposes an authority/private field';
      end if;
    end if;
  end loop;
end $$;

-- Historical unconditional feed-read policies must be gone.
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='feed_posts'
      and cmd='SELECT'
      and coalesce(qual,'') in ('true','(true)')
  ) then
    raise exception 'feed_posts still has an unconditional SELECT policy';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public'
      and tablename='feed_posts'
      and policyname='Public can view public feed posts'
      and qual ilike '%visibility%public%'
  ) then
    raise exception 'feed_posts public visibility policy is missing';
  end if;
end $$;

-- The photos bucket may be public-read, but uploads must be authenticated and owner-namespaced.
do $$
begin
  if exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and cmd='INSERT'
      and ('anon' = any(roles) or 'public' = any(roles))
      and coalesce(with_check,'') ilike '%photos%'
  ) then
    raise exception 'photos bucket still permits anonymous/public uploads';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='storage'
      and tablename='objects'
      and policyname='Authenticated users upload own public photos'
      and 'authenticated' = any(roles)
      and coalesce(with_check,'') ilike '%auth.uid()%'
      and coalesce(with_check,'') ilike '%foldername%'
  ) then
    raise exception 'owner-namespaced authenticated photo upload policy is missing';
  end if;
end $$;

rollback;
