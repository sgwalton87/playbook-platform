# Playbook Engineering Protocol v1.0

## Repository

playbook-platform

## Active Development Branch

chore/playbook-command-center

---

# Branch Strategy

- Branch FROM chore/playbook-command-center
- PR INTO chore/playbook-command-center
- Never target main during active development
- Merge to main only after a completed Epic

---

# Architecture Principles

- ScholarRecord is the canonical source of truth.
- Avoid duplicate data models.
- Prefer builders and adapters.
- Maintain backward compatibility unless explicitly approved.
- Build incrementally rather than rewriting stable systems.

---

# Engineering Standards

Before beginning any sprint:

- Pull latest development branch
- Resolve merge conflicts
- Verify build is green

Every sprint must end with:

- next build
- npx tsc --noEmit
- Relevant tests passing

---

# Pull Request Requirements

Every PR should include:

- Architecture summary
- Files changed
- Tests added or updated
- Build confirmation
- Technical debt notes
- Recommendation for next sprint

---

# Release Strategy

Daily development:

feature branch
↓

chore/playbook-command-center

↓

QA

↓

Epic Complete

↓

main
