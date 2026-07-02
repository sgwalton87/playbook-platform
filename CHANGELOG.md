# Playbook Platform Changelog

All notable changes to the Playbook Platform are documented here.

---

# Alpha 0.3

## Added

- Portfolio Engine foundation
- Portfolio Assembler
- Portfolio Intelligence
- Portfolio Completion
- Portfolio Stats
- Portfolio DNA
- Opportunity Meter

## Refactored

- Extracted ProfileHero
- Extracted ProfileStats
- Extracted AboutCard

## Infrastructure

- Engineering Ledger
- Company Archive
- Release Log
- Sprint Documentation

---

# Next

- AcademicCard
- BadgesCard
- CertificatesCard
- FeedModule
- GalleryModule
- PortfolioEngine

---

# Alpha 0.4

## Added

- Scholar Record Engine
- Modular Scholar Record modules
- ScholarRecordDashboard
- Scholar Record unit tests
- Vitest alias configuration
- VERSION.md

## Next

- Integrate ScholarRecordDashboard into public profile
- Build PortfolioEngine orchestrator
- Connect DNA and Opportunity scores to Scholar Record

---

# Trust Layer

## Added

- Trust Engine foundation
- TrustScoreCard component
- Trust Engine unit tests
- Trust Layer architecture note

---

# Alpha 0.6 — Playbook Graph + Event Bus

## Added

- Playbook Graph architecture
- Playbook Graph v1.0 Supabase migration
- Achievement + Evidence workflow
- Playbook Event Bus
- Event handler registry
- Timeline, Trust, Portfolio, Opportunity, and Compass event reactions
- Supabase mocks for event handler tests

## Next

- Add Engine layer
- Add Repository layer
- Refactor event handlers away from direct Supabase writes
