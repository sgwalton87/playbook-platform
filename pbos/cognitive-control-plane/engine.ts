import { artifactDigest } from "../kernel/identity";
import type { AgentDecision } from "../agents/governance";
import type { MissionAlignmentAssessment } from "../intelligence/mission";
import type { RiskAssessment } from "../intelligence/risk";
import type { SimulationResult } from "../simulation";
import type {
  CognitiveControlPlaneContext,
  CognitiveRecommendation,
  GovernedEvidenceReference,
} from "./types";

export class CognitiveControlPlane {
  recommend(input: {
    readonly context: CognitiveControlPlaneContext;
    readonly mission: MissionAlignmentAssessment;
    readonly risk: RiskAssessment;
    readonly simulation: SimulationResult;
    readonly agent: AgentDecision | null;
    readonly evidence: readonly GovernedEvidenceReference[];
    readonly expected_impact: string;
  }): CognitiveRecommendation {
    if (
      !input.context.context_trusted ||
      !input.context.authority_id ||
      !input.mission.aligned ||
      ["HIGH", "CRITICAL"].includes(input.risk.risk_level) ||
      input.simulation.production_authority !== false ||
      input.evidence.length === 0 ||
      (input.agent !== null && !input.agent.admitted)
    ) {
      throw new Error("Cognitive control plane recommendation rejected.");
    }
    const evidence = [...input.evidence].sort((a, b) =>
      a.id.localeCompare(b.id)
    );
    const evidenceDigest = artifactDigest(evidence);
    const body: CognitiveRecommendation = {
      recommendation_id: `COGNITIVE-${evidenceDigest.slice(0, 16)}`,
      source_evidence: evidence,
      confidence: Math.min(
        input.mission.confidence,
        input.risk.confidence,
        input.simulation.confidence
      ),
      reasoning: [
        ...input.mission.reasoning,
        `Risk: ${input.risk.risk_level}`,
        ...input.simulation.limitations.map(
          (limitation) => `Simulation limitation: ${limitation}`
        ),
      ],
      expected_impact: input.expected_impact,
      human_review_required: true,
      digest: "",
    };
    return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
  }
}
