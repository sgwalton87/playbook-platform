import {
  beginPhase,
  completePhase,
  loadRuntimeState,
} from "./state-manager";

import { runPhase } from "./phase-runner";
import type { EnginePhase } from "../engine";
import { buildWorld } from "../world";

const PHASES: EnginePhase[] = [
  "observe",
  "understand",
  "reason",
  "plan",
  "validate",
  "execute",
  "verify",
  "learn",
];

export async function runRuntime() {
  let state = loadRuntimeState();

  for (const phase of PHASES) {
    beginPhase(phase);

const world = buildWorld();

    await runPhase(phase, world);
    completePhase(phase);

    state = loadRuntimeState();
  }

  return state;
}