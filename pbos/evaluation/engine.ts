import { artifactDigest } from "../kernel/identity";
import type {
  ImpactAssessment,
  ImprovementRecommendation,
  OutcomeEvaluation,
  OutcomeMeasurement,
} from "./types";

export function evaluateOutcome(input: {
  readonly measurement: OutcomeMeasurement;
  readonly impact: ImpactAssessment;
  readonly recommendation: ImprovementRecommendation;
}): OutcomeEvaluation {
  if (
    input.measurement.evidence.length === 0 ||
    input.recommendation.evidence_ids.length === 0
  ) {
    throw new Error("Outcome evaluation requires evidence.");
  }
  const delta = input.measurement.observed - input.measurement.baseline;
  const targetDelta = input.measurement.target - input.measurement.baseline;
  const status =
    targetDelta === 0
      ? "INCONCLUSIVE"
      : delta / targetDelta >= 1
        ? "IMPROVED"
        : delta < 0
          ? "REGRESSED"
          : "INCONCLUSIVE";
  const body: OutcomeEvaluation = {
    measurement: input.measurement,
    impact: input.impact,
    signal: {
      finding: `${input.measurement.metric}: ${delta >= 0 ? "+" : ""}${delta}`,
      direction:
        status === "IMPROVED"
          ? "POSITIVE"
          : status === "REGRESSED"
            ? "NEGATIVE"
            : "INCONCLUSIVE",
      confidence: Math.min(100, input.measurement.evidence.length * 25),
    },
    recommendation: input.recommendation,
    status,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
