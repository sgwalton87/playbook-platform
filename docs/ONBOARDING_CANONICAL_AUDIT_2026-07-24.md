# Canonical Onboarding Audit

## Purpose
Document the PBOS Engine Sprint replacement of competing onboarding implementations with one canonical, configuration-driven onboarding system.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Engineering constitution](../CODEX.md)
- [Architecture handbook](./ARCHITECTURE.md)
- [Database handbook](./DATABASE.md)
- [Onboarding role sprint map](./ONBOARDING_ROLE_OS_SPRINT_MAP.md)

## 1. Canonical Onboarding Route
- Production onboarding route: `/start`.
- Legacy `/onboarding` traffic is redirected to `/start` by `next.config.ts`.
- Auth callback sends incomplete profiles to the canonical onboarding route through `getCanonicalOnboardingRoute`.

## 2. Deleted Routes
- Deleted `app/onboarding/page.tsx` so the legacy onboarding page no longer builds as a route.

## 3. Deleted Components
- No production onboarding components were deleted. The tutorial component was renamed from `OnboardingTour` to `FirstLoginTour` because it is a post-login product tutorial, not profile onboarding.

## 4. Deleted Hooks
- No onboarding-specific hooks existed in production after audit.

## 5. Deleted Contexts
- No onboarding-specific contexts existed in production after audit.

## 6. Deleted Legacy Pages
- `app/onboarding/page.tsx` was removed from runtime.

## 7. Deleted Demo Users
- No demo users were present in the production onboarding system. Demo/storytelling records outside onboarding remain out of scope for this sprint.

## 8. Deleted Maya References
- No Maya references remain in the production onboarding route or canonical onboarding engine. Maya references outside onboarding belong to demo/storytelling surfaces and were not changed.

## 9. Remaining Onboarding Files
- `app/start/page.tsx` renders the only production onboarding experience.
- `lib/onboarding/engine.ts` selects role configuration and canonical destinations.
- `lib/onboarding/types.ts` defines shared step, field, and data contracts.
- `lib/onboarding/validation.ts` owns onboarding validation.
- `lib/onboarding/progress.ts` owns progress math.
- `lib/onboarding/supabaseMapping.ts` maps onboarding data into Supabase profile payloads.
- `lib/onboarding/config/roleConfigs.ts` contains the role step configuration source used by the engine.
- Role configuration export files exist under `lib/onboarding/config/` for named PBOS roles.
- `lib/onboarding/onboardingOptions.ts` remains the option list source for colleges, careers, activities, and districts.
- `lib/onboarding/pathwayMap.ts` remains the role-to-OS pathway resolver.

## 10. Supabase Mappings
- The canonical mapping writes `role`, `profile_mode`, `requested_role`, public profile fields, `onboarding_data`, completion timestamps, and community safety agreement fields to `profiles`.
- Custom onboarding options continue to persist to `onboarding_options`.

## 11. Role Configurations
The canonical engine serves Scholar, Scholar Athlete, Parent/Guardian, Teacher/Educator, Coach, Mentor, Counselor-adjacent educator support, Administrator/District, Financial Professional/Brand Partner, Employer, College Representative, and Community Partner through the shared role configuration map.

## 12. Screenshots of Each Role
Not captured in this environment because authenticated Supabase sessions and seeded role accounts were unavailable. The dev server was started and `/start` returned HTTP 200.

## 13. Build Status
- `npm run build`: passed.

## 14. Lint Status
- `npm run lint`: passed.

## 15. Test Status
- `npm run test`: started but produced no results within the non-interactive command window and was interrupted after several minutes with no output beyond Vitest startup.
- `npx tsc --noEmit`: passed as a targeted type check for the onboarding refactor.
