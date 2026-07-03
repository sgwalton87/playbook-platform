# Decision Log

Tracks key strategic and architectural decisions.

---

## Status

Draft foundation created during Playbook platform build.

## Purpose

This document exists to preserve Playbook's architecture, product thinking, company history, and engineering decisions as the platform grows.

## Current Direction

Playbook is evolving into Playbook OS™: a lifelong achievement operating system powered by the Playbook Record™, Trust Layer™, Living Evidence™, Intelligence Engines, Opportunity Engine™, and Compass AI™.

## Last Updated

2026-07-02

## 2026-07-02 10:43
- Decision: Adopted Engine → Repository architecture

## 2026-07-02 10:48
- Decision: All suggested log-style documents should be updated through the central Playbook ledger script instead of manually maintained.

## 2026-07-02 10:48
- Rejected path: Rejected manual-only documentation updates because the founder cannot maintain every log by hand.

## 2026-07-02 10:49
- Decision: Adopted Event → Handler → Engine → Repository → Database.

## 2026-07-02 10:49
- Rejected path: Did not keep Supabase writes directly inside event handlers.

## 2026-07-02 10:55
- Decision: Adopted npm run ship as the canonical end-of-sprint documentation and validation workflow.

## 2026-07-02 11:40
- Decision: Academic Intelligence v2 became the canonical implementation. Legacy engine converted into a compatibility wrapper.

## 2026-07-02 11:58
- Decision: Opportunity Graph will use ontology-driven matching before external opportunity marketplace integrations.

## 2026-07-02 13:41
- Decision: Created Playbook SDK as the canonical internal interface for Playbook Intelligence OS.

## 2026-07-02 16:10
- Decision: Alpha 1.0 architecture snapshot is frozen; current architecture documents are generated automatically.

## 2026-07-02 16:19
- Decision: Playbook OS now has four core services: Compass, Archivist, Cartographer, and Sentinel.

## 2026-07-02 16:33
- Decision: Documentation should be governed by Doc Governor before creating new roadmap, vision, milestone, or strategy files.

## 2026-07-02 16:50
- Decision: Documentation lifecycle now uses metadata, ownership, status, canonical state, and auto-update rules.

## 2026-07-03 10:47
- Decision: Froze Alpha architecture
