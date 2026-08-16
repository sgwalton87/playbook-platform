import type { PlaybookRole } from "@/lib/roles/registry";
import type { OnboardingStep } from "../types";

const SELF_OWNED_SUPPORT_ROLES = new Set<PlaybookRole>([
  "scholar",
  "scholar-athlete",
  "transition-youth",
]);

const SUPPORT_INVITATION_PLAN: OnboardingStep = {
  id: "support-plan",
  phase: "Support Network Plan",
  title: "Plan the people you may invite after onboarding.",
  body: "Save email addresses as private planning notes. No invitation or access is created here. After onboarding, open Support Network, choose each person's exact role, and send the governed invitation. Mentor invitations require the Mentor relationship and support-system validation.",
  fields: [
    {
      key: "invite_supporters",
      label: "Supporter emails to review in Support Network",
      type: "invite-list",
      placeholder: "supporter@example.com",
    },
  ],
};

const COMMUNITY_PARTNER_CONTEXT: OnboardingStep = {
  id: "community-partner-context",
  phase: "Community Partner · Organization Context",
  title: "Describe the community capacity you represent.",
  body: "Community Partner onboarding creates an organization profile for authority review. It does not create Scholar access or support relationships.",
  fields: [
    { key: "organization_name", label: "Organization or program name", placeholder: "Organization name" },
    {
      key: "organization_type",
      label: "Organization type",
      type: "select",
      options: ["Nonprofit", "Community-based organization", "Public agency", "Faith-based organization", "Arts organization", "Youth program", "Health or wellness provider", "Other"],
    },
    { key: "official_email", label: "Official organization email", placeholder: "you@organization.org" },
    { key: "organization_website", label: "Organization website", placeholder: "https://" },
    {
      key: "community_services",
      label: "Programs or services offered",
      type: "multi-select",
      options: ["Mentoring", "Academic support", "Arts and media", "Athletics", "Mental wellness", "Housing support", "Food access", "Career readiness", "Financial education", "Family services", "Other"],
    },
    { key: "service_area", label: "Geographic service area", placeholder: "Neighborhood, city, county, state, or national" },
  ],
};

export function applyRoleOnboardingIndependence(
  role: PlaybookRole,
  configuredSteps: readonly OnboardingStep[]
): OnboardingStep[] {
  let steps = [...configuredSteps];

  // TAY is a self-owned Scholar Record specialization, not an athlete alias.
  if (role === "transition-youth") {
    steps = steps.filter(
      (step) => step.id !== "athlete-profile" && step.id !== "athlete-recruiting"
    );
  }

  if (SELF_OWNED_SUPPORT_ROLES.has(role)) {
    // The legacy network step attempted to send role-less invitations. Replace
    // it with a planning-only step whose ID deliberately cannot trigger the
    // legacy sendInvites branch in app/start/page.tsx.
    steps = steps.map((step) =>
      step.id === "network" ? SUPPORT_INVITATION_PLAN : step
    );
  } else {
    // External/support roles do not acquire authority by inviting other roles
    // during their own onboarding.
    steps = steps.filter((step) => step.id !== "network");
  }

  if (role === "other") {
    const agreementIndex = steps.findIndex((step) => step.id === "community-safety");
    if (agreementIndex >= 0) {
      steps.splice(agreementIndex, 0, COMMUNITY_PARTNER_CONTEXT);
    } else {
      steps.push(COMMUNITY_PARTNER_CONTEXT);
    }
  }

  return steps;
}
