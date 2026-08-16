export type AuditControlCheck = {
  id: string;
  category: "architecture" | "security" | "routing" | "database" | "observability";
  description: string;
  file: string;
  required?: string[];
  forbidden?: string[];
};

/**
 * Audit Control is an implementation-level PBOS control plane. It does not own
 * product data or replace canonical specifications. Each check points back to
 * an existing implementation artifact and fails closed when that artifact
 * drifts from the certified architecture.
 */
export const AUDIT_CONTROL_CHECKS: AuditControlCheck[] = [
  {
    id: "audit-db-local-only",
    category: "database",
    description: "Free database certification must remain isolated from hosted production.",
    file: ".github/workflows/database-certification.yml",
    required: [
      "supabase db reset --local",
      "relationship_authority_preflight.sql",
      "support_invitation_authority_preflight.sql",
      "profile_authority_preflight.sql",
    ],
    forbidden: ["supabase link", "db push", "--linked", "SUPABASE_ACCESS_TOKEN"],
  },
  {
    id: "audit-profile-authority",
    category: "security",
    description: "Profile identity and completion must be governed by narrow RPC boundaries.",
    file: "supabase/migrations/202608160018_profile_authority_hardening.sql",
    required: [
      "initialize_playbook_profile",
      "select_playbook_role",
      "complete_playbook_onboarding",
      "revoke insert, update, delete on public.profiles from authenticated",
    ],
  },
  {
    id: "audit-application-learner-authority",
    category: "security",
    description: "Application workspaces must remain restricted to durable, onboarded learner roles and preserve the learner PBOS role.",
    file: "app/api/application-workspaces/route.ts",
    required: ["requireLearnerAuthority", "requireOnboarding: true", "pbosRoleForLearner"],
    forbidden: ["registerIdentity: userId => connector.registerIdentity(userId, \"SCHOLAR\")"],
  },
  {
    id: "audit-brand-gate",
    category: "security",
    description: "Brand Partner operational workspace must remain behind independent authority verification.",
    file: "app/brand-partner-os/page.tsx",
    required: ["BrandPartnerVerificationGate"],
  },
  {
    id: "audit-canonical-admissions-route",
    category: "routing",
    description: "Legacy University OS must redirect to the canonical Admissions OS.",
    file: "app/university-os/page.tsx",
    required: ["redirect(\"/admissions-os\")"],
    forbidden: ["RoleDashboardExperience"],
  },
  {
    id: "audit-ambiguous-role-aliases",
    category: "routing",
    description: "Generic admin/partner aliases must fail closed instead of granting a public role.",
    file: "lib/roles/registry.ts",
    forbidden: ["\n  admin: \"district\"", "\n  partner: \"employer\""],
  },
  {
    id: "audit-sentinel-present",
    category: "observability",
    description: "Playbook Sentinel remains available as the shared platform health service.",
    file: "scripts/sentinel.ts",
    required: ["runSentinel", "SENTINEL_REPORT.md"],
  },
  {
    id: "audit-cartographer-present",
    category: "architecture",
    description: "Playbook Cartographer remains available for architecture mapping.",
    file: "scripts/cartographer.ts",
    required: ["runCartographer"],
  },
  {
    id: "audit-pbos-status-present",
    category: "observability",
    description: "PBOS engine health/status remains a callable shared control surface.",
    file: "pbos/commands/status.ts",
    required: ["getEngineHealth", "CommandRegistry"],
  },
];
