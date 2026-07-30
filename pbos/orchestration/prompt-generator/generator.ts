import { artifactDigest } from "../../kernel/identity";
import type { ExecutionPlan, KernelInput } from "../../kernel/execution";
import type { NextMilestoneRecommendation } from "../recommendation";
import type { CodexExecutionPackage } from "./types";

export function generateCodexExecutionPackage(
  input: KernelInput,
  recommendation: NextMilestoneRecommendation,
  plan: ExecutionPlan | null
): CodexExecutionPackage {
  if (
    !recommendation.recommended_milestone ||
    !recommendation.dependencies_satisfied ||
    recommendation.confidence !== 100 ||
    !plan ||
    plan.objectiveId !== recommendation.recommended_milestone
  ) {
    throw new Error("Codex execution package generation blocked.");
  }
  const body: CodexExecutionPackage = {
    package_id: `CODEX-${recommendation.recommendation_id}`,
    milestone_id: plan.objectiveId,
    mission: `Implement ${plan.objectiveId} through the governed PBOS lifecycle.`,
    context: [
      `Repository: ${input.repository.root}`,
      `Branch: ${input.repository.branch}`,
      `Commit: ${input.repository.head}`,
      `Engine: ${input.runtime.engineVersion}`,
    ],
    current_state: [
      `Release: ${input.runtime.releaseState}`,
      `Active gate: ${input.runtime.activeGate ?? "none"}`,
    ],
    dependencies: [...plan.dependencies],
    required_changes: [...plan.outputs],
    implementation_requirements: [...plan.successCriteria],
    security_requirements: [
      "Preserve fail-closed behavior.",
      "Do not bypass authorization, lifecycle, validation, or certification.",
    ],
    validation_requirements: [...plan.validations],
    documentation_requirements: plan.outputs.filter((output) =>
      output.startsWith("docs/")
    ),
    completion_criteria: [...plan.successCriteria],
    human_approval_required: true,
    recommendation_digest: recommendation.digest,
    timestamp: input.observedAt,
    digest: "",
  };
  return { ...body, digest: artifactDigest({ ...body, digest: undefined }) };
}
