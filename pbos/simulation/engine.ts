import { artifactDigest } from "../kernel/identity";
import type {
  ImpactProjection,
  RollbackPlan,
  SimulationRequest,
  SimulationResult,
} from "./types";

export function simulateChange(input: {
  readonly request: SimulationRequest;
  readonly projections: readonly ImpactProjection[];
  readonly rollback: RollbackPlan;
  readonly limitations: readonly string[];
}): SimulationResult {
  if (
    !input.request.requested_by ||
    input.request.evidence.length === 0 ||
    input.projections.length === 0 ||
    !input.rollback.owner ||
    input.rollback.steps.length === 0 ||
    input.rollback.validation.length === 0
  ) {
    throw new Error("Simulation evidence or rollback is incomplete.");
  }
  const requestDigest = artifactDigest(input.request);
  const body: SimulationResult = {
    id: `SIMULATION-${requestDigest.slice(0, 16)}`,
    request_digest: requestDigest,
    projections: [...input.projections].sort((a, b) =>
      a.domain.localeCompare(b.domain)
    ),
    rollback: input.rollback,
    limitations: [...input.limitations].sort(),
    evidence: [...input.request.evidence].sort((a, b) =>
      a.id.localeCompare(b.id)
    ),
    confidence: Math.min(
      ...input.projections.map(({ confidence }) => confidence)
    ),
    production_authority: false,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
