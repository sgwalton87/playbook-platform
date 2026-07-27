# PBOS-UI-001 AppShell and Design System Audit

## Gate

PBOS-UI-001

## Objective

Audit Playbook Platform UI architecture to ensure role-based experiences use shared components, consistent design tokens, accessibility standards, and AppShell governance.

---

# 1. Route Inventory

| Route | Role | Uses AppShell | Notes |
|---|---|---|---|
| /dashboard | | | |
| /profile | | | |
| /courses | | | |
| /mentorship | | | |
| /events | | | |
| /connections | | | |

---

# 2. Dashboard Inventory

| Experience | Role | Status | Notes |
|---|---|---|---|
| Scholar Dashboard | Scholar | | |
| Scholar Athlete Dashboard | Athlete | | |
| Mentor Dashboard | Mentor | | |
| Coach Dashboard | Coach | | |
| Advisor Dashboard | Advisor | | |

---

# 3. Reusable Component Opportunities

## Navigation

- 

## Cards

-

## Forms

-

## Data Visualization

-

## Intelligence Components

-

---

# 4. Design Token Review

## Colors

Status:

Notes:

## Typography

Status:

Notes:

## Spacing

Status:

Notes:

---

# 5. Accessibility Review

## Keyboard Navigation

Status:

## Mobile Responsiveness

Status:

## Screen Reader Support

Status:

---

# 6. Risks

-

---

# Definition of Done

- Dashboard UI inventory exists.
- Reusable component opportunities are prioritized.
- No route-specific component fork is introduced.

# PBOS-UI-001 Findings

## AppShell Inventory

Current shell implementations identified:

| Component | Status | Risk |
|---|---|---|
| components/AppShell.tsx | Active candidate | Requires authority review |
| components/layout/AppShell.tsx | Active candidate | Requires consolidation review |
| components/shell/UnifiedAppShell.tsx | Active candidate | Potential canonical shell |

Recommendation:

Establish one canonical AppShell contract and migrate routes toward shared shell ownership.

---

# Route Architecture Findings

The application contains:

- Core scholar experiences
- Role operating systems
- Intelligence experiences
- Trust and safety experiences
- Studio governance experiences

The route architecture aligns with a multi-role operating system model.

---

# Reusable Component Opportunities

Priority 1:

- Canonical AppShell
- Navigation system
- Role navigation configuration
- Dashboard cards
- Empty states
- Loading states
- Error states

Priority 2:

- Intelligence widgets
- Opportunity cards
- Timeline components
- Portfolio components
- Notification components

Priority 3:

- Studio governance components
- Analytics components
- Admin components

---

# Accessibility Risks

Review required:

- Keyboard navigation consistency
- Mobile navigation parity
- Color token enforcement
- Shared component accessibility states

---

# PBOS Recommendation

Do not introduce additional route-specific UI systems.

Consolidate shell ownership before expanding additional role experiences.


---

# Canonical AppShell Decision

## Decision

The canonical Playbook Platform shell is:

`components/shell/UnifiedAppShell.tsx`

## Supporting Architecture

`components/layout/AppShell.tsx`

remains as a compatibility export:

```tsx
export { default } from "@/components/shell/UnifiedAppShell";
