export type TrustSummary = {
  score: number;
  level: "building" | "evidenced" | "verified" | "opportunity_ready";
  evidenceCount: number;
  verifiedCount: number;
  pendingVerificationCount: number;
  recentActivityCount: number;
  signals: Array<{ id: string; label: string; value: string; points: number }>;
  nextSteps: Array<{ id: string; label: string; href: string; reason: string; priority: "high" | "medium" | "low" }>;
};

export type LaunchDashboardSummary = {
  scholarId: string;
  scholarName: string;
  trust: TrustSummary;
  opportunityCount: number;
  unreadNotificationCount: number;
  openActionCount: number;
};
