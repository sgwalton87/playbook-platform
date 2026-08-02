import type { TrustSummary } from "./types";

export function buildTrustSummary(input: { evidenceCount: number; verifiedCount: number; pendingVerificationCount: number; recentActivityCount: number }): TrustSummary {
  const evidencePoints = Math.min(30, input.evidenceCount * 6);
  const verificationPoints = input.evidenceCount > 0 ? Math.round((input.verifiedCount / input.evidenceCount) * 40) : 0;
  const activityPoints = Math.min(20, input.recentActivityCount * 4);
  const completionPoints = input.evidenceCount > 0 && input.pendingVerificationCount === 0 ? 10 : 0;
  const score = Math.min(100, evidencePoints + verificationPoints + activityPoints + completionPoints);
  const level = score >= 80 ? "opportunity_ready" : score >= 60 ? "verified" : score >= 30 ? "evidenced" : "building";
  const nextSteps: TrustSummary["nextSteps"] = [];
  if (input.evidenceCount === 0) nextSteps.push({ id: "add-evidence", label: "Add your first evidence item", href: "/record", reason: "Evidence makes growth portable and reviewable.", priority: "high" });
  if (input.evidenceCount > input.verifiedCount && input.pendingVerificationCount === 0) nextSteps.push({ id: "request-verification", label: "Request evidence verification", href: "/evidence", reason: "Verified evidence strengthens opportunity readiness.", priority: "high" });
  if (input.pendingVerificationCount > 0) nextSteps.push({ id: "track-verification", label: "Track pending verification", href: "/evidence", reason: `${input.pendingVerificationCount} request${input.pendingVerificationCount === 1 ? " is" : "s are"} awaiting review.`, priority: "medium" });
  if (score >= 60) nextSteps.push({ id: "review-opportunities", label: "Review evidence-backed opportunities", href: "/opportunities", reason: "Your verified record can support governed matching.", priority: "medium" });
  return {
    score, level, evidenceCount: input.evidenceCount, verifiedCount: input.verifiedCount,
    pendingVerificationCount: input.pendingVerificationCount, recentActivityCount: input.recentActivityCount,
    signals: [
      { id: "evidence", label: "Evidence", value: String(input.evidenceCount), points: evidencePoints },
      { id: "verification", label: "Verified", value: String(input.verifiedCount), points: verificationPoints },
      { id: "activity", label: "Recent activity", value: String(input.recentActivityCount), points: activityPoints },
    ], nextSteps,
  };
}
