-- Harden support_relationships so relationship creation is possible only through
-- the specialized invitation/verification policies defined by later governance
-- migrations. The original Scholar-owner insert policy was too broad and could
-- bypass invitation, verification, and zero-data authority contracts.

-- Consolidate participant read access into one optimized policy.
drop policy if exists "Scholars can view their support relationships"
  on public.support_relationships;
drop policy if exists "Supporters can view their scholar relationships"
  on public.support_relationships;

drop policy if exists "Relationship participants can view support relationships"
  on public.support_relationships;
create policy "Relationship participants can view support relationships"
on public.support_relationships
for select
to authenticated
using (
  scholar_id = (select auth.uid())
  or supporter_id = (select auth.uid())
);

-- Remove the legacy owner-only insert policy. Relationship rows must now satisfy
-- one of the specialized invitation-bound policies already installed for:
-- Parent/Guardian, validated Mentor, verified Coach, or verified exact-role
-- zero-data relationships.
drop policy if exists "Scholars can create support relationships"
  on public.support_relationships;

-- Keep Data API table access available; RLS remains the authorization boundary.
grant select, insert on public.support_relationships to authenticated;
