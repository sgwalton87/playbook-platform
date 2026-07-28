import { readFileSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { verifyStoredRepositoryContext } from "../context";
import { loadConfig } from "../engine/config";
import { loadState } from "../engine/state";
import { Artifacts } from "../kernel";
import { validateRequiredArtifact } from "./artifact-validation";
import { buildDependencyGraph } from "./dependency-graph";
import { evaluateGateEligibility } from "./eligibility";
import { selectOneGate } from "./gate-selector";
import { loadConstitutionalGates } from "./load";
import { createPlanningReport } from "./planning-report";
import type {
  ConstitutionalPlanningReport,
  PlannerEnvironment,
} from "./types";

const EXECUTABLE_RELEASE_STATES = new Set([
  "PROMOTION_COMPLETE",
  "AUDIT_COMPLETE",
  "ARCHIVED",
]);

function readValidation(rootDir: string): {
  passed: boolean;
  gateId: string | null;
} {
  try {
    const parsed = JSON.parse(
      readFileSync(join(rootDir, Artifacts.validation), "utf8")
    ) as { status?: unknown; selectedGate?: unknown };
    return {
      passed: parsed.status === "PASS",
      gateId:
        typeof parsed.selectedGate === "string"
          ? parsed.selectedGate
          : null,
    };
  } catch {
    return { passed: false, gateId: null };
  }
}

export async function planConstitutionalGate(options: {
  rootDir?: string;
  persist?: boolean;
} = {}): Promise<ConstitutionalPlanningReport> {
  const rootDir = options.rootDir ?? process.cwd();
  const config = await loadConfig(rootDir);
  const state = await loadState(config, config.defaultMode, rootDir);
  const gates = loadConstitutionalGates(rootDir, config.gatesDirectory);
  const graph = buildDependencyGraph(gates);
  const context = verifyStoredRepositoryContext(rootDir);
  const validation = readValidation(rootDir);
  const completedGateIds = new Set(
    gates
      .filter(
        (gate) =>
          gate.status === "complete" &&
          gate.completion_state === "satisfied"
      )
      .map((gate) => gate.id)
  );
  const baseEnvironment = {
    contextValid: context.valid,
    contextErrors: context.errors,
    validationPassed: validation.passed,
    validationGate: validation.gateId,
    releaseState: state.release.currentState,
    releasePermitsExecution: EXECUTABLE_RELEASE_STATES.has(
      state.release.currentState
    ),
  };
  const evaluations = gates.map((gate) => {
    const environment: PlannerEnvironment = {
      ...baseEnvironment,
      artifacts: new Map(
        gate.requires.map((relativePath) => {
          const result = validateRequiredArtifact({
            rootDir,
            relativePath,
            gate,
            completedGateIds,
          });
          return [relativePath, result];
        })
      ),
    };
    return evaluateGateEligibility(gate, graph, environment);
  });
  const selected = selectOneGate(evaluations);
  const selectedEnvironment: PlannerEnvironment = {
    ...baseEnvironment,
    artifacts:
      selected
        ? new Map(
            selected.gate.requires.map((relativePath) => {
              const result = validateRequiredArtifact({
                rootDir,
                relativePath,
                gate: selected.gate,
                completedGateIds,
              });
              return [relativePath, result];
            })
          )
        : new Map(),
  };
  const report = createPlanningReport({
    engineVersion: config.version,
    graph,
    environment: selectedEnvironment,
    evaluations,
    selected,
  });

  if (options.persist !== false) {
    const outputPath = join(rootDir, Artifacts.constitutionalPlanning);
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
    await writeFile(
      join(rootDir, Artifacts.planning),
      `${JSON.stringify(
        {
          selectedGate: report.selectedGate,
          eligible: report.eligibleGates,
          blocked: report.blockedGates.map(({ gateId }) => gateId),
          completed: report.completedGates,
          state: report.selectedGate
            ? "ACTIVE_SPRINT"
            : "VALID_IDLE",
          authority: "constitutional-planner",
        },
        null,
        2
      )}\n`
    );
  }

  return report;
}

export * from "./dependency-graph";
export * from "./artifact-validation";
export * from "./eligibility";
export * from "./gate-selector";
export * from "./load";
export * from "./planning-report";
export * from "./recommendation";
export * from "./types";
