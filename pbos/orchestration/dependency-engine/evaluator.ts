import { artifactDigest } from "../../kernel/identity";
import type {
  KernelObjective,
  KernelResult,
} from "../../kernel/execution";
import type { MilestoneEligibilityAssessment } from "./types";

export function assessMilestoneEligibility(
  objective: KernelObjective,
  result: KernelResult
): MilestoneEligibilityAssessment {
  const selected = result.decision.selectedObjectiveId === objective.id;
  const state =
    objective.state === "COMPLETED"
      ? "COMPLETED"
      : selected && result.certification.status === "CERTIFIED"
        ? "READY"
        : objective.blockers.some((blocker) =>
              blocker.includes("EXTERNAL")
            )
          ? "WAITING_EXTERNAL_INPUT"
          : objective.state === "BLOCKED"
            ? "BLOCKED"
            : "NOT_READY";
  const body: MilestoneEligibilityAssessment = {
    milestone_id: objective.id,
    state,
    prerequisites: [...objective.requiredApprovals].sort(),
    dependencies: [...objective.dependencyIds].sort(),
    blockers: [...objective.blockers].sort(),
    risk: objective.risk,
    strategic_importance: objective.priority.strategic,
    implementation_readiness:
      objective.validations.length > 0 && objective.artifacts.every(({ digest }) => digest)
        ? 100
        : 0,
    evidence: objective.artifacts.map(({ digest }) => digest).filter(Boolean).sort(),
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
