export type RuntimePhase =
  | "idle"
  | "observe"
  | "understand"
  | "reason"
  | "plan"
  | "validate"
  | "execute"
  | "verify"
  | "learn"
  | "complete"
  | "failed";

export interface RuntimeState {
  version: string;

  startedAt: string;

  updatedAt: string;

  currentPhase: RuntimePhase;

  currentObjective?: string;

  warnings: string[];

  blockers: string[];

  completedPhases: RuntimePhase[];

  completedObjectives: string[];

  metadata: Record<string, unknown>;
}

export function createRuntimeState(): RuntimeState {
  const now = new Date().toISOString();

  return {
    version: "1.0.0",

    startedAt: now,

    updatedAt: now,

    currentPhase: "idle",

    currentObjective: undefined,

    warnings: [],

    blockers: [],

    completedPhases: [],

    completedObjectives: [],

    metadata: {},
  };
}
