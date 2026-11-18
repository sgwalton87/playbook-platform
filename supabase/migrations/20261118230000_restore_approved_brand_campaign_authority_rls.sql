-- Restore the boolean, current-user-only helper used by approved Brand Partner RLS.
-- Without authenticated EXECUTE, the owner-scoped SELECT on public.brand_partners
-- fails with 42501 rather than evaluating its existing verification conditions.
-- This helper has no arguments, exposes no row data, and checks auth.uid() plus
-- onboarding, approved status and both independently approved scopes.
REVOKE ALL ON FUNCTION private.current_user_has_brand_campaign_authority() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_user_has_brand_campaign_authority() TO authenticated;
