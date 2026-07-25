import fs from "node:fs";
import path from "node:path";

import {
  RuntimeState,
  RuntimePhase,
  createRuntimeState,
} from "./state";

const RUNTIME_DIRECTORY = path.join(
  process.cwd(),
  "pbos",
  "runtime"
);

const STATE_FILE = path.join(
  RUNTIME_DIRECTORY,
  "runtime-state.json"
);

function ensureRuntimeDirectory() {
  if (!fs.existsSync(RUNTIME_DIRECTORY)) {
    fs.mkdirSync(RUNTIME_DIRECTORY, {
      recursive: true,
    });
  }
}

export function loadRuntimeState(): RuntimeState {

  ensureRuntimeDirectory();

  if (!fs.existsSync(STATE_FILE)) {
    const state = createRuntimeState();
    saveRuntimeState(state);
    return state;
  }

  return JSON.parse(
    fs.readFileSync(
      STATE_FILE,
      "utf8"
    )
  ) as RuntimeState;

}

export function saveRuntimeState(
  state: RuntimeState
): void {

  ensureRuntimeDirectory();

  state.updatedAt = new Date().toISOString();

  fs.writeFileSync(
    STATE_FILE,
    JSON.stringify(
      state,
      null,
      2
    )
  );

}

export function beginPhase(
  phase: RuntimePhase
): RuntimeState {

  const state = loadRuntimeState();

  state.currentPhase = phase;

  saveRuntimeState(state);

  return state;

}

export function completePhase(
  phase: RuntimePhase
): RuntimeState {

  const state = loadRuntimeState();

  if (!state.completedPhases.includes(phase)) {
    state.completedPhases.push(phase);
  }

  state.currentPhase = phase;

  saveRuntimeState(state);

  return state;

}

export function addWarning(
  warning: string
): RuntimeState {

  const state = loadRuntimeState();

  if (!state.warnings.includes(warning)) {
    state.warnings.push(warning);
  }

  saveRuntimeState(state);

  return state;

}

export function addBlocker(
  blocker: string
): RuntimeState {

  const state = loadRuntimeState();

  if (!state.blockers.includes(blocker)) {
    state.blockers.push(blocker);
  }

  saveRuntimeState(state);

  return state;

}

export function setObjective(
  objective: string
): RuntimeState {

  const state = loadRuntimeState();

  state.currentObjective = objective;

  saveRuntimeState(state);

  return state;

}

export function completeObjective(
  objective: string
): RuntimeState {

  const state = loadRuntimeState();

  if (!state.completedObjectives.includes(objective)) {
    state.completedObjectives.push(objective);
  }

  state.currentObjective = undefined;

  saveRuntimeState(state);

  return state;

}

export function clearRuntimeState(): RuntimeState {

  const state = createRuntimeState();

  saveRuntimeState(state);

  return state;

}
