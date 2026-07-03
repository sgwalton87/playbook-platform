# Documentation Cleanup Plan

## Phase 1 — Stop the Bleeding

- Use canonical docs before creating new ones.
- Let Archivist update logs.
- Let Cartographer update architecture maps.
- Let Sentinel check health.
- Let Doc Governor identify duplicates.

## Phase 2 — Fill Critical Thin Docs

Priority docs to fill:
- docs/PRODUCT_ROADMAP.md
- docs/VISION/VISION.md
- docs/ENGINEERING/ARCHITECTURE.md
- docs/DESIGN_SYSTEM.md
- docs/DATABASE_BLUEPRINT.md
- docs/AI_ARCHITECTURE.md
- docs/USER_JOURNEYS.md
- docs/REVENUE_MODEL.md

## Phase 3 — Merge Duplicate Families

Merge roadmap files into PRODUCT_ROADMAP.

Merge vision files into VISION/VISION.

Merge architecture files into PLAYBOOK_OS and CURRENT_ARCHITECTURE.

Merge founder files into Founder Journal.

Merge release files into RELEASE_HISTORY and CHANGELOG.

## Phase 4 — Deprecate Safely

Move merged duplicate docs to:

docs/DEPRECATED/

Do not delete until reviewed.

## Phase 5 — Improve Doc Governor

Doc Governor should eventually:
- detect canonical docs
- detect deprecated docs
- ignore generated docs
- score thin docs differently from intentional index files
- produce merge recommendations


---

# Cleanup Pass

Moved duplicate or superseded documentation into docs/DEPRECATED.

Canonical docs remain:

- docs/PLAYBOOK_OS.md
- docs/PRODUCT_ROADMAP.md
- docs/VISION/VISION.md
- docs/DESIGN/PLAYBOOK_DESIGN_SYSTEM.md
- docs/ARCHITECTURE/CURRENT_ARCHITECTURE.md
- docs/ARCHITECTURE/PLAYBOOK_OS_ALPHA_1.md
