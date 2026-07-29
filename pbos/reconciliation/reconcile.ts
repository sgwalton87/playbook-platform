import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { runExecutionEngine } from "../execution";
import { Artifacts, Runtime, artifactDigest } from "../kernel";
import { planConstitutionalGate } from "../planner";
import { runRuntimeValidator } from "../validator";
import { appendArtifactReconciliationHistory } from "./history";
import { inspectArtifactConsistency } from "./inspect";
import { renderArtifactConsistencyReport } from "./report";
import type {
  ArtifactReconciliationArtifact,
  ArtifactReconciliationRun,
} from "./types";

function digestFile(rootDir: string, relativePath: string): string {
  return artifactDigest(
    JSON.parse(
      readFileSync(path.join(rootDir, relativePath), "utf8")
    ) as unknown
  );
}

export async function reconcileRuntimeArtifacts(
  rootDir = process.cwd(),
  evaluatedAt = new Date().toISOString()
): Promise<ArtifactReconciliationRun> {
  const before = inspectArtifactConsistency(rootDir);
  const ambiguous = before.filter(
    ({ owner }) => owner === "unknown"
  );
  const state = before.find(
    ({ path: artifactPath }) =>
      artifactPath === "pbos/state/engine-state.json"
  );
  if (ambiguous.length > 0 || state?.classification !== "valid") {
    throw new Error(
      "Artifact reconciliation denied: canonical ownership or engine-state authority is invalid."
    );
  }

  await planConstitutionalGate({ rootDir });
  const validation = runRuntimeValidator(rootDir);
  Runtime.save(
    path.join(rootDir, Artifacts.validation),
    validation,
    "runtime-validator"
  );
  const execution = runExecutionEngine(
    (plan) => plan,
    rootDir
  );
  Runtime.save(
    path.join(rootDir, Artifacts.execution),
    execution,
    "execution-engine"
  );

  const after = inspectArtifactConsistency(rootDir);
  const afterByPath = new Map(
    after.map((artifact) => [artifact.path, artifact])
  );
  const artifacts = before.map((artifact) => {
    const current = afterByPath.get(artifact.path);
    const ownerRegenerated = [
      Artifacts.planning,
      Artifacts.validation,
      Artifacts.execution,
    ].includes(
      artifact.path as
        | typeof Artifacts.planning
        | typeof Artifacts.validation
        | typeof Artifacts.execution
    );
    return {
      ...artifact,
      classification:
        current?.classification ?? artifact.classification,
      reasons:
        artifact.classification === "valid"
          ? current?.reasons ?? []
          : artifact.reasons,
      currentDigest: current
        ? digestFile(rootDir, artifact.path)
        : null,
      regenerated: ownerRegenerated,
    };
  });
  const unresolvedConflicts = after
    .filter(
      ({ path: artifactPath, classification }) =>
        artifactPath !== Artifacts.repositoryContext &&
        classification !== "valid"
    )
    .flatMap(({ path: artifactPath, reasons }) =>
      reasons.map((reason) => `${artifactPath}: ${reason}`)
    );
  const readyForContextRefresh = unresolvedConflicts.length === 0;
  const run: ArtifactReconciliationRun = {
    runId: artifactDigest({
      evaluatedAt,
      before: before.map(({ path: artifactPath, previousDigest }) => ({
        path: artifactPath,
        previousDigest,
      })),
      after: artifacts.map(
        ({ path: artifactPath, currentDigest }) => ({
          path: artifactPath,
          currentDigest,
        })
      ),
    }),
    evaluatedAt,
    owner: "artifact-reconciliation",
    engineStateOwner: "engine-state-manager",
    artifacts,
    unresolvedConflicts,
    artifactHealth: readyForContextRefresh ? "VALID" : "INVALID",
    refreshRequired: true,
    readyForContextRefresh,
  };

  const artifactPath = path.join(
    rootDir,
    Artifacts.artifactReconciliation
  );
  const existing = Runtime.exists(artifactPath)
    ? Runtime.load<ArtifactReconciliationArtifact>(artifactPath)
    : null;
  const evidence = appendArtifactReconciliationHistory(existing, run);
  Runtime.save(
    artifactPath,
    evidence,
    "artifact-reconciliation"
  );

  const reports = path.join(rootDir, "docs/release-evidence");
  mkdirSync(reports, { recursive: true });
  writeFileSync(
    path.join(reports, "pbos-artifact-consistency-report.md"),
    renderArtifactConsistencyReport(run),
    "utf8"
  );
  if (!readyForContextRefresh) {
    throw new Error(
      `Artifact reconciliation remains blocked:\n${unresolvedConflicts.join("\n")}`
    );
  }
  return run;
}
