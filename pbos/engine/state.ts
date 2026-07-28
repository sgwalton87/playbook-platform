import { mkdir, readFile, writeFile } from "node:fs/promises";
import * as crypto from "node:crypto";
import * as path from "node:path";
import { createTransition, detectReleaseEnvironment, resolvePromotionState } from "../release/state-machine";
import type { EngineState, ExecutionMode, PbosConfig } from "./types";

function createResumeToken(): string {
  return crypto.randomBytes(12).toString("hex");
}

export function createInitialState(config: PbosConfig, mode: ExecutionMode): EngineState {
  const environment = detectReleaseEnvironment();
  const promotion = resolvePromotionState(environment);
  return {
    currentGate: null,
    failedGates: [],
    blockedGates: [],
    blockedBy: [],
    lastRun: null,
    handbookVersion: "2026-07-24",
    validationHash: null,
    configurationHash: crypto.createHash("sha256").update(JSON.stringify(config)).digest("hex"),
    futureCompatibility: [],
    engineVersion: config.version,
    resumeToken: createResumeToken(),
    executionMode: mode,
    release: createTransition({
      previousState: "ENGINEERING_APPROVED",
      currentState: promotion.state,
      transitionReason: promotion.reason,
      environment,
      blockingConditions: promotion.blockers,
    }),
  };
}

export async function loadState(config: PbosConfig, mode: ExecutionMode, rootDir = process.cwd()): Promise<EngineState> {
  const statePath = path.join(rootDir, config.stateFile);
  try {
    const raw = await readFile(statePath, "utf8");
    const parsed = JSON.parse(raw) as EngineState & {
      completedGates?: string[];
    };
    const state = { ...parsed };
    delete state.completedGates;
    return {
      ...state,
      executionMode: mode,
      engineVersion: config.version,
    };
  } catch {
    const initialState = createInitialState(config, mode);
    await saveState(config, initialState, rootDir);
    return initialState;
  }
}

export async function saveState(config: PbosConfig, state: EngineState, rootDir = process.cwd()): Promise<void> {
  const statePath = path.join(rootDir, config.stateFile);
  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(state, null, 2)}\n`);
}

export function updateStateForPlanning(state: EngineState, selectedGate: string | null, blockers: string[]): EngineState {
  const validationHash = crypto.createHash("sha256").update(JSON.stringify({ selectedGate, blockers })).digest("hex");
  const environment = detectReleaseEnvironment();
  const promotion = resolvePromotionState(environment);
  return {
    ...state,
    currentGate: selectedGate,
    blockedBy: blockers,
    blockedGates: blockers,
    lastRun: new Date().toISOString(),
    validationHash,
    resumeToken: createResumeToken(),
   release:
  state.release.currentState === promotion.state
    ? {
        ...state.release,
        environment,
        blockingConditions: promotion.blockers,
      }
    : createTransition({
        previousState: state.release.currentState,
        currentState: promotion.state,
        transitionReason: promotion.reason,
        environment,
        blockingConditions: promotion.blockers,
      }),
  };
}
