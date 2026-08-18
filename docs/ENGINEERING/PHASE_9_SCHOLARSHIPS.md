# Phase 9 — Scholarships

Scholarships are a focused Scholar-facing projection of the canonical Marketplace Opportunity Catalog, not a separate opportunity authority.

## Authority

- `marketplace_opportunities` owns real scholarship listings.
- Only `opportunity_type = scholarship` records that have crossed the existing human publication-review boundary appear in the Scholar scholarship experience.
- `/api/marketplace/opportunities` remains the authorized published-catalog projection.
- Application work continues through the canonical Application Workspace using the marketplace opportunity ID, title, type, and deadline.
- PBOS opportunity guidance remains advisory and must never be presented as a real scholarship listing.

## MVP journey

Scholar opens `/scholarships` → searches published scholarship listings → reviews award/deadline/eligibility/requirements → opens the official listing when available → starts the shared Application Workspace.

The empty state is truthful: if no scholarship has completed publication review, Playbook displays no fabricated listings.
