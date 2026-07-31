import type { MissionControlOutcome } from "./types";

export function formatMissionHeader(): string {
  return [
    "PBOS MISSION CONTROL",
    "Mission: Advance the Playbook Platform through governed execution",
    "Status: INITIALIZING",
  ].join("\n");
}

export function formatMissionOutcome(outcome: MissionControlOutcome): string {
  if (outcome.phase === "WAITING_FOR_AUTHORITY") {
    return [
      "PBOS HUMAN AUTHORIZATION REQUIRED",
      `Milestone: ${outcome.milestone ?? "PENDING CANONICAL SELECTION"}`,
      `Package: ${outcome.package_id ?? "PENDING"}`,
      "CURRENT STATE: Execution is governed and paused.",
      "AVAILABLE ACTION: Approve the exact package-bound authority.",
      "AUTOMATIC ACTIONS: Assessment, planning, and authority reuse validation completed.",
      "HUMAN ACTION REQUIRED: npm run pbos:approve",
      "NEXT STEP: Run npm run pbos:mission after approval.",
    ].join("\n");
  }
  if (outcome.phase === "BLOCKED" || outcome.phase === "FAILED") {
    return [
      "PBOS MISSION BLOCKED",
      `Reason: ${outcome.phase === "FAILED" ? "A governed mission phase failed." : "Repository or lifecycle recovery is required."}`,
      `Required Action: ${outcome.recovery_command ?? "Review the mission findings above."}`,
      "NEXT STEP: Resolve the reported condition; no execution or advancement was fabricated.",
    ].join("\n");
  }
  if (outcome.phase === "COMPLETE") {
    return [
      "PBOS MISSION COMPLETE",
      `Mission: ${outcome.milestone ?? "GOVERNED MILESTONE"}`,
      "Execution: SUCCEEDED",
      "Evidence: VALIDATED",
      "Advancement: COMPLETE",
      "",
      "NEXT MISSION IDENTIFIED",
      `Milestone: ${outcome.next_milestone ?? "NONE"}`,
    ].join("\n");
  }
  return [
    outcome.phase === "ACTIVE" ? "PBOS MISSION ACTIVE" : "PBOS MISSION REVIEW",
    `Execution: ${outcome.execution_id ?? "NOT_STARTED"}`,
    `Provider: ${outcome.provider ?? "NOT_ASSIGNED"}`,
    `Task: ${outcome.task ?? "NOT_ASSIGNED"}`,
    `Milestone: ${outcome.milestone ?? "PENDING"}`,
    `Evidence: ${outcome.evidence}`,
    `Advancement: ${outcome.advancement}`,
  ].join("\n");
}
