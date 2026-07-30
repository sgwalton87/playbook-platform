# PBOS Run It Experience Specification

Owner: Playbook OS Engineering  
Last updated: July 30, 2026  
Related: [It Command Architecture](../ENGINEERING/PBOS_IT_COMMAND_ARCHITECTURE.md)

## Purpose

The terminal experience gives a founder one concise view of mission alignment, readiness, next play, risk, outcome, blocker, remediation commands, expected next state, and evidence identity.

## Interaction States

Loading states report evaluation without claiming success. `NOT_READY` presents ordered corrective actions. `BLOCKED` identifies the authority or integrity conflict. `READY` presents the admitted action and its governing evidence. Failures terminate with nonzero status and an explicit statement that no action executed.

## Accessibility And Clarity

Output uses plain text, stable headings, no color-dependent meaning, explicit state names, ordered resolutions, and copyable commands. Machine evidence remains available through expert PBOS commands.

## Safety

The interface never asks for secrets, silently accepts risk, hides a failed phase, or represents planning as execution. Founder convenience cannot supersede constitutional controls.

