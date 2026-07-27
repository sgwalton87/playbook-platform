import path from "node:path";
import { loadConfig } from "./config";
import { loadGates, selectNextGate } from "./planner";
import { loadState } from "./state";
import { Artifacts, Runtime } from "../kernel";

export async function refreshPlanningArtifact(rootDir = process.cwd()) {
  const config = await loadConfig(rootDir);
  const state = await loadState(
    config,
    "planning",
    rootDir
  );

  const gates = await loadGates(
    config,
    rootDir
  );

  const plan = selectNextGate(
    gates,
    config,
    state
  );

  const artifact = {
    selectedGate: plan.selectedGate,
    eligible: plan.eligibleGates.map(
      (gate) => gate.id
    ),
    blocked: plan.blockedGates.map(
      ({ gate }) => gate.id
    ),
    state: plan.selectedGate
      ? "ACTIVE_SPRINT"
      : "VALID_IDLE",
  };

  Runtime.save(
    path.join(rootDir, Artifacts.planning),
    artifact
  );

  return artifact;
}
