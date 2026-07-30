import type { FounderOperatingLoopResult } from "../../autonomous";

export function formatItCommand(result: FounderOperatingLoopResult): string {
  const guidance = result.guidance;
  const humanEvidenceComplete =
    result.mission_control.change_boundary_status === "APPROVED" &&
    result.mission_control.launch_approval_status === "APPROVED";
  return [
    "=====================================",
    "PLAYBOOK OS",
    "MISSION CONTROL",
    "=====================================",
    "",
    "I understand the mission.",
    "I verified available repository evidence.",
    "I evaluated governed readiness.",
    "",
    `System readiness: ${result.readiness}`,
    `Launch status: ${result.launch_readiness.launch_status}`,
    `Mission alignment: ${result.mission_alignment.aligned ? "ALIGNED" : "CONFLICT"}`,
    `Next play: ${result.next_play ?? "NONE"}`,
    `Risk: ${result.risk?.risk ?? "NOT_AVAILABLE"}`,
    `Outcome: ${result.outcome}`,
    "",
    ...(guidance
      ? [
          `Current blocker: ${guidance.current_blocker}`,
          `Business impact: ${guidance.business_impact}`,
          `Why: ${guidance.why || "Required evidence is unavailable."}`,
          `Responsible authority: ${guidance.responsible_authority}`,
          "",
          "Required resolution:",
          ...guidance.required_resolution.map((step, index) => `${index + 1}. ${step}`),
          "",
          "Commands:",
          ...guidance.commands,
          "",
          `Expected next state: ${guidance.expected_next_state}`,
        ]
      : ["No guidance is required."]),
    "",
    `Current execution: ${result.mission_control.current_execution}`,
    `Authority state: ${result.mission_control.authority_state}`,
    `Human Evidence: ${humanEvidenceComplete ? "COMPLETE" : "MISSING"}`,
    `Change boundary: ${result.mission_control.change_boundary_status}`,
    `Launch approval: ${
      result.mission_control.launch_approval_status === "APPROVED"
        ? "ACTIVE"
        : result.mission_control.launch_approval_status
    }`,
    `Trusted context: ${
      result.mission_control.context_status === "TRUSTED"
        ? "ACTIVE"
        : result.mission_control.context_status
    }`,
    `Execution state: ${result.mission_control.execution_state}`,
    `Evidence state: ${result.mission_control.evidence_state}`,
    `Next action: ${result.mission_control.next_action}`,
    "",
    "No action was executed outside existing PBOS authority.",
    `Evidence: ${result.digest}`,
    "=====================================",
  ].join("\n");
}
