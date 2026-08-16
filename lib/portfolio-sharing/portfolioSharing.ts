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

export function buildPortfolioShare(input: {
  scholarId: string;
  scholarName: string;
  targetUse: PortfolioShareTargetUse;
  packet: LegacyValue;
  expiresAt?: string;
}) {
  const id = `portfolio-${input.scholarId}`;

  return {
    id,
    scholarId: input.scholarId,
    scholarName: input.scholarName,
    targetUse: input.targetUse,
    packet: input.packet,
    status: "active" as PortfolioShareStatus,
    shareUrl: `/portfolio/${id}`,
    expiresAt: input.expiresAt || null,
    createdAt: new Date().toISOString(),
  };
}

export function canViewPortfolioShare(share: {
  status: PortfolioShareStatus;
  expiresAt?: string | null;
}) {
  if (share.status !== "active") return false;
  if (!share.expiresAt) return true;
  return new Date(share.expiresAt).getTime() > Date.now();
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
