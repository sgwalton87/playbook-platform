import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { artifactDigest } from "../../kernel";
import { objectiveIdentity } from "./registry";
import type {
  ObjectiveRegistry,
  PlanningHandoffDecision,
  PlanningLineage,
} from "./types";

function digestFiles(rootDir: string, entries: string[]): string {
  return artifactDigest(
    [...entries].sort().map((entry) => ({
      path: entry,
      digest: existsSync(path.resolve(rootDir, entry))
        ? artifactDigest(readFileSync(path.resolve(rootDir, entry)))
        : null,
    }))
  );
}

export function createPlanningLineage(options: {
  rootDir: string;
  registry: ObjectiveRegistry;
  decision: PlanningHandoffDecision;
  repositoryIdentity: string;
  repositoryCommit: string;
  contextIdentity: string;
}): PlanningLineage {
  const selected = options.decision.selectedObjective;
  const dependencies =
    selected?.dependencies.prerequisiteObjectives ?? [];
  const evidence = [
    ...(selected?.dependencies.requiredArtifacts ?? []),
    ...(selected?.dependencies.requiredEvidence ?? []),
  ];
  return {
    repositoryIdentity: options.repositoryIdentity,
    repositoryCommit: options.repositoryCommit,
    contextIdentity: options.contextIdentity,
    objectiveIdentity: selected ? objectiveIdentity(selected) : null,
    registryIdentity: artifactDigest(options.registry),
    dependencySnapshotIdentity: artifactDigest(
      dependencies.map((objectiveId) => {
        const objective = options.registry.objectives.find(
          (entry) => entry.objectiveId === objectiveId
        );
        return {
          objectiveId,
          lifecycleState:
            objective?.governance.lifecycleState ?? "MISSING",
          identity: objective ? objectiveIdentity(objective) : null,
        };
      })
    ),
    evidenceIdentity: digestFiles(options.rootDir, evidence),
    lifecycleState: selected?.governance.lifecycleState ?? null,
  };
}

export function validatePlanningLineage(
  lineage: PlanningLineage
): void {
  const required = [
    lineage.repositoryIdentity,
    lineage.repositoryCommit,
    lineage.contextIdentity,
    lineage.registryIdentity,
    lineage.dependencySnapshotIdentity,
    lineage.evidenceIdentity,
  ];
  if (required.some((entry) => !entry)) {
    throw new Error("Planning lineage is incomplete.");
  }
  if (
    (lineage.objectiveIdentity === null) !==
    (lineage.lifecycleState === null)
  ) {
    throw new Error("Planning objective lineage is inconsistent.");
  }
}
