import {
  PLAYBOOK_ROLES,
  getRoleDestination,
  normalizePlaybookRole,
  type PlaybookRole,
} from "@/lib/roles/registry";

export type GuidedRole = PlaybookRole;

export type GuidedTourStep = {
  id: string;
  title: string;
  body: string;
  href: string;
};

const ROLE_FEATURES: Record<PlaybookRole, GuidedTourStep> = {
  scholar: { id: "record", title: "Build your Scholar Record", body: "Keep academics, activities, goals, evidence, and opportunities connected in one record.", href: "/record" },
  "scholar-athlete": { id: "athlete", title: "Run your Scholar-Athlete OS", body: "Track academic eligibility, recruiting, film, NIL readiness, and life beyond sport.", href: "/scholar-athlete-os" },
  "transition-youth": { id: "tay", title: "Build your supported next chapter", body: "Connect education, work, goals, opportunities, and your trusted support network.", href: "/dashboard" },
  family: { id: "family", title: "Support without taking over", body: "See shared deadlines, approved progress, and the actions your scholar wants help with.", href: "/family-os" },
  mentor: { id: "mentor", title: "Coach the next step", body: "Use goals, messages, and permissioned progress to provide focused guidance.", href: "/mentor-os" },
  educator: { id: "educator", title: "Support academic readiness", body: "Review student signals, verify evidence, and coordinate timely interventions.", href: "/educator-os" },
  counselor: { id: "counselor", title: "Coordinate counselor workflows", body: "Manage readiness, applications, financial aid milestones, and your approved caseload.", href: "/educator-os" },
  coach: { id: "coach", title: "Advocate for scholar-athletes", body: "Connect roster development, academic eligibility, film, and recruiting support.", href: "/educator-os" },
  "college-coach": { id: "recruiting", title: "Discover verified talent", body: "Use permissioned athlete records, recruiting criteria, and compliant contact workflows.", href: "/university-os" },
  "college-admissions": { id: "admissions", title: "Connect scholars to pathways", body: "Review verified readiness and coordinate responsible institutional outreach.", href: "/university-os" },
  "brand-partner": { id: "partner", title: "Create responsible partnerships", body: "Build campaigns, rewards, internships, and compliant scholar opportunities.", href: "/brand-partner-os" },
  employer: { id: "employer", title: "Open career pathways", body: "Create age-appropriate opportunities and review permissioned candidate evidence.", href: "/employer-os" },
  district: { id: "district", title: "Lead implementation responsibly", body: "Coordinate schools, readiness signals, permissions, and equity-focused outcomes.", href: "/district-os" },
  "athlete-abroad": { id: "abroad", title: "Prepare your international pathway", body: "Connect academics, athletics, eligibility, travel readiness, and trusted support.", href: "/athlete-abroad-os" },
  other: { id: "access", title: "Understand your Playbook access", body: "Your approved relationships and permissions determine what you can see and support.", href: "/pending" },
};

export function getRoleTour(input?: string | null): GuidedTourStep[] {
  const role = normalizePlaybookRole(input);
  const destination = getRoleDestination(role);

  return [
    { id: "home", title: `Welcome to ${PLAYBOOK_ROLES[role].osLabel}`, body: "Your home brings the most important signals, next steps, and relationships into one role-aware view.", href: destination },
    ROLE_FEATURES[role],
    { id: "support-network", title: "Meet your Support Network", body: "Starting Five and Support Network are one connected system for invitations, relationships, permissions, and shared action.", href: "/support-network" },
    { id: "messages", title: "Coordinate in Messages", body: "Keep questions, encouragement, and next actions connected to the right people.", href: "/messages" },
    { id: "notifications", title: "Know what needs attention", body: "Notifications surface invitations, deadlines, approvals, and important progress.", href: "/notifications" },
  ];
}

export function getTourProgress(input: { completedStepIds: string[]; role: GuidedRole }) {
  const steps = getRoleTour(input.role);
  return Math.round((input.completedStepIds.length / steps.length) * 100);
}

export function getContextualHelp(pathname: string) {
  if (pathname.includes("messages")) return "Use messages to coordinate around goals, actions, recommendations, and deadlines.";
  if (pathname.includes("store")) return "Redeem earned coins for approved partner rewards.";
  if (pathname.includes("scholar-athlete")) return "Track eligibility, recruiting, NIL, and athlete financial readiness.";
  if (pathname.includes("opportunity")) return "Build application-ready materials from your Scholar Record.";
  return "Use Playbook to turn activity into readiness, evidence, opportunity, and support.";
}
