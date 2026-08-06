# PGSL-007 Scholar Dashboard Canon

## Purpose

This package preserves the product-owner-approved Playbook experience board and Starting Five board as governed implementation inputs for the canonical Scholar Dashboard at `/dashboard`.

## Ownership

Owned by Playbook Product Design and Playbook OS Engineering.

## Last Updated

August 6, 2026.

## Related Links

- [Canonical route map](../../CANONICAL_ROUTE_MAP.md)
- [Page approval checklist](../../PAGE_APPROVAL_CHECKLIST.md)
- [Playbook design system](../../PLAYBOOK_DESIGN_SYSTEM.md)
- [Machine-readable manifest](./manifest.json)

## Canonical Inputs

- `playbook-experience-board-2026-07-24.png` is the authoritative multi-surface composition reference for navigation, visual hierarchy, dashboard density, responsive intent, and the navy/orange/white Playbook language.
- `starting-five-board-2026-07-23.png` is the authoritative onboarding and trusted-support composition reference.
- `public/brand/scholar-dashboard/scholar-future-hero-v1.png` is the production dashboard hero asset commissioned for this implementation. It provides the approved future-facing Black male Scholar representation without embedding interface text in the image.

The boards are reference inputs, not page-sized background images. Production screens must recreate their hierarchy as accessible, responsive components backed by live application data.

## Runtime Traceability

| Contract | Runtime implementation |
|---|---|
| Canonical screen ID | `PGSL-007` |
| Route | `/dashboard` |
| Route composition | `app/dashboard/page.tsx` |
| Responsive experience | `components/dashboard/ScholarDashboardExperience.tsx` |
| Visual styles | `components/dashboard/ScholarDashboardExperience.module.css` |
| Functional acceptance | `tests/acceptance/pbos-scholar.spec.ts` |
| Visual acceptance | `tests/acceptance/pbos-scholar-visual.spec.ts` |
| Canon integrity | `tests/unit/dashboard/scholar-dashboard-canon.test.ts` |

## Approval State

The source boards are approved canonical references. The responsive implementation remains pending product-owner screenshot approval at desktop and mobile viewports. PBOS must not report visual certification until those baselines are approved.
