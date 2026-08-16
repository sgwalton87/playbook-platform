-- Historical foundation tables backfilled during hosted production convergence are
-- intentionally closed to browser roles until a governed product authority exists.
-- Hosted Supabase default table privileges can otherwise grant Data API access even
-- though RLS currently has no policies. Keep the boundary explicit at both layers.

revoke all on public.nil_store_campaigns from anon, authenticated;
revoke all on public.support_messages from anon, authenticated;
revoke all on public.shared_actions from anon, authenticated;
