import { planConstitutionalGate } from "../planner";

/** @deprecated Planning refresh delegates to the constitutional planner. */
export async function refreshPlanningArtifact(
  rootDir = process.cwd()
) {
  const report = await planConstitutionalGate({ rootDir });
  return {
    selectedGate: report.selectedGate,
    eligible: report.eligibleGates,
    blocked: report.blockedGates.map(({ gateId }) => gateId),
    completed: report.completedGates,
    state: report.selectedGate ? "ACTIVE_SPRINT" : "VALID_IDLE",
    authority: "constitutional-planner" as const,
  };
}
