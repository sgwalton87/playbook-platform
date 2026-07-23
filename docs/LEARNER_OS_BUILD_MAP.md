# Learner OS Build Map

**Category:** Scholar, Scholar-Athlete, Transition-Aged Youth, and Athlete Abroad

**Architecture:** All four operating systems are projections of the same canonical learner-owned profile and onboarding record. They do not create separate learner records. Shared infrastructure handles authenticated loading, timeouts, recovery, Support Network status, responsive layout, and record access; role configuration controls readiness fields, language, modules, actions, navigation, and OS destination.

## Role experiences

| Role | Destination | Primary intelligence | Core modules |
| --- | --- | --- | --- |
| Scholar | `/dashboard` | academic and opportunity readiness | A–G readiness, Compass, applications/opportunities, canonical record |
| Scholar-Athlete | `/scholar-athlete-os` | eligibility, recruiting, NIL, and future planning | eligibility, recruiting, athlete portfolio, NIL/financial learning |
| Transition-Aged Youth | `/tay-os` | flexible transition readiness | next-chapter planning, practical opportunities, Support Network, complete progress record |
| Athlete Abroad | `/athlete-abroad-os` | global academic, athletic, travel, and safety readiness | global passport, athlete portfolio, country/program fit, safety/support |

## Shared quality contract

- One canonical learner record and one canonical `support_network` collection.
- Authenticated loading with bounded session/profile requests.
- Signed-out, loading, error, retry, and incomplete-profile states.
- Mobile-responsive metrics, module cards, primary actions, and Support Network callout.
- Role registry, sidebar, onboarding completion, and tutorial destinations must match.
- Role readiness is calculated only from fields relevant to that learner pathway.

## Current validation status

- Built locally: four role-specific projections and dedicated routes.
- Contract-tested locally: unique definitions, canonical-data projection, Support Network count, readiness calculation, route presence, navigation alignment, and tutorial routing.
- Release validation remaining: live Supabase persistence with representative accounts, permission/RLS verification, real empty/error scenarios, and visual E2E on phone and desktop.
- Promotion status: review branch only; not approved for `main`.
