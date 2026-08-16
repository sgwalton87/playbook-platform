-- Hosted Supabase may apply default table privileges to newly created public tables.
-- Keep canonical Learning writes RPC-only even when those defaults differ from the
-- local certification environment. RLS already has no mutation policies; these
-- revokes add the intended table-privilege defense in depth explicitly.

revoke insert, update, delete on public.learning_module_progress from anon, authenticated;
revoke insert, update, delete on public.learning_credentials from anon, authenticated;
revoke insert, update, delete on public.achievement_badges from anon, authenticated;
