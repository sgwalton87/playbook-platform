import { loadRepositoryContextArtifact, verifyStoredRepositoryContext } from "../../context";
import { loadConfig } from "../../engine/config";
import { loadState } from "../../engine/state";
import { planConstitutionalGate } from "../../planner";
import { loadConstitutionalGates } from "../../planner/load";
import { artifactDigest } from "../identity";
import { ConstitutionalExecutionKernel } from "./kernel";
import type { KernelInput, KernelObjective, KernelResult } from "./types";

export async function createRepositoryKernelInput(
  rootDir = process.cwd()
): Promise<KernelInput> {
  const config = await loadConfig(rootDir);
  const state = await loadState(config, config.defaultMode, rootDir);
  const gates = loadConstitutionalGates(rootDir, config.gatesDirectory);
  const planning = await planConstitutionalGate({ rootDir, persist: false });
  const stored = loadRepositoryContextArtifact(rootDir);
  if (!stored) {
    throw new Error("Repository context artifact is required by the execution kernel.");
  }
  const context = verifyStoredRepositoryContext(rootDir);
  const eligible = new Set(planning.eligibleGates);
  const completed = new Set(planning.completedGates);
  const byParent = new Map<string, string[]>();
  for (const gate of gates) {
    const parent = gate.dependencies[0];
    if (parent) byParent.set(parent, [...(byParent.get(parent) ?? []), gate.id]);
  }

  const objectives: KernelObjective[] = gates.map((gate) => ({
    id: gate.id,
    description: gate.description,
    state: completed.has(gate.id)
      ? "COMPLETED"
      : eligible.has(gate.id)
        ? "READY"
        : "BLOCKED",
    parentId: gate.dependencies[0] ?? null,
    dependencyIds: [...gate.dependencies],
    childIds: [...(byParent.get(gate.id) ?? [])].sort(),
    constitutionalOrder: gate.lifecycle_stage,
    priority: {
      constitutional: gate.priority,
      strategic: gate.priority,
      engineering: gate.priority,
      business: gate.priority,
      operational: gate.priority,
    },
    risk: gate.blocking_conditions.length ? 100 : 0,
    estimatedEffort: gate.tasks.length,
    criticalPath: (byParent.get(gate.id)?.length ?? 0) > 0,
    authority: gate.handbook_refs.join(", "),
    blockers:
      planning.blockedGates
        .find(({ gateId }) => gateId === gate.id)
        ?.reasons.map(({ code }) => code) ?? [],
    requiredApprovals: [],
    approvals: [],
    validations: [...gate.validation],
    artifacts: gate.requires.map((uri) => ({
      id: `${gate.id}:${uri}`,
      uri,
      digest:
        planning.blockedGates
          .find(({ gateId }) => gateId === gate.id)
          ?.invalidArtifacts.find((artifact) => artifact.path === uri)
          ? ""
          : artifactDigest({ gateId: gate.id, uri }),
    })),
    outputs: [...gate.produces],
    successCriteria: [...gate.definition_of_done],
    failureCriteria: [...gate.blocking_conditions],
    rollback: ["Preserve prior runtime artifacts and lifecycle history."],
  }));
  const snapshot = stored.snapshot;

  return {
    observedAt: stored.capturedAt,
    repository: {
      root: snapshot.repositoryRoot,
      remote: snapshot.remoteUrl,
      head: snapshot.git.commitSha,
      branch: snapshot.git.branch,
      contentDigest: snapshot.git.workingTreeContentDigest,
      valid: context.valid,
      errors: context.errors,
    },
    runtime: {
      engineVersion: config.version,
      mode: state.executionMode,
      activeGate: state.currentGate,
      completedGates: [...completed].sort(),
      releaseState: state.release.currentState,
      valid:
        planning.currentLifecycle.releasePermitsExecution &&
        planning.validationResults.passed,
      errors: [
        ...(planning.currentLifecycle.releasePermitsExecution
          ? []
          : [`Release state ${planning.currentLifecycle.releaseState} does not permit execution.`]),
        ...(planning.validationResults.passed
          ? []
          : ["Runtime validation artifact is not PASS."]),
      ],
    },
    constitution: {
      id: "PBOS-CONSTITUTIONAL-GATE-CORPUS",
      uri: config.gatesDirectory,
      digest: artifactDigest(gates),
    },
    registry: {
      id: "PBOS-CONSTITUTIONAL-PLANNER",
      digest: artifactDigest({
        id: "PBOS-CONSTITUTIONAL-PLANNER",
        rootObjectiveIds: gates
          .filter((gate) => gate.dependencies.length === 0)
          .map((gate) => gate.id)
          .sort(),
        objectives,
      }),
      rootObjectiveIds: gates
        .filter((gate) => gate.dependencies.length === 0)
        .map((gate) => gate.id)
        .sort(),
      objectives,
    },
    priorityWeights: {
      constitutional: 30,
      strategic: 25,
      engineering: 20,
      business: 15,
      operational: 10,
    },
  };
}

export async function runRepositoryKernel(
  rootDir = process.cwd()
): Promise<KernelResult> {
  return new ConstitutionalExecutionKernel().plan(
    await createRepositoryKernelInput(rootDir)
  );
}
