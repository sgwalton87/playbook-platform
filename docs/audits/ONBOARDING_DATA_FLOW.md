# Onboarding Data Flow Audit

Purpose: trace canonical `/start` onboarding write path to private and public profile read paths. Owner: Playbook OS Engineering. Last updated: July 24, 2026.

Related links: `docs/audits/RUNTIME_COMPONENT_MAP.md`, `docs/audits/ONBOARDING_INTEGRITY_REPORT.md`, `docs/DATABASE.md`.

## Runtime trace status

A true end-to-end trace is blocked because this environment was not provided a safe development/test account or Supabase credentials suitable for authenticated browser verification. The source-level runtime path is still clear enough to identify the write/read mismatch below. No field is marked `VERIFIED` because no runtime Supabase request/response and screenshot evidence was available.

## Canonical write path

`/start` authenticates with `supabase.auth.getUser()`, loads `profiles` by authenticated `id`, hydrates form state from top-level profile columns plus `onboarding_data`, and upserts `profiles` on each step. The payload writes top-level columns only for: `id`, `role`, `profile_mode`, `requested_role`, `full_name`, `username`, `avatar_url`, `bio`, `school`, `grade`, `dream_school`, `ideal_profession`, completion/safety flags. All other onboarding fields are written only under `profiles.onboarding_data`.

## Read paths

- `/dashboard` reads `profiles` and `ag_progress`, then derives a Scholar Record. It displays GPA and graduation year only if mapped by `buildScholarRecord` from profile columns/data.
- `/scholar-athlete-os` reads no profile row and cannot show submitted athlete fields.
- Generic role OS pages read no authenticated profile; they show static role dashboard content.
- `/profile` reads the authenticated `profiles` row and updates many top-level profile columns on manual save.
- `/u/[username]` reads `profiles` by username and shows top-level profile columns plus derived Scholar Record, certificates, badges, feed, activities.

## Field-by-field map

| Onboarding field | Form state key | Validation rule | Supabase table | Supabase column | Write function | Write result | Dashboard read location | Public profile read location | Visible result | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| Full name | `full_name` | none in source | `profiles` | `full_name` | `persist` upsert | top-level + JSON | dashboard derives profile | `ProfileHero`/profile components | should appear where full_name is rendered | BROKEN until runtime evidence |
| Username | `username` | none in source | `profiles` | `username` | `persist` upsert | top-level + JSON | not central on dashboard | `/u/[username]` lookup uses this | route works only if unique/RLS permits | BROKEN until runtime evidence |
| Avatar | `avatar_url` | upload only | `profiles`, storage | `avatar_url` | `uploadAvatar` + `persist` | top-level + JSON | profile-dependent | `ProfileHero` | should appear if storage public | BROKEN until runtime evidence |
| Bio | `bio` | none in source | `profiles` | `bio` | `persist` upsert | top-level + JSON | not shown on Scholar dashboard | `AboutCard`/hero | should appear public | BROKEN until runtime evidence |
| School | `school` | none in source | `profiles` | `school` | `persist` upsert | top-level + JSON | derived record may use | About/Academics cards | should appear | BROKEN until runtime evidence |
| Grade | `grade` | select only | `profiles` | `grade` | `persist` upsert | top-level + JSON | derived record may use | profile-derived components | should appear if component maps it | BROKEN until runtime evidence |
| Dream school | `dream_school` | datalist only | `profiles` | `dream_school` | `persist` upsert | top-level + JSON | not obvious except derived record | Academics card | visible on public profile Academics | BROKEN until runtime evidence |
| Ideal profession | `ideal_profession` | datalist only | `profiles` | `ideal_profession` | `persist` upsert | top-level + JSON | not shown in static role OS | unknown | likely not visible | NOT CONNECTED |
| GPA | `gpa` | none in source | `profiles` | `onboarding_data.gpa` only | `persist` upsert | JSON only | `/dashboard` may need profile/onboarding mapping | public Academics reads `profile.gpa` | missing if no mapper copies it | WRONG FIELD |
| Graduation year | `graduation_year` | none in source | `profiles` | `onboarding_data.graduation_year` only | `persist` upsert | JSON only | dashboard reads derived `graduationYear` | not directly displayed except derived components | may be absent if mapper ignores JSON | WRONG FIELD |
| School district | `school_district` | datalist only | `profiles` | `onboarding_data.school_district` only | `persist` upsert | JSON only | not shown | `/profile` uses `school_district` top-level on manual save | missing public unless saved in profile editor | WRONG FIELD |
| Top schools | `top_schools` | list filtering | `profiles` | `onboarding_data.top_schools` only | `persist` upsert | JSON only | not shown | public profile uses `profile.college_list` or derived record, not this key | WRONG FIELD |
| Activities | `activities` | draft requires activity name only | `profiles` | `onboarding_data.activities` only | `persist` upsert | JSON only | not on dashboard | `/u` separately queries `student_activities` | not visible because not inserted into `student_activities` | NOT CONNECTED |
| Intended major | `intended_major` | none | `profiles` | `onboarding_data.intended_major` only | `persist` upsert | JSON only | not shown | `/profile` public columns use `intended_major` only after profile editor save | missing after onboarding | WRONG FIELD |
| Race/ethnicity | `race_ethnicity` | optional | `profiles` | `onboarding_data.race_ethnicity` only | `persist` upsert | JSON only | should be private/not public | should not public display | privacy-sensitive; no public display expected | NOT IMPLEMENTED |
| First generation | `first_generation` | optional select | `profiles` | `onboarding_data.first_generation` only | `persist` upsert | JSON only | private | not public | type mismatch likely with `/profile` boolean column | WRONG FIELD |
| Athlete sport | `primary_sport` | select only | `profiles` | `onboarding_data.primary_sport` only | `persist` upsert | JSON only | Scholar-Athlete OS reads none | public profile/profile editor use `sport` column | missing after onboarding | WRONG FIELD |
| Athlete position | `position` | none | `profiles` | `onboarding_data.position` only | `persist` upsert | JSON only | Scholar-Athlete OS reads none | public profile may read `position` column | missing after onboarding | WRONG FIELD |
| Current team | `current_team` | none | `profiles` | `onboarding_data.current_team` only | `persist` upsert | JSON only | Scholar-Athlete OS reads none | public profile reads `travel_team` column | missing after onboarding | WRONG FIELD |
| Height/weight | `height_weight` | none | `profiles` | `onboarding_data.height_weight` only | `persist` upsert | JSON only | Scholar-Athlete OS reads none | public profile uses separate `height`, `weight` columns | missing after onboarding | WRONG FIELD |
| Stats/honors | `key_stats_honors` | textarea | `profiles` | `onboarding_data.key_stats_honors` only | `persist` upsert | JSON only | Scholar-Athlete OS reads none | no confirmed public read | missing | NOT CONNECTED |
| Highlight link | `highlight_link` | none | `profiles` | `onboarding_data.highlight_link` only | `persist` upsert | JSON only | Scholar-Athlete OS reads none | `/profile` uses `highlight_reel_url` column | missing after onboarding | WRONG FIELD |
| NIL interest | `nil_interest` | multi-select | `profiles` | `onboarding_data.nil_interest` only | `persist` upsert | JSON only | Scholar-Athlete OS uses hardcoded NIL summary | profile editor uses different NIL fields | missing | WRONG FIELD |
| Invite supporters | `invite_supporters` | list filtering | `profiles`; API | `onboarding_data.invite_supporters`; invitation API body | `persist`; `sendInvites` | JSON plus API attempts | support network pages do not read this | not public | not connected to visible support messaging | NOT CONNECTED |
| Safety agreement | `community_safety_agreed` | required on final step | `profiles` | top-level safety fields + JSON | `persist` | top-level + JSON | not shown | not shown | persistence probable but unverified | BROKEN until runtime evidence |

## Exact data-flow root causes

1. `/start` and `/profile` use different field names for several profile concepts (`primary_sport` vs `sport`, `current_team` vs `travel_team`, `highlight_link` vs `highlight_reel_url`, `height_weight` vs split `height`/`weight`).
2. `/u/[username]` reads top-level profile columns and separate normalized tables, not arbitrary onboarding JSON.
3. Scholar-Athlete and most role OS pages do not read Supabase at all.
4. Query failures can be masked by runtime mock data on messaging/support screens and by non-user-specific static dashboards.
