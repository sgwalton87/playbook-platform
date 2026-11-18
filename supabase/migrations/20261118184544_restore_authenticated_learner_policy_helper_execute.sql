-- Applied to Playbook OS 2026-11-18 as controlled repair for learner RLS.
-- Restrict the boolean self-eligibility predicate to authenticated sessions.
-- Existing scholar_id = auth.uid() ownership policies stay unchanged.
REVOKE EXECUTE ON FUNCTION private.current_user_is_onboarded_learner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.current_user_is_onboarded_learner() TO authenticated;
