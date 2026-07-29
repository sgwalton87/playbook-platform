import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  refreshRepositoryContext,
  verifyStoredRepositoryContext,
} from "../../context";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import { decodeLifecycleGovernanceArtifact } from "../../runtime/artifact-decoders";
import { planConstitutionalGate } from "../../planner";
import type { GateDefinition } from "../../planner";
import { reconcileRuntimeArtifacts } from "../../reconciliation";
import { inspectArtifactConsistency } from "../../reconciliation";
import {
  buildReleaseContract,
  persistReleaseContract,
  promoteGate,
  type ValidationAdapter,
} from "../../release";
import { createGateValidationAdapters } from "../../validation";
import { completePromotedGate } from "../completion";
import { evaluateGateCompletionEvidence } from "./evidence";
import { appendLifecycleGovernanceHistory } from "./history";
import { renderLifecycleGovernanceReport } from "./report";
import type {
  LifecycleGovernanceRun,
} from "./types";

interface GovernanceDependencies {
  adapters?: ValidationAdapter[];
  recover?: boolean;
}

function loadGate(rootDir: string, gateId: string): GateDefinition {
  const gatePath = path.join(rootDir, "pbos/gates", `${gateId}.json`);
  return JSON.parse(readFileSync(gatePath, "utf8")) as GateDefinition;
}

function persistRun(
  rootDir: string,
  run: LifecycleGovernanceRun
): void {
  const artifactPath = path.join(
    rootDir,
    Artifacts.lifecycleGovernance
  );
  const existing = Runtime.exists(artifactPath)
    ? decodeLifecycleGovernanceArtifact(Runtime.load(artifactPath))
    : null;
  const artifact = appendLifecycleGovernanceHistory(existing, run);
  Runtime.save(artifactPath, artifact, "lifecycle-governance");
  const reports = path.join(rootDir, "docs/release-evidence");
  mkdirSync(reports, { recursive: true });
  writeFileSync(
    path.join(reports, "pbos-lifecycle-governance-report.md"),
    renderLifecycleGovernanceReport(run),
    "utf8"
  );
}

export async function governGateLifecycle(
  gateId: string,
  rootDir = process.cwd(),
  evaluatedAt = new Date().toISOString(),
  dependencies: GovernanceDependencies = {}
): Promise<LifecycleGovernanceRun> {
  const gate = loadGate(rootDir, gateId);
  const gateContentIdentity = artifactDigest(gate);
  const context = verifyStoredRepositoryContext(rootDir);
  if (!context.valid) {
    throw new Error(
      `Lifecycle governance denied: repository context is invalid.\n${context.errors.join("\n")}`
    );
  }
  const artifactConflicts = inspectArtifactConsistency(rootDir).filter(
    ({ path: artifactPath, classification }) =>
      artifactPath !== Artifacts.repositoryContext &&
      classification !== "valid"
  );
  if (artifactConflicts.length > 0) {
    throw new Error(
      "Lifecycle governance denied: runtime artifact conflicts remain."
    );
  }
  if (gate.id !== gateId) {
    throw new Error("Lifecycle governance denied: gate identity mismatch.");
  }
  const existingPath = path.join(
    rootDir,
    Artifacts.lifecycleGovernance
  );
  if (Runtime.exists(existingPath)) {
    const existing =
      decodeLifecycleGovernanceArtifact(Runtime.load(existingPath));
    const latest = existing.history.at(-1);
    if (latest?.gateId === gateId && latest.completed) {
      throw new Error(
        "Lifecycle governance denied: duplicate completed transition."
      );
    }
  }
  if (gate.status !== "in_progress" || gate.completion_state !== "pending") {
    throw new Error(
      `Lifecycle governance denied: ${gate.status}/${gate.completion_state} does not permit completion.`
    );
  }
  const evaluation = evaluateGateCompletionEvidence({
    gate,
    rootDir,
    evaluatedAt,
  });
  const base = {
    gateId,
    previousStatus: gate.status,
    evaluatedAt,
    authority: "lifecycle-governance" as const,
    gateContentIdentity,
    evidenceEvaluation: evaluation,
  };
  if (!evaluation.passed) {
    const run: LifecycleGovernanceRun = {
      runId: artifactDigest({ ...base, blockers: evaluation.blockers }),
      ...base,
      newStatus: gate.status,
      validationEvidence: [],
      promotionEligible: false,
      promoted: false,
      completed: false,
      transition: null,
      recovery: {
        artifactsReconciled: false,
        contextRefreshed: false,
        planningRefreshed: false,
      },
      blockers: evaluation.blockers,
    };
    persistRun(rootDir, run);
    throw new Error(
      `Lifecycle governance blocked:\n${evaluation.blockers.join("\n")}`
    );
  }

  const adapters =
    dependencies.adapters ??
    createGateValidationAdapters(gate.validation, rootDir);
  const contract = await buildReleaseContract({
    version: "3.0.0",
    gateId,
    adapters,
    persist: false,
  });
  const validationBlockers =
    contract.overallStatus === "PASS" && contract.promotionReady
      ? []
      : contract.evidence
          .filter(({ status }) => status !== "PASS")
          .map(({ id, summary }) => `${id}: ${summary}`);
  if (validationBlockers.length > 0) {
    const run: LifecycleGovernanceRun = {
      runId: artifactDigest({
        ...base,
        validation: contract.evidence,
      }),
      ...base,
      newStatus: gate.status,
      validationEvidence: contract.evidence,
      promotionEligible: false,
      promoted: false,
      completed: false,
      transition: null,
      recovery: {
        artifactsReconciled: false,
        contextRefreshed: false,
        planningRefreshed: false,
      },
      blockers: validationBlockers,
    };
    persistRun(rootDir, run);
    throw new Error(
      `Lifecycle validation blocked:\n${validationBlockers.join("\n")}`
    );
  }

  const contextAfterValidation =
    verifyStoredRepositoryContext(rootDir);
  if (!contextAfterValidation.valid) {
    throw new Error(
      `Lifecycle promotion denied: repository context changed during validation.\n${contextAfterValidation.errors.join("\n")}`
    );
  }
  await persistReleaseContract(
    contract,
    path.join(rootDir, "docs/release-evidence")
  );
  const promotion = await promoteGate(rootDir);
  if (!promotion.promoted) {
    throw new Error(`Lifecycle promotion blocked: ${promotion.reason}`);
  }
  const transition = await completePromotedGate({
    requestedGateId: gateId,
    rootDir,
    additionalEvidence: [
      evaluation.manifestPath,
      ...evaluation.evidence.map(({ path: evidencePath }) => evidencePath),
    ],
  });
  const recovery = {
    artifactsReconciled: false,
    contextRefreshed: false,
    planningRefreshed: false,
  };
  if (dependencies.recover !== false) {
    await reconcileRuntimeArtifacts(rootDir, evaluatedAt);
    recovery.artifactsReconciled = true;
    refreshRepositoryContext({
      rootDir,
      reason: `Lifecycle completion recovery for ${gateId}.`,
      now: new Date(evaluatedAt),
    });
    recovery.contextRefreshed = true;
    await planConstitutionalGate({ rootDir });
    recovery.planningRefreshed = true;
  }
  const run: LifecycleGovernanceRun = {
    runId: artifactDigest({
      ...base,
      transition,
      validation: contract.evidence,
    }),
    ...base,
    newStatus: transition.to,
    validationEvidence: contract.evidence,
    promotionEligible: true,
    promoted: true,
    completed: true,
    transition,
    recovery,
    blockers: [],
  };
  persistRun(rootDir, run);
  return run;
}
