# Launch Readiness Checklist

## Status
- Role onboarding alignment: implemented through the shared role registry and onboarding engine.
- Evidence provenance and review workflow: implemented through shared helpers and role-aware shell surfaces.
- Permission-aware notifications and action routing: implemented through role-based routing helpers and permission checks.
- Role dashboard evidence context: implemented through dashboard evidence preview data.
- RLS and E2E hardening: covered by new regression tests and browser smoke tests.

## Verification Evidence
- Unit tests: `npx vitest run --pool=threads lib/roles/registry.test.ts lib/action-routing/actionRouting.test.ts lib/permissions/rolePermissions.test.ts lib/scholar-experience.test.ts lib/role-os/roleDashboards.test.ts`
- Production build: `npm run build`
- Browser smoke: `npx playwright test tests/e2e/launch-smoke.spec.ts tests/e2e/role-os-smoke.spec.ts --project=chrome`
