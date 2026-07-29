import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  loadRepositoryContextArtifact,
  verifyStoredRepositoryContext,
} from "../../context";
import {
  Artifacts,
  Runtime,
  artifactDigest,
} from "../../kernel";
import { inspectArtifactConsistency } from "../../reconciliation";
import { assertPlanningPrerequisites } from "./authorization";
import { evaluateObjectives } from "./evaluator";
import { appendPlanningHistory } from "./history";
import {
  createPlanningLineage,
  validatePlanningLineage,
} from "./lineage";
import { loadObjectiveRegistry } from "./registry";
import { renderPlanningHandoffReport } from "./reports";
import type {
  PlanningHandoffArtifact,
  PlanningHandoffRecord,
} from "./types";

export function runPlanningHandoff(
  rootDir = process.cwd(),
  generatedAt = new Date().toISOString()
): PlanningHandoffRecord {
  const contextValidation = verifyStoredRepositoryContext(rootDir);
  assertPlanningPrerequisites({
    contextValid: contextValidation.valid,
    contextErrors: contextValidation.errors,
    artifactConflicts: [],
  });
  const context = loadRepositoryContextArtifact(rootDir);
  if (!context) {
    throw new Error(
      "Planning handoff denied: repository context artifact is missing."
    );
  }
  const artifactConflicts = inspectArtifactConsistency(rootDir).filter(
    ({ path: artifactPath, classification }) =>
      artifactPath !== Artifacts.repositoryContext &&
      classification !== "valid"
  );
  assertPlanningPrerequisites({
    contextValid: true,
    contextErrors: [],
    artifactConflicts: artifactConflicts.map(
      ({ path: artifactPath, reasons }) =>
        `${artifactPath}: ${reasons.join(" ")}`
    ),
  });

  const registry = loadObjectiveRegistry(rootDir);
  const decision = evaluateObjectives(registry, rootDir);
  const lineage = createPlanningLineage({
    rootDir,
    registry,
    decision,
    repositoryIdentity: context.snapshot.repositoryIdentity,
    repositoryCommit: context.snapshot.git.commitSha,
    contextIdentity: context.identity,
  });
  validatePlanningLineage(lineage);
  const recordWithoutId = {
    version: "1.0.0" as const,
    generatedAt,
    owner: "planning-handoff" as const,
    authorization: {
      authorized: true as const,
      authorityModel: "registered-objectives-only" as const,
    },
    context: {
      valid: true as const,
      artifactHealth: "VALID" as const,
    },
    lineage,
    decision,
  };
  const record: PlanningHandoffRecord = {
    ...recordWithoutId,
    recordId: artifactDigest(recordWithoutId),
  };
  const artifactPath = path.join(
    rootDir,
    Artifacts.planningHandoff
  );
  const existing = Runtime.exists(artifactPath)
    ? Runtime.load<PlanningHandoffArtifact>(artifactPath)
    : null;
  Runtime.save(
    artifactPath,
    appendPlanningHistory(existing, record),
    "planning-handoff"
  );
  const reportDirectory = path.join(rootDir, "docs/release-evidence");
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(reportDirectory, "pbos-planning-handoff-report.md"),
    renderPlanningHandoffReport(record),
    "utf8"
  );
  return record;
}

export * from "./authorization";
export * from "./evaluator";
export * from "./history";
export * from "./lineage";
export * from "./registry";
export * from "./reports";
export * from "./types";
export * from "./transitions";
