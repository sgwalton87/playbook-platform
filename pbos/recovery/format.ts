import type { PBOSRecoveryAssessment } from "./types";

export function formatPBOSRecoveryAssessment(
  assessment: PBOSRecoveryAssessment
): string {
  const sequence = assessment.required_sequence.length
    ? assessment.required_sequence.flatMap((step, index) => [
        `${index + 1}. ${step.command}`,
        `   Purpose: ${step.purpose}`,
      ])
    : ["NONE"];
  return [
    "PBOS RECOVERY ASSESSMENT",
    "",
    `Assessment: ${assessment.assessment_id}`,
    `Repository: ${assessment.repository_state.identity}`,
    `Branch: ${assessment.repository_state.branch}`,
    `Commit: ${assessment.repository_state.commit}`,
    `Working Tree: ${assessment.repository_state.working_tree}`,
    "",
    `Trust Level: ${assessment.trust_state.level}`,
    `Context Validation: ${assessment.context_state.validation}`,
    `Current Phase: ${assessment.current_phase}`,
    `Recovery Required: ${assessment.recovery_required ? "YES" : "NO"}`,
    "",
    "Diagnosis:",
    ...assessment.diagnosis.map((finding) => `- ${finding}`),
    "",
    `Recommended Transition: ${assessment.recommended_transition}`,
    "",
    "Recovery Sequence:",
    ...sequence,
    "",
    "Expected Artifacts:",
    ...(assessment.expected_artifacts.length
      ? assessment.expected_artifacts.map(
          ({ path, owner }) => `- ${path} (${owner})`
        )
      : ["NONE"]),
    "",
    "Human Approvals Required:",
    ...(assessment.approval_requirements.length
      ? assessment.approval_requirements.map(
          ({ transition, independent_reviewer_required: independent }) =>
            `- ${transition}: requester required; independent reviewer ${independent ? "required" : "not required"}`
        )
      : ["NONE"]),
    "",
    "Verification:",
    ...assessment.validation_commands.map((command) => `- ${command}`),
    "",
    `Digest: ${assessment.digest}`,
    "Mutation: NOT PERFORMED",
  ].join("\n");
}
