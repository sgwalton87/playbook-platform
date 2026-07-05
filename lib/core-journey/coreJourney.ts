export type CoreJourneyStatus =
  | "not_started"
  | "in_progress"
  | "needs_attention"
  | "ready"
  | "complete";

export type CoreJourneyStep = {
  id: string;
  order: number;
  label: string;
  shortLabel: string;
  description: string;
  href: string;
  icon: string;
  domain:
    | "record"
    | "academic"
    | "athletics"
    | "opportunity"
    | "applications"
    | "support"
    | "learning"
    | "rewards";
};

export const CORE_JOURNEY: CoreJourneyStep[] = [
  {
    id: "record",
    order: 1,
    label: "Build Your Scholar Record",
    shortLabel: "My Record",
    description:
      "Create the living record that powers academic, opportunity, application, and support intelligence.",
    href: "/record",
    icon: "◈",
    domain: "record",
  },
  {
    id: "transcript",
    order: 2,
    label: "Upload or Enter Your Transcript",
    shortLabel: "Transcript",
    description:
      "Add academic evidence so Playbook can analyze readiness, gaps, and next steps.",
    href: "/transcript",
    icon: "▤",
    domain: "academic",
  },
  {
    id: "academic-readiness",
    order: 3,
    label: "Understand Academic Readiness",
    shortLabel: "Academic Readiness",
    description:
      "See A–G progress, graduation readiness, academic strengths, gaps, and recommended actions.",
    href: "/academic-readiness",
    icon: "◎",
    domain: "academic",
  },
  {
    id: "scholar-athlete",
    order: 4,
    label: "Protect Scholar-Athlete Eligibility",
    shortLabel: "Scholar-Athlete",
    description:
      "Coordinate academics, eligibility, recruiting, exposure, deadlines, NIL, and financial readiness.",
    href: "/scholar-athlete-os",
    icon: "★",
    domain: "athletics",
  },
  {
    id: "opportunities",
    order: 5,
    label: "Find Right-Fit Opportunities",
    shortLabel: "Opportunities",
    description:
      "Connect readiness evidence to colleges, scholarships, programs, careers, and other opportunities.",
    href: "/opportunities",
    icon: "↗",
    domain: "opportunity",
  },
  {
    id: "applications",
    order: 6,
    label: "Build Strong Applications",
    shortLabel: "Applications",
    description:
      "Turn the Scholar Record into resumes, brag sheets, recommendation workflows, portfolios, and applications.",
    href: "/opportunity-toolkit",
    icon: "✦",
    domain: "applications",
  },
  {
    id: "support",
    order: 7,
    label: "Activate Your Support Network",
    shortLabel: "Support Network",
    description:
      "Invite family, educators, mentors, coaches, and advocates into coordinated action.",
    href: "/support-network",
    icon: "∞",
    domain: "support",
  },
  {
    id: "courses",
    order: 8,
    label: "Build Knowledge and Skills",
    shortLabel: "Courses",
    description:
      "Complete learning experiences in financial literacy, opportunity readiness, athletics, and upward mobility.",
    href: "/courses",
    icon: "◇",
    domain: "learning",
  },
  {
    id: "rewards",
    order: 9,
    label: "Earn and Use Rewards",
    shortLabel: "Rewards",
    description:
      "Earn coins for verified progress and use them in the Playbook economy.",
    href: "/reward-economy",
    icon: "◆",
    domain: "rewards",
  },
];

export function getCoreJourneyStep(id: string) {
  return CORE_JOURNEY.find((step) => step.id === id) || null;
}

export function getCoreJourneyNavigation() {
  return CORE_JOURNEY.map((step) => ({
    label: step.shortLabel,
    href: step.href,
    icon: step.icon,
  }));
}

export function getNextJourneyStep(currentId: string) {
  const index = CORE_JOURNEY.findIndex((step) => step.id === currentId);

  if (index < 0 || index === CORE_JOURNEY.length - 1) {
    return null;
  }

  return CORE_JOURNEY[index + 1];
}

export function calculateJourneyProgress(
  statuses: Record<string, CoreJourneyStatus>
) {
  const completed = CORE_JOURNEY.filter((step) =>
    ["ready", "complete"].includes(statuses[step.id] || "not_started")
  ).length;

  return {
    completed,
    total: CORE_JOURNEY.length,
    percent: Math.round((completed / CORE_JOURNEY.length) * 100),
  };
}
