import type { OperatorExecutionResult } from "./executor";
import type { PBOSRecoveryAssessment } from "../recovery";
import {
  operatorPipelineReady,
  type OperatorCapability,
} from "./capability-audit";

export function formatOperatorReport(
  result: OperatorExecutionResult,
  assessment: PBOSRecoveryAssessment,
  capabilities: readonly OperatorCapability[] = []
): string {
  const { plan } = result;
  const action = plan.human_action;
  return [
    "PBOS OPERATOR MODE",
    "",
    `Intent: ${plan.intent}`,
    `Status: ${result.status}`,
    "",
    "CURRENT STATE:",
    `Context: ${assessment.trust_state.level}`,
    `Lifecycle: ${plan.decision.current_state}`,
    `Repository: ${assessment.repository_state.artifact_state}`,
    "",
    "Diagnosis:",
    ...assessment.diagnosis.map((finding) => `- ${finding}`),
    "",
    "",
    "AVAILABLE ACTION:",
    `${plan.decision.transition}${plan.decision.command ? ` via ${plan.decision.command}` : ""}`,
    "",
    "AUTOMATIC ACTIONS:",
    ...plan.automatic_actions.map((item) => `- PASS: ${item}`),
    "",
    "HUMAN ACTION REQUIRED:",
    ...(action
      ? [
          `Reason: ${action.reason}`,
          `Why: ${action.why}`,
          `Previous: ${action.previous_identity ?? "NONE"}`,
          `Proposed: ${action.proposed_identity}`,
          `Command: ${action.command}`,
        ]
      : ["NONE"]),
    "",
    "NEXT COMMAND:",
    action?.command ?? plan.decision.command ?? "PBOS continues automatically",
    "",
    `Build Pipeline: ${operatorPipelineReady(capabilities) ? "READY" : "INCOMPLETE"}`,
    ...capabilities.map(({ capability, status, blocker }) =>
      `- ${capability}: ${status}${blocker ? ` - ${blocker}` : ""}`
    ),
    "",
    `Plan: ${plan.plan_id}`,
    `Digest: ${plan.digest}`,
    "Mutation: NOT PERFORMED",
  ].join("\n");
}
