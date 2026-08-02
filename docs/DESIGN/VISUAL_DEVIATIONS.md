# Visual Deviations

## Purpose
Documents design decisions made where the master board did not provide page-level implementation detail.

## Ownership
Owned by Playbook OS Engineering.

## Last Updated
July 24, 2026

## Related Links
- [Canonical route map](./CANONICAL_ROUTE_MAP.md)
- [Overnight design report](./OVERNIGHT_DESIGN_REPORT.md)

## Deviations and Decisions

| Decision | Rationale |
|---|---|
| Emoji navigation icons remain in Sprint 01. | The repository has no dedicated icon dependency. Keeping existing glyphs avoids adding a new visual system or dependency during the safe shell sprint. |
| Mobile bottom navigation shows the first four role navigation items plus Profile. | This preserves current role navigation logic while creating a usable compact mobile pattern. |
| `/permissions` is documented as the closest current Settings surface. | No active `/settings` route exists in the App Router. Creating a new settings route would go beyond Sprint 01 shell work. |
