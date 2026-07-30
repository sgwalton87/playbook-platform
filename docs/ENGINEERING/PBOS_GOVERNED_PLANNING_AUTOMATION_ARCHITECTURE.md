# PBOS Governed Planning Automation Architecture

## Purpose

Define the recommendation boundary that converts a PBOS system assessment and the Kernel's constitutional decision into one explainable development recommendation.

## Single Selection Authority

The Constitutional Planner and Kernel remain the only gate-selection authority. `GovernedPlanningEngine` cannot invent, reorder, or substitute milestones. It may expose the canonical selection only when its eligibility assessment is `READY` and system context is not blocked.

## Inputs And Evidence

Inputs are the system assessment, canonical milestone recommendation, dependency assessment, lifecycle state, blockers, and their immutable digests. Output includes milestone, reason, dependencies, risk, impact, confidence, blocking conditions, and evidence references.

## Failure Behavior

Invalid context, missing eligibility, blocked dependencies, or rejected certification yields no milestone and deterministic blockers. A blocked recommendation is a valid planning result, not permission to execute.

## Human Authority

`pbos:recommend` is advisory. It does not generate authorization, mutate runtime, approve autonomous execution, or dispatch adapters. Human approval and the governed execution lifecycle remain mandatory.
