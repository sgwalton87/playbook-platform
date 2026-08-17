import type { CapabilityGroup } from "@/lib/platform/capabilityMap";
import { CAPABILITY_GROUPS } from "@/lib/platform/capabilityMap";

export const ACCOUNT_CAPABILITY_GROUP: CapabilityGroup = {
  id: "account",
  label: "Account & Getting Started",
  description: "Secure account access, role setup, onboarding, and the controls that establish your Playbook identity.",
  icon: "✦",
  items: [
    { label: "Sign in & account access", description: "Secure email/password and Google authentication through the shared identity service.", status: "built-in" },
    { label: "Email verification", description: "Verify ownership of the account before entering protected Playbook workflows.", status: "built-in" },
    { label: "CAPTCHA protection", description: "Human-verification protection on account creation.", status: "built-in" },
    { label: "PKCE callback security", description: "Secure authentication-code exchange for sign-in and verification callbacks.", status: "built-in" },
    { label: "Remember Me", description: "Choose whether authentication survives the browser session.", status: "built-in" },
    { label: "Session timeout", description: "Shared inactivity warning and secure sign-out behavior.", status: "built-in" },
    { label: "Password recovery", description: "Protected reset flow initiated from the login experience.", status: "built-in" },
    { label: "Role selection", description: "Choose the Playbook role that determines onboarding and the authorized OS destination.", href: "/role-select", status: "available" },
    { label: "Onboarding", description: "Complete the role-aware setup that creates your private Playbook Record and routes you to the correct OS.", href: "/start", status: "available" },
    { label: "Onboarding autosave", description: "Durably saves ordinary onboarding edits through the owner-scoped profile authority.", status: "built-in" },
    { label: "Dynamic user agreement", description: "Role-aware agreement and consent experience tied to onboarding requirements.", status: "in-audit" },
  ],
};

export const FOUNDER_CAPABILITY_GROUP: CapabilityGroup = {
  id: "founder-operations",
  label: "Founder & Platform Operations",
  description: "Governed operator workspaces for verification, architecture, release quality, system health, and platform stewardship.",
  icon: "⌘",
  items: [
    { label: "Founder Command Center", description: "Restricted Founder/Admin entry point for platform inspection and stewardship.", href: "/founder", status: "available" },
    { label: "Verification Review Center", description: "Review role-verification evidence through the database-backed reviewer authority.", href: "/admin", status: "available" },
    { label: "Playbook Studio", description: "Restricted inspection workspace. Operational health remains explicitly Not connected until backed by real observability.", href: "/studio", status: "available" },
    { label: "Project intelligence", description: "Evidence-backed view of product capability, dependency, and delivery state.", status: "planned" },
    { label: "Analytics", description: "Privacy-respecting adoption, outcome, reliability, and experience analytics.", status: "planned" },
    { label: "User management", description: "Governed identity and account administration with least-privilege controls.", status: "planned" },
    { label: "Moderation", description: "Governed content and safety review using existing admin authority boundaries.", status: "in-audit" },
    { label: "Feature flags", description: "Controlled feature release and rollback management.", status: "planned" },
    { label: "Bug tracking", description: "Operator view of verified defects, owners, severity, and resolution evidence.", status: "planned" },
    { label: "Release management", description: "Release candidates, gates, production evidence, and rollback context.", status: "planned" },
    { label: "Architecture viewer", description: "Human-readable view of canonical services, dependencies, routes, and ownership.", status: "planned" },
    { label: "Documentation center", description: "Governed specifications, architecture, decisions, and historical context.", status: "planned" },
    { label: "Content review", description: "Governed review workflow for platform-managed content and learning material.", status: "planned" },
    { label: "System health", description: "Real logs, metrics, health checks, deployment and service signals—never hard-coded status.", status: "planned" },
  ],
};

export function getCapabilityCatalog({ includeFounder = false }: { includeFounder?: boolean } = {}) {
  return [
    ACCOUNT_CAPABILITY_GROUP,
    ...CAPABILITY_GROUPS,
    ...(includeFounder ? [FOUNDER_CAPABILITY_GROUP] : []),
  ];
}
