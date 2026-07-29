import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { artifactDigest } from "../../kernel";
import { evaluateObjectives } from "./evaluator";
import {
  appendPlanningHistory,
  validatePlanningHistory,
} from "./history";
import {
  createPlanningLineage,
  validatePlanningLineage,
} from "./lineage";
import { validateObjectiveRegistry } from "./registry";
import type {
  ObjectiveRegistry,
  ObjectiveRegistryEntry,
  PlanningHandoffRecord,
} from "./types";

const roots: string[] = [];

function root(): string {
  const directory = path.join(
    process.cwd(),
    ".tmp",
    `handoff-${Date.now()}-${Math.random()}`
  );
  mkdirSync(directory, { recursive: true });
  roots.push(directory);
  return directory;
}

afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    roots.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true })
    )
  );
});

function objective(
  overrides: Partial<ObjectiveRegistryEntry> = {}
): ObjectiveRegistryEntry {
  return {
    objectiveId: "PBOS-FUTURE-001",
    title: "Authorized future objective",
    description: "A registered objective used by the test.",
    authority: {
      originatingAuthority: "authority.md",
      constitutionalParent: "constitution.md",
      owner: "PBOS Architecture",
    },
    dependencies: {
      prerequisiteObjectives: [],
      requiredArtifacts: [],
      requiredEvidence: [],
    },
    governance: {
      priority: 10,
      lifecycleState: "REGISTERED",
      eligibilityCriteria: ["All dependencies complete."],
      validationRequirements: ["Repository context valid."],
      blockingConditions: [],
    },
    ...overrides,
  };
}

function registry(
  objectives: ObjectiveRegistryEntry[]
): ObjectiveRegistry {
  return {
    version: "1.0.0",
    authority: "PBOS_PLANNING_HANDOFF_REGISTRY",
    objectives,
  };
}

function establishAuthority(directory: string): void {
  writeFileSync(path.join(directory, "authority.md"), "authority");
  writeFileSync(path.join(directory, "constitution.md"), "constitution");
}

describe("objective registry governance", () => {
  it("accepts an authorized, unique registration", () => {
    const directory = root();
    establishAuthority(directory);
    expect(
      validateObjectiveRegistry(registry([objective()]), directory)
        .objectives
    ).toHaveLength(1);
  });

  it("rejects duplicate objective identities", () => {
    const directory = root();
    establishAuthority(directory);
    expect(() =>
      validateObjectiveRegistry(
        registry([objective(), objective()]),
        directory
      )
    ).toThrow("Duplicate objective identity");
  });

  it("rejects missing or unprovable authority", () => {
    const directory = root();
    expect(() =>
      validateObjectiveRegistry(registry([objective()]), directory)
    ).toThrow("authority cannot be proven");
  });
});

describe("objective eligibility", () => {
  it("selects one eligible objective deterministically", () => {
    const directory = root();
    const lower = objective({
      objectiveId: "PBOS-FUTURE-002",
      governance: {
        ...objective().governance,
        priority: 5,
      },
    });
    const decision = evaluateObjectives(
      registry([lower, objective()]),
      directory
    );
    expect(decision.status).toBe("OBJECTIVE_ELIGIBLE");
    expect(decision.selectedObjective?.objectiveId).toBe(
      "PBOS-FUTURE-001"
    );
    expect(
      evaluateObjectives(registry([objective(), lower]), directory)
        .selectedObjective?.objectiveId
    ).toBe("PBOS-FUTURE-001");
  });

  it("blocks an objective with an incomplete dependency", () => {
    const directory = root();
    const dependency = objective({
      objectiveId: "PBOS-DEPENDENCY-001",
      governance: {
        ...objective().governance,
        lifecycleState: "EXECUTING",
      },
    });
    const candidate = objective({
      dependencies: {
        ...objective().dependencies,
        prerequisiteObjectives: ["PBOS-DEPENDENCY-001"],
      },
    });
    const decision = evaluateObjectives(
      registry([candidate, dependency]),
      directory
    );
    expect(decision.selectedObjective).toBeNull();
    expect(decision.evaluations[1]?.status).toBe("BLOCKED");
  });

  it("blocks missing artifacts and evidence", () => {
    const directory = root();
    const candidate = objective({
      dependencies: {
        prerequisiteObjectives: [],
        requiredArtifacts: ["missing.json"],
        requiredEvidence: ["missing.md"],
      },
    });
    const evaluation = evaluateObjectives(
      registry([candidate]),
      directory
    ).evaluations[0];
    expect(evaluation?.missingArtifacts).toEqual(["missing.json"]);
    expect(evaluation?.missingEvidence).toEqual(["missing.md"]);
    expect(evaluation?.status).toBe("BLOCKED");
  });

  it("returns governed idle for an empty authoritative registry", () => {
    expect(evaluateObjectives(registry([]), root()).status).toBe(
      "GOVERNED_IDLE"
    );
  });
});

describe("planning lineage and recovery", () => {
  it("binds the plan to context, objective, dependencies, and evidence", () => {
    const directory = root();
    writeFileSync(path.join(directory, "evidence.md"), "evidence");
    const candidate = objective({
      dependencies: {
        prerequisiteObjectives: [],
        requiredArtifacts: [],
        requiredEvidence: ["evidence.md"],
      },
    });
    const source = registry([candidate]);
    const decision = evaluateObjectives(source, directory);
    const lineage = createPlanningLineage({
      rootDir: directory,
      registry: source,
      decision,
      repositoryIdentity: "playbook-platform",
      repositoryCommit: "abc123",
      contextIdentity: "context-identity",
    });
    expect(() => validatePlanningLineage(lineage)).not.toThrow();
    expect(lineage.objectiveIdentity).toBe(artifactDigest(candidate));

    writeFileSync(path.join(directory, "evidence.md"), "changed");
    const changed = createPlanningLineage({
      rootDir: directory,
      registry: source,
      decision,
      repositoryIdentity: "playbook-platform",
      repositoryCommit: "abc123",
      contextIdentity: "context-identity",
    });
    expect(changed.evidenceIdentity).not.toBe(
      lineage.evidenceIdentity
    );
  });

  it("rejects incomplete lineage", () => {
    expect(() =>
      validatePlanningLineage({
        repositoryIdentity: "playbook-platform",
        repositoryCommit: "",
        contextIdentity: "context",
        objectiveIdentity: null,
        registryIdentity: "registry",
        dependencySnapshotIdentity: "dependencies",
        evidenceIdentity: "evidence",
        lifecycleState: null,
      })
    ).toThrow("lineage is incomplete");
  });

  it("preserves valid interrupted history and rejects corrupt history", () => {
    const base = {
      version: "1.0.0" as const,
      generatedAt: "2026-07-29T00:00:00.000Z",
      owner: "planning-handoff" as const,
      authorization: {
        authorized: true as const,
        authorityModel: "registered-objectives-only" as const,
      },
      context: {
        valid: true as const,
        artifactHealth: "VALID" as const,
      },
      lineage: {
        repositoryIdentity: "playbook-platform",
        repositoryCommit: "abc123",
        contextIdentity: "context",
        objectiveIdentity: null,
        registryIdentity: "registry",
        dependencySnapshotIdentity: "dependencies",
        evidenceIdentity: "evidence",
        lifecycleState: null,
      },
      decision: {
        status: "GOVERNED_IDLE" as const,
        selectedObjective: null,
        evaluations: [],
        reason: "No registered objectives.",
      },
    };
    const record: PlanningHandoffRecord = {
      ...base,
      recordId: artifactDigest(base),
    };
    const recovered = appendPlanningHistory(null, record);
    const next = appendPlanningHistory(recovered, record);
    expect(next.history).toHaveLength(2);

    expect(() =>
      validatePlanningHistory({
        ...next,
        history: [{ ...record, recordId: "corrupt" }],
      })
    ).toThrow("invalid record identity");
  });
});
