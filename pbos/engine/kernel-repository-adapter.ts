import { loadRepositoryContextArtifact, verifyStoredRepositoryContext } from "../context";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { artifactDigest } from "../kernel";
import {
  ConstitutionalExecutionKernel,
  type KernelInput,
  type KernelObjective,
  type KernelResult,
} from "../kernel/execution";
import { planConstitutionalGate } from "../planner";
import { loadConstitutionalGates } from "../planner/load";
import {
  loadMasterBuildManifest,
  resolveBuildMilestoneLifecycle,
  type BuildMilestone,
} from "../manifests";
import { completedMilestoneIds } from "../execution/evidence";
import { loadConfig } from "./config";
import { loadState } from "./state";

export async function createRepositoryKernelInput(
  rootDir = process.cwd()
): Promise<KernelInput> {
  const config = await loadConfig(rootDir);
  const state = await loadState(config, config.defaultMode, rootDir);
  const gates = loadConstitutionalGates(rootDir, config.gatesDirectory);
  const buildManifest = loadMasterBuildManifest(rootDir);
  const runtimeCompletedMilestones = completedMilestoneIds(rootDir);
  const completedBuildMilestones = new Set([
    ...runtimeCompletedMilestones,
    ...buildManifest.manifest.milestones
      .filter(({ status }) => status === "COMPLETE" || status === "ARCHIVED")
      .map(({ id }) => id),
  ]);
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

  const gateObjectives: KernelObjective[] = gates.map((gate) => ({
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
  const risk = { GREEN: 20, YELLOW: 60, RED: 100 } as const;
  const milestoneState = (milestone: BuildMilestone): KernelObjective["state"] => {
    return resolveBuildMilestoneLifecycle(
      milestone,
      completedBuildMilestones
    ).resolved_state;
  };
  const buildChildren = new Map<string, string[]>();
  for (const milestone of buildManifest.manifest.milestones) {
    const parent = [...milestone.dependencies, ...milestone.blocking_dependencies][0];
    if (parent) {
      buildChildren.set(parent, [...(buildChildren.get(parent) ?? []), milestone.id]);
    }
  }
  const buildObjectives: KernelObjective[] = buildManifest.manifest.milestones.map((milestone, index) => ({
    id: milestone.id,
    description: milestone.description,
    state: milestoneState(milestone),
    parentId: [...milestone.dependencies, ...milestone.blocking_dependencies][0] ?? null,
    dependencyIds: [...milestone.dependencies, ...milestone.blocking_dependencies],
    childIds: [...(buildChildren.get(milestone.id) ?? [])].sort(),
    constitutionalOrder: 10_000 + index,
    priority: {
      constitutional: milestone.priority,
      strategic: milestone.priority,
      engineering: milestone.priority,
      business: milestone.priority,
      operational: milestone.priority,
    },
    risk: risk[milestone.risk_level],
    estimatedEffort: milestone.validation_requirements.length + milestone.outputs.length,
    criticalPath: (buildChildren.get(milestone.id)?.length ?? 0) > 0,
    authority: buildManifest.manifest.authority,
    blockers: (() => {
      const lifecycle = resolveBuildMilestoneLifecycle(
        milestone,
        completedBuildMilestones
      );
      return lifecycle.resolved_state === "BLOCKED"
        ? [
            `MANIFEST_STATE_${milestone.status}`,
            ...lifecycle.incomplete_dependencies.map(
              (dependency) => `DEPENDENCY_INCOMPLETE:${dependency}`
            ),
          ]
        : [];
    })(),
    requiredApprovals: [],
    approvals: [],
    validations: [...milestone.validation_requirements],
    artifacts: milestone.required_artifacts.map((uri) => {
      const path = resolve(rootDir, uri);
      return {
        id: `${milestone.id}:${uri}`,
        uri,
        digest: existsSync(path) ? artifactDigest(readFileSync(path, "utf8")) : "",
      };
    }),
    outputs: [...milestone.outputs],
    successCriteria: [...milestone.completion_definition],
    failureCriteria: [...milestone.evidence_requirements.map((item) => `Missing evidence: ${item}`)],
    rollback: ["Preserve prior manifest, execution, and evidence history."],
  }));
  const objectives = [...gateObjectives, ...buildObjectives];
  const snapshot = stored.snapshot;
  const rootObjectiveIds = [
    ...gates.filter((gate) => gate.dependencies.length === 0).map((gate) => gate.id),
    ...buildManifest.manifest.milestones
      .filter(
        (milestone) =>
          milestone.dependencies.length === 0 &&
          milestone.blocking_dependencies.length === 0
      )
      .map((milestone) => milestone.id),
  ].sort();

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
      id: "PBOS-CONSTITUTIONAL-BUILD-CORPUS",
      uri: `${config.gatesDirectory};pbos/manifests/playbook-master-manifest.yaml`,
      digest: artifactDigest({ gates, buildManifest: buildManifest.manifest }),
    },
    registry: {
      id: "PBOS-MASTER-BUILD-REGISTRY",
      digest: artifactDigest({
        id: "PBOS-MASTER-BUILD-REGISTRY",
        rootObjectiveIds,
        objectives,
      }),
      rootObjectiveIds,
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
