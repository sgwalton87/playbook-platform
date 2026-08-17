export type AthleteSignal = {
  type:
    | "eligibility"
    | "recruiting"
    | "nil"
    | "financial"
    | "support";
  severity: "info" | "medium" | "high" | "urgent";
  title: string;
  detail: string;
  href: string;
};

export function rankAthleteSignals(
  signals: AthleteSignal[]
) {
  const weight = {
    urgent: 4,
    high: 3,
    medium: 2,
    info: 1,
  };

  return [...signals].sort(
    (a, b) => weight[b.severity] - weight[a.severity]
  );
}

export function buildAthleteNextActions(input: {
  eligibilityStatus: string;
  recruitingTargets: number;
  activeDeals: number;
  financialPlanComplete: boolean | null;
}) {
  const actions: AthleteSignal[] = [];

  if (input.eligibilityStatus !== "ready") {
    actions.push({
      type: "eligibility",
      severity: "urgent",
      title: "Protect eligibility",
      detail:
        "Review missing or unverified academic eligibility evidence.",
      href: "/scholar-athlete-os",
    });
  }

  if (input.recruitingTargets === 0) {
    actions.push({
      type: "recruiting",
      severity: "high",
      title: "Build recruiting pipeline",
      detail:
        "Add target programs and define the next outreach action.",
      href: "/scholar-athlete-os",
    });
  }

  if (input.activeDeals > 0 && input.financialPlanComplete === false) {
    actions.push({
      type: "financial",
      severity: "high",
      title: "Connect NIL income to your financial plan",
      detail:
        "Complete the athlete financial readiness learning path.",
      href: "/courses",
    });
  }

  return rankAthleteSignals(actions);
}
