# PBOS Mission Evidence: PBOS-RLS-001

## Executive Snapshot

**Mission:** `PBOS-RLS-001` — Validate production RLS and role access
**Date:** 2026-08-10T07:36:45.209Z
**Branch:** `main`
**Checkpoint status:** `complete`
**Mission state:** `ready-for-review`

## Evidence State

| Metric | Value |
| --- | --- |
| RLS-enabled tables | 45 |
| Tables with explicit policy statements | 45 |
| Tables missing policy statements | 0 |
| Policy statements (final precedence) | 78 |

- Generated from migration-precedence scan across `supabase/migrations` (lexicographic migration order, `DROP POLICY` + `CREATE POLICY` reconciliation).
- Matrix artifact: [pbos-rls-001-matrix.json](/Users/bulletproof/playbook-platform/docs/release-evidence/pbos-rls-001-matrix.json)

## RLS Matrix

| Table | RLS Enabled | Policy statements found | Policy count | Policy names |
| --- | --- | --- | --- | --- |
| achievements | YES | YES | 1 | "Users can manage own achievements" |
| ag_progress | YES | YES | 2 | "Students can view own ag progress", "Students can update own ag progress" |
| application_workspaces | YES | YES | 1 | "Scholars can manage own application workspaces" |
| athlete_eligibility_checks | YES | YES | 1 | "Scholars can manage own athlete eligibility checks" |
| athlete_financial_entries | YES | YES | 1 | "Scholars can manage own athlete financial entries" |
| athlete_profiles | YES | YES | 1 | "Scholars can manage own athlete profiles" |
| brand_partners | YES | YES | 1 | "Authenticated users can view active brand partners" |
| coin_ledger | YES | YES | 1 | "Scholars can manage own coin ledger" |
| community_event_rsvps | YES | YES | 1 | "Users manage own rsvps" |
| community_events | YES | YES | 1 | "Read public events" |
| content_mutes | YES | YES | 1 | "Users manage own content mutes" |
| evidence | YES | YES | 1 | "Users can manage own evidence" |
| evidence_packs | YES | YES | 1 | "Users can manage own evidence packs" |
| feed_post_comments | YES | YES | 4 | "Users can view feed comments", "Users can create own feed comments", "Anyone authenticated can read feed comments", "Users can manage own feed comments" |
| feed_post_reactions | YES | YES | 3 | "Users can view feed reactions", "Anyone authenticated can read feed reactions", "Users can manage own feed reactions" |
| guided_tour_progress | YES | YES | 1 | "Users can manage own guided tour progress" |
| moderation_actions | YES | YES | 3 | "Moderators can view moderation actions", "Moderators can insert moderation actions", "Moderators can update moderation actions" |
| nil_deals | YES | YES | 1 | "Scholars can manage own NIL deals" |
| nil_store_campaigns | YES | YES | 1 | "Users can manage own nil store campaigns" |
| notifications | YES | YES | 4 | "Users can read own notifications", "Users can insert own notifications", "Users can update own notifications", "Users can delete own notifications" |
| onboarding_options | YES | YES | 2 | "Options are viewable by authenticated users", "Authenticated users can add options" |
| opportunity_matches | YES | YES | 1 | "Users can manage own opportunity matches" |
| outcomes | YES | YES | 1 | "Users can manage own outcomes" |
| playbook_events | YES | YES | 4 | "Users can read own playbook events", "Users can insert own playbook events", "Users can update own playbook events", "Users can delete own playbook events" |
| playbook_records | YES | YES | 1 | "Users can manage own playbook records" |
| portfolio_shares | YES | YES | 1 | "Scholars can manage own portfolio shares" |
| profile_album_photos | YES | YES | 2 | "Users can read album photos", "Users manage own album photos" |
| profile_albums | YES | YES | 2 | "Users can read public albums", "Users manage own albums" |
| recommender_requests | YES | YES | 2 | "Scholars can manage own recommender requests", "Recommenders can view requests by email" |
| recruiting_targets | YES | YES | 1 | "Scholars can manage own recruiting targets" |
| reflections | YES | YES | 1 | "Users can manage own reflections" |
| reward_events | YES | YES | 1 | "Scholars can manage own reward events" |
| scholar_vault_items | YES | YES | 1 | "Users can manage own vault items" |
| shared_actions | YES | YES | 4 | "Users can read own shared actions", "Users can create own shared actions", "Users can update own shared actions", "Users can delete own shared actions" |
| store_products | YES | YES | 1 | "Authenticated users can view active store products" |
| store_redemptions | YES | YES | 1 | "Users can manage own store redemptions" |
| support_directory_profiles | YES | YES | 2 | "Read searchable directory", "Users manage own directory profile" |
| support_invitations | YES | YES | 4 | "Users can create support invitations", "Scholars can view their invitations", "Invitees can read invitations by email", "Invitees can update their invitation status" |
| support_messages | YES | YES | 4 | "Users can read own support messages", "Users can create own support messages", "Users can update own support messages", "Users can delete own support messages" |
| support_relationships | YES | YES | 4 | "Scholars can view their support relationships", "Supporters can view their scholar relationships", "Scholars can create support relationships", "Supporters can create relationships" |
| timeline_events | YES | YES | 1 | "Users can manage own timeline events" |
| trust_reports | YES | YES | 3 | "Users can manage own trust reports", "Users create own reports", "Users view own reports" |
| user_blocks | YES | YES | 1 | "Users manage own blocks" |
| user_mutes | YES | YES | 1 | "Users manage own mutes" |
| verifications | YES | YES | 1 | "Users can manage own verifications" |

## Remaining gaps

- No RLS-enabled tables are missing explicit policy statements.

## Next action

- Re-open PBOS-RLS-001 completion evidence and transition to mission completion review.
- Continue PBOS-QA dependency unblock with synthetic harness evidence generation and PBOS-SEC authorization hardening.
