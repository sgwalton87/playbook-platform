export function getBeta33CompletionChecklist() {
  return [
    { item: "Resume Builder foundation", status: "complete" },
    { item: "Recommendation Letter Studio", status: "complete" },
    { item: "Brag Sheet builder", status: "complete" },
    { item: "Portfolio Packet export foundation", status: "complete" },
    { item: "Application Assistant", status: "complete" },
    { item: "PDF rendering route", status: "complete" },
    { item: "Shareable portfolio links", status: "complete" },
    { item: "Recommender approval workflow", status: "complete" },
    { item: "Portfolio share persistence", status: "complete" },
    { item: "Recommender request persistence", status: "complete" },
    { item: "Application workspace persistence", status: "complete" },
    { item: "RLS policy foundation", status: "complete" },
    { item: "Secure sharing helpers", status: "complete" },
    { item: "Scholar data adapter", status: "complete" },
    { item: "Recommender auth handoff foundation", status: "complete" },
    { item: "Application Workspace UI", status: "complete" },
    { item: "End-to-end application journey model", status: "complete" },
  ];
}

export function getBeta33CompletionStatus() {
  const checklist = getBeta33CompletionChecklist();
  const complete = checklist.filter((item) => item.status === "complete").length;

  return {
    label: complete === checklist.length
      ? "Beta 3.3 Complete"
      : "Beta 3.3 In Progress",
    total: checklist.length,
    complete,
    percent: Math.round((complete / checklist.length) * 100),
  };
}

export function buildBeta33ApplicationJourney() {
  return [
    "Scholar creates application workspace",
    "Scholar generates resume profile",
    "Scholar builds brag sheet",
    "Scholar requests recommendation",
    "Recommender receives request",
    "Recommender submits or revises letter",
    "Scholar approves recommendation",
    "Scholar generates portfolio packet",
    "PDF route renders packet",
    "Secure portfolio link is shared",
    "Application workspace reaches ready state",
  ];
}
