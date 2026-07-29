import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { artifactDigest } from "../../kernel";
import {
  OBJECTIVE_LIFECYCLE_STATES,
  type ObjectiveRegistry,
  type ObjectiveRegistryEntry,
} from "./types";

export const OBJECTIVE_REGISTRY_PATH =
  "pbos/planning/handoff/objectives.json";

function nonEmpty(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function stringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((entry) => nonEmpty(entry)) &&
    new Set(value).size === value.length
  );
}

export function objectiveIdentity(
  objective: ObjectiveRegistryEntry
): string {
  return artifactDigest(objective);
}

export function validateObjectiveRegistry(
  value: unknown,
  rootDir: string
): ObjectiveRegistry {
  if (!value || typeof value !== "object") {
    throw new Error("Objective registry is not an object.");
  }
  const registry = value as Partial<ObjectiveRegistry>;
  if (
    registry.version !== "1.0.0" ||
    registry.authority !== "PBOS_PLANNING_HANDOFF_REGISTRY" ||
    !Array.isArray(registry.objectives)
  ) {
    throw new Error("Objective registry metadata is invalid.");
  }

  const ids = new Set<string>();
  for (const raw of registry.objectives) {
    const objective = raw as ObjectiveRegistryEntry;
    const fields = [
      objective.objectiveId,
      objective.title,
      objective.description,
      objective.authority?.originatingAuthority,
      objective.authority?.constitutionalParent,
      objective.authority?.owner,
    ];
    if (!fields.every(nonEmpty)) {
      throw new Error(
        `Objective registration is missing identity or authority: ${objective.objectiveId ?? "UNKNOWN"}.`
      );
    }
    if (ids.has(objective.objectiveId)) {
      throw new Error(
        `Duplicate objective identity: ${objective.objectiveId}.`
      );
    }
    ids.add(objective.objectiveId);
    if (
      !existsSync(
        path.resolve(rootDir, objective.authority.originatingAuthority)
      ) ||
      !existsSync(
        path.resolve(rootDir, objective.authority.constitutionalParent)
      )
    ) {
      throw new Error(
        `Objective authority cannot be proven: ${objective.objectiveId}.`
      );
    }
    const dependencies = objective.dependencies;
    const governance = objective.governance;
    if (
      !dependencies ||
      !stringList(dependencies.prerequisiteObjectives) ||
      !stringList(dependencies.requiredArtifacts) ||
      !stringList(dependencies.requiredEvidence) ||
      !governance ||
      !Number.isInteger(governance.priority) ||
      governance.priority < 0 ||
      !OBJECTIVE_LIFECYCLE_STATES.includes(
        governance.lifecycleState
      ) ||
      !stringList(governance.eligibilityCriteria) ||
      !stringList(governance.validationRequirements) ||
      !stringList(governance.blockingConditions)
    ) {
      throw new Error(
        `Objective governance metadata is invalid: ${objective.objectiveId}.`
      );
    }
  }

  return registry as ObjectiveRegistry;
}

export function loadObjectiveRegistry(
  rootDir = process.cwd()
): ObjectiveRegistry {
  const registryPath = path.join(rootDir, OBJECTIVE_REGISTRY_PATH);
  if (!existsSync(registryPath)) {
    throw new Error(
      `Objective registry is missing: ${OBJECTIVE_REGISTRY_PATH}.`
    );
  }
  return validateObjectiveRegistry(
    JSON.parse(readFileSync(registryPath, "utf8")) as unknown,
    rootDir
  );
}
