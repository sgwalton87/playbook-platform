-- Read-only post-migration certification preflight for the governed role and
-- support-relationship stack. Run only after applying the migration chain to a
-- non-production Supabase development branch.

begin;

-- Required public tables.
do $$
declare
  missing text[];
begin
  select array_agg(expected.name order by expected.name)
    into missing
    from (
      values
        ('support_relationships'),
        ('support_invitations'),
        ('mentor_validation_requests'),
        ('mentor_validation_approvals'),
        ('coach_verification_requests'),
        ('educator_verification_requests'),
        ('counselor_verification_requests'),
        ('district_verification_requests'),
        ('recruiting_verification_requests'),
        ('admissions_verification_requests'),
        ('employer_verification_requests'),
        ('brand_partner_verification_requests'),
        ('community_partner_verification_requests'),
        ('athlete_abroad_readiness_reviews'),
        ('relationship_security_events')
    ) as expected(name)
   where to_regclass('public.' || expected.name) is null;

  if missing is not null then
    raise exception 'Missing required relationship/verification tables: %', missing;
  end if;
end;
$$;

-- Every new exposed relationship/verification table must have RLS enabled.
do $$
declare
  insecure text[];
begin
  select array_agg(c.relname order by c.relname)
    into insecure
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public'
     and c.relname in (
       'support_relationships',
       'support_invitations',
       'mentor_validation_requests',
       'mentor_validation_approvals',
       'coach_verification_requests',
       'educator_verification_requests',
       'counselor_verification_requests',
       'district_verification_requests',
       'recruiting_verification_requests',
       'admissions_verification_requests',
       'employer_verification_requests',
       'brand_partner_verification_requests',
       'community_partner_verification_requests',
       'athlete_abroad_readiness_reviews',
       'relationship_security_events'
     )
     and not c.relrowsecurity;

  if insecure is not null then
    raise exception 'RLS is not enabled on required public tables: %', insecure;
  end if;
end;
$$;

-- Revocation must preserve audit history rather than delete relationships.
do $$
begin
  if not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'support_relationships' and column_name = 'ended_at'
  ) or not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'support_relationships' and column_name = 'ended_by'
  ) or not exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'support_relationships' and column_name = 'end_reason'
  ) then
    raise exception 'Support relationship revocation audit columns are incomplete.';
  end if;
end;
$$;

-- Required authenticated workflow functions.
do $$
declare
  missing text[] := array[]::text[];
begin
  if to_regprocedure('public.claim_support_invitation(text,text)') is null then
    missing := array_append(missing, 'claim_support_invitation(text,text)');
  end if;
  if to_regprocedure('public.approve_mentor_validation(uuid)') is null then
    missing := array_append(missing, 'approve_mentor_validation(uuid)');
  end if;
  if to_regprocedure('public.finalize_mentor_validation(uuid)') is null then
    missing := array_append(missing, 'finalize_mentor_validation(uuid)');
  end if;
  if to_regprocedure('public.revoke_support_relationship(uuid,text)') is null then
    missing := array_append(missing, 'revoke_support_relationship(uuid,text)');
  end if;

  if cardinality(missing) > 0 then
    raise exception 'Missing required relationship workflow functions: %', missing;
  end if;
end;
$$;

-- The audit trigger must exist and its SECURITY DEFINER helper must remain in a
-- non-exposed schema. A public helper would violate the Supabase security rule.
do $$
begin
  if to_regprocedure('private.capture_relationship_security_event()') is null then
    raise exception 'Private relationship observability trigger helper is missing.';
  end if;

  if to_regprocedure('public.capture_relationship_security_event()') is not null then
    raise exception 'Relationship observability SECURITY DEFINER helper must not exist in public.';
  end if;

  if not exists (
    select 1
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
     where not t.tgisinternal
       and n.nspname = 'public'
       and c.relname = 'support_relationships'
       and t.tgname = 'support_relationship_security_observability'
  ) then
    raise exception 'Relationship security observability trigger is missing.';
  end if;
end;
$$;

-- Core RLS policies required for participant-visible canonical state and audit history.
do $$
declare
  missing text[] := array[]::text[];
begin
  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='support_relationships'
       and policyname='Scholars can view their support relationships'
  ) then
    missing := array_append(missing, 'support_relationships Scholar SELECT policy');
  end if;
  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='support_relationships'
       and policyname='Supporters can view their scholar relationships'
  ) then
    missing := array_append(missing, 'support_relationships supporter SELECT policy');
  end if;
  if not exists (
    select 1 from pg_policies
     where schemaname='public' and tablename='relationship_security_events'
       and policyname='Relationship participants can view security events'
  ) then
    missing := array_append(missing, 'relationship_security_events participant SELECT policy');
  end if;

  if cardinality(missing) > 0 then
    raise exception 'Missing required RLS policies: %', missing;
  end if;
end;
$$;

-- Audit table must not grant direct writes to authenticated users.
do $$
begin
  if has_table_privilege('authenticated', 'public.relationship_security_events', 'INSERT')
     or has_table_privilege('authenticated', 'public.relationship_security_events', 'UPDATE')
     or has_table_privilege('authenticated', 'public.relationship_security_events', 'DELETE') then
    raise exception 'Authenticated role has direct write access to relationship_security_events.';
  end if;
end;
$$;

-- The preflight must never persist data.
rollback;
