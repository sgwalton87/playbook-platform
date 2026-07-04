export type GuidedRole =
  | "scholar"
  | "scholar_athlete"
  | "family"
  | "educator"
  | "mentor"
  | "district"
  | "university"
  | "employer";

export function getRoleTour(role: GuidedRole) {
  const common = [
    { id: "dashboard", title: "Start at your dashboard", href: "/dashboard" },
    { id: "messages", title: "Coordinate in Messages", href: "/messages" },
    { id: "notifications", title: "Check what needs attention", href: "/notifications" },
  ];

  const roleSpecific: Record<GuidedRole, Array<{ id: string; title: string; href: string }>> = {
    scholar: [
      { id: "record", title: "Build your Scholar Record", href: "/record" },
      { id: "applications", title: "Prepare applications", href: "/opportunity-toolkit" },
    ],
    scholar_athlete: [
      { id: "athlete", title: "Track eligibility, recruiting, and NIL", href: "/scholar-athlete-os" },
      { id: "portfolio", title: "Share recruiting/application packet", href: "/portfolio/demo" },
    ],
    family: [{ id: "family", title: "Support your scholar", href: "/family-os" }],
    educator: [{ id: "educator", title: "Verify and support evidence", href: "/educator-os" }],
    mentor: [{ id: "mentor", title: "Coach next steps", href: "/mentor-os" }],
    district: [{ id: "district", title: "Track system equity signals", href: "/district-os" }],
    university: [{ id: "university", title: "View outreach readiness", href: "/university-os" }],
    employer: [{ id: "employer", title: "Connect opportunity pathways", href: "/employer-os" }],
  };

  return [...common, ...roleSpecific[role]];
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
