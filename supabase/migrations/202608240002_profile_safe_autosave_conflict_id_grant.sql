-- Preserve the safe profile autosave upsert contract without restoring broad
-- profile mutation authority. PostgREST/Supabase upsert generates an
-- ON CONFLICT (id) DO UPDATE statement that writes the conflict key back to
-- public.profiles.id. The owner-only UPDATE RLS policy already requires both
-- the existing and resulting row id to equal auth.uid(), so granting UPDATE on
-- id permits only the authenticated user's own immutable ownership key to be
-- re-assigned to the same value during the upsert.
--
-- Authority-bearing columns (role, profile_mode, verification, onboarding
-- completion, admin/reward fields) remain non-writable by authenticated clients.

grant update (id) on public.profiles to authenticated;
