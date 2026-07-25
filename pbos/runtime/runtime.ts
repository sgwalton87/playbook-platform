import {
  beginPhase,
  completePhase,
  loadRuntimeState,
} from "./state-manager";

import { runPhase } from "./phase-runner";
import { RuntimePhase } from "./state";

const PHASES: RuntimePhase[] = [
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

    await runPhase(phase, state);

    completePhase(phase);

    state = loadRuntimeState();

  }

  return state;

}
