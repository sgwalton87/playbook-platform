export * from "./types";
export * from "./loader";
export * from "./validator";
export * from "./gateResolver";
export * from "./sprintPlanner";
export * from "./reporter";

import { resolveGates } from "./gateResolver";
import { loadPbosState } from "./loader";
import { createExecutionReport } from "./reporter";
import { planNextSprint } from "./sprintPlanner";
import type { ExecutionReport } from "./types";
import { validatePbosState } from "./validator";

export async function runPbosEngine(repositoryRoot: string): Promise<ExecutionReport> {
  const state = await loadPbosState(repositoryRoot);
  const validation = validatePbosState(state);
  if (!validation.valid) {
    const details = validation.issues.map((issue) => `${issue.file}:${issue.path}: ${issue.message}`).join("\n");
    throw new Error(`PBOS canonical state is invalid:\n${details}`);
  }
  const resolution = resolveGates(state.engineeringGates);
  const sprint = planNextSprint(resolution);
  return createExecutionReport(state, validation, resolution, sprint);
}
