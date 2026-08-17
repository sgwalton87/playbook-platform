export type PortfolioShareStatus = "draft" | "active" | "expired" | "revoked";

export const PORTFOLIO_SHARE_TARGET_USES = [
  "college",
  "scholarship",
  "internship",
  "job",
  "recruiting",
  "nil",
] as const;

export type PortfolioShareTargetUse = (typeof PORTFOLIO_SHARE_TARGET_USES)[number];

/**
 * Viewability is a lifecycle helper only. It does not authorize access to a
 * Scholar Record. Public share creation and resolution are governed by the
 * database RPCs so share ids cannot be derived from Scholar identifiers.
 */
export function canViewPortfolioShare(share: {
  status: PortfolioShareStatus;
  expiresAt?: string | null;
}) {
  if (share.status !== "active") return false;
  if (!share.expiresAt) return true;
  const expiresAt = new Date(share.expiresAt).getTime();
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export type RecommenderApprovalStatus =
  | "draft_submitted"
  | "approved"
  | "revision_requested"
  | "declined";

export function buildRecommendationApproval(input: {
  requestId: string;
  recommenderName: string;
  letterText: string;
  status?: RecommenderApprovalStatus;
  note?: string;
}) {
  return {
    requestId: input.requestId,
    recommenderName: input.recommenderName,
    letterText: input.letterText,
    status: input.status || "draft_submitted",
    note: input.note || null,
    updatedAt: new Date().toISOString(),
  };
}
