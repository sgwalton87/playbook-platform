export type AcademicProgressRow = {
  subject: string;
  years_completed: number | string | null;
  years_required: number | string | null;
  in_progress?: boolean | null;
};

export type ApplicationWorkspaceSummary = {
  id: string;
  opportunity_name: string;
  opportunity_type: string;
  status: "building" | "ready" | "submitted" | "archived" | string;
  deadline?: string | null;
};

export type AcademicRecommendation = {
  key: string;
  title: string;
  explanation: string;
  confidence: number;
  evidence: string[];
  actionLabel: string;
  actionRoute: string;
};

export type AcademicReadinessSnapshot = {
  readinessScore: number;
  agSubjectsMet: number;
  agSubjectsTotal: number;
  applicationsBuilding: number;
  applicationsReady: number;
  applicationsSubmitted: number;
  primaryRecommendation: AcademicRecommendation;
};

function asNumber(value: number | string | null | undefined) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function buildAcademicReadinessSnapshot(input: {
  agProgress: AcademicProgressRow[];
  applications: ApplicationWorkspaceSummary[];
}): AcademicReadinessSnapshot {
  const subjectsTotal = 7;
  const subjectsMet = new Set(
    input.agProgress
      .filter((row) => asNumber(row.years_completed) >= asNumber(row.years_required) && asNumber(row.years_required) > 0)
      .map((row) => row.subject)
  ).size;
  const readinessScore = Math.round((subjectsMet / subjectsTotal) * 100);
  const building = input.applications.filter((workspace) => workspace.status === "building");
  const ready = input.applications.filter((workspace) => workspace.status === "ready");
  const submitted = input.applications.filter((workspace) => workspace.status === "submitted");

  let primaryRecommendation: AcademicRecommendation;

  if (input.agProgress.length === 0) {
    primaryRecommendation = {
      key: "academic.transcript.activate",
      title: "Activate your academic record",
      explanation: "Playbook needs transcript evidence before it can make evidence-bound academic readiness recommendations.",
      confidence: 1,
      evidence: ["No A–G progress records are available yet."],
      actionLabel: "Upload or review transcript",
      actionRoute: "/transcript",
    };
  } else if (subjectsMet < subjectsTotal) {
    primaryRecommendation = {
      key: "academic.ag.close-gap",
      title: `Close ${subjectsTotal - subjectsMet} remaining A–G gap${subjectsTotal - subjectsMet === 1 ? "" : "s"}`,
      explanation: "A–G completion is the highest-priority academic readiness blocker visible in the canonical record.",
      confidence: 0.98,
      evidence: [`${subjectsMet} of ${subjectsTotal} A–G subject areas currently meet recorded requirements.`],
      actionLabel: "Review A–G evidence",
      actionRoute: "/transcript",
    };
  } else if (building.length > 0) {
    const next = [...building].sort((a, b) => (a.deadline || "9999-12-31").localeCompare(b.deadline || "9999-12-31"))[0];
    primaryRecommendation = {
      key: `academic.application.advance.${next.id}`,
      title: `Advance ${next.opportunity_name}`,
      explanation: "Your recorded A–G requirements are currently met, so the next highest-value academic action is advancing an active application workspace.",
      confidence: 0.92,
      evidence: ["All seven A–G subject areas currently meet recorded requirements.", `${building.length} application workspace${building.length === 1 ? " is" : "s are"} still building.`],
      actionLabel: "Open application workspace",
      actionRoute: "/application-workspaces",
    };
  } else if (ready.length > 0) {
    primaryRecommendation = {
      key: "academic.application.submit-ready",
      title: "Review a ready application for submission",
      explanation: "At least one application workspace has reached ready status and should move through human review before submission.",
      confidence: 0.95,
      evidence: [`${ready.length} application workspace${ready.length === 1 ? " is" : "s are"} marked ready.`],
      actionLabel: "Review ready applications",
      actionRoute: "/application-workspaces",
    };
  } else {
    primaryRecommendation = {
      key: "academic.opportunity.next",
      title: "Turn readiness into the next opportunity",
      explanation: "Your recorded A–G requirements are met and there is no unfinished application workspace competing for attention.",
      confidence: 0.9,
      evidence: ["All seven A–G subject areas currently meet recorded requirements.", `${submitted.length} application workspace${submitted.length === 1 ? " has" : "s have"} been submitted.`],
      actionLabel: "Explore opportunities",
      actionRoute: "/opportunities",
    };
  }

  return {
    readinessScore,
    agSubjectsMet: subjectsMet,
    agSubjectsTotal: subjectsTotal,
    applicationsBuilding: building.length,
    applicationsReady: ready.length,
    applicationsSubmitted: submitted.length,
    primaryRecommendation,
  };
}
