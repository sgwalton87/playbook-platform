import { artifactDigest } from "../../kernel/identity";
import type { MitigationPlan, RiskAssessment, RiskFinding } from "./types";

export function assessRisk(input: {
  readonly id: string;
  readonly findings: readonly RiskFinding[];
  readonly mitigations: readonly MitigationPlan[];
}): RiskAssessment {
  if (
    input.findings.length === 0 ||
    input.findings.some(({ evidence }) => evidence.length === 0)
  ) {
    throw new Error("Risk assessment requires evidence.");
  }
  const findings = [...input.findings]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((finding) => ({
      ...finding,
      score: {
        ...finding.score,
        total: Math.round(
          finding.score.likelihood * 0.35 +
            finding.score.impact * 0.5 +
            (100 - finding.score.reversibility) * 0.15
        ),
      },
    }));
  const maximum = Math.max(...findings.map(({ score }) => score.total));
  const body: RiskAssessment = {
    id: input.id,
    findings,
    mitigations: [...input.mitigations].sort((a, b) =>
      a.finding_id.localeCompare(b.finding_id)
    ),
    risk_level:
      maximum >= 85
        ? "CRITICAL"
        : maximum >= 65
          ? "HIGH"
          : maximum >= 35
            ? "MEDIUM"
            : "LOW",
    confidence: Math.min(100, input.findings.length * 20),
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
