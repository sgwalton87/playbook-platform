export interface OwnershipRule {
  match: string;
  owner: string;
}

export const OWNERSHIP_RULES: OwnershipRule[] = [

  // ============================
  // Platform Intelligence
  // ============================

  { match: "cartographer", owner: "Platform Intelligence" },
  { match: "archivist", owner: "Platform Intelligence" },
  { match: "ledger", owner: "Platform Intelligence" },
  { match: "sentinel", owner: "Platform Intelligence" },
  { match: "doc-governor", owner: "Platform Intelligence" },
  { match: "oracle", owner: "Platform Intelligence" },
  { match: "studio", owner: "Platform Intelligence" },

  // ============================
  // Identity
  // ============================

  { match: "auth", owner: "Identity Engine" },
  { match: "login", owner: "Identity Engine" },
  { match: "onboarding", owner: "Identity Engine" },
  { match: "role-select", owner: "Identity Engine" },
  { match: "permissions", owner: "Identity Engine" },
  { match: "invite", owner: "Identity Engine" },
  { match: "invitations", owner: "Identity Engine" },

  // ============================
  // Participant Record
  // ============================

  { match: "profile", owner: "Participant Record" },
  { match: "scholar-record", owner: "Participant Record" },
  { match: "playbook-record", owner: "Participant Record" },
  { match: "portfolio", owner: "Participant Record" },
  { match: "record", owner: "Participant Record" },
  { match: "u/", owner: "Participant Record" },
  { match: "badges", owner: "Participant Record" },
  { match: "certificates", owner: "Participant Record" },

  // ============================
  // Academic Intelligence
  // ============================

  { match: "academic-intelligence", owner: "Academic Intelligence" },
  { match: "academic-readiness", owner: "Academic Intelligence" },
  { match: "ag", owner: "Academic Intelligence" },
  { match: "graduation", owner: "Academic Intelligence" },
  { match: "gpa", owner: "Academic Intelligence" },

  // ============================
  // Evidence
  // ============================

  { match: "transcript", owner: "Evidence Engine" },
  { match: "evidence", owner: "Evidence Engine" },

  // ============================
  // Athletics
  // ============================

  { match: "athletics", owner: "Athletics Engine" },
  { match: "scholar-athlete", owner: "Athletics Engine" },
  { match: "athlete", owner: "Athletics Engine" },

  // ============================
  // Learning
  // ============================

  { match: "courses", owner: "Learning Engine" },
  { match: "tutorial", owner: "Learning Engine" },

  // ============================
  // Opportunities
  // ============================

  { match: "opportunity", owner: "Opportunity Engine" },
  { match: "opportunities", owner: "Opportunity Engine" },
  { match: "recommenders", owner: "Opportunity Engine" },

  // ============================
  // Relationships
  // ============================

  { match: "network", owner: "Relationship Engine" },
  { match: "connections", owner: "Relationship Engine" },
  { match: "mentor", owner: "Relationship Engine" },
  { match: "mentorship", owner: "Relationship Engine" },
  { match: "collaboration", owner: "Relationship Engine" },

  // ============================
  // Communication
  // ============================

  { match: "messages", owner: "Communication Engine" },
  { match: "notifications", owner: "Communication Engine" },
  { match: "email", owner: "Communication Engine" },

  // ============================
  // Economy
  // ============================

  { match: "economy", owner: "Economy Engine" },
  { match: "reward", owner: "Economy Engine" },
  { match: "gamification", owner: "Economy Engine" },
  { match: "store", owner: "Economy Engine" },

  // ============================
  // Compass
  // ============================

  { match: "compass", owner: "Compass Engine" },
  { match: "journey", owner: "Compass Engine" },
  { match: "dashboard", owner: "Compass Engine" },

  // ============================
  // Workflow
  // ============================

  { match: "workflow", owner: "Workflow Engine" },
  { match: "action-routing", owner: "Workflow Engine" },

  // ============================
  // Founder
  // ============================

  { match: "founder", owner: "Founder Platform" },

  // ============================
  // UI
  // ============================

  { match: "components/ui", owner: "Design System" },
  { match: "design-system", owner: "Design System" },
  { match: "theme", owner: "Design System" },

  // ============================
  // System
  // ============================

  { match: "app-shell", owner: "System Shell" },
  { match: "shell", owner: "System Shell" },

  // ============================
  // Trust
  // ============================

  { match: "trust", owner: "Trust Engine" }

];

export function resolveOwner(file: string): string {
  const normalized = file.toLowerCase();

  for (const rule of OWNERSHIP_RULES) {
    if (normalized.includes(rule.match.toLowerCase())) {
      return rule.owner;
    }
  }

  return "Unassigned";
}
