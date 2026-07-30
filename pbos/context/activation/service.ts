import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { Artifacts, Runtime, artifactDigest, type JsonValue } from "../../kernel";
import { loadRepositoryContextArtifact, loadRepositoryContextSnapshot } from "../loader";
import {
  RepositoryContextReconciliation,
  assessRepositoryReality,
} from "../reconciliation";
import type { RepositoryRealityAssessment } from "../reconciliation";
import { activateBuildContext } from "./authority";
import {
  createChangeInventory,
  loadChangeBoundary,
  validateChangeBoundary,
} from "../change-boundary";
import {
  loadLaunchApproval,
  validateLaunchApproval,
} from "../../authority/launch";
import type {
  ContextActivationDecision,
  ContextActivationEvidence,
  ContextActivationRequest,
  ContextActivationSnapshot,
  TrustedBuildContext,
  TrustedBuildContextHistory,
} from "./types";

function filesUnder(rootDir: string, relativeDir: string): string[] {
  const absolute = path.join(rootDir, relativeDir);
  try {
    return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
      const relative = path.join(relativeDir, entry.name);
      return entry.isDirectory() ? filesUnder(rootDir, relative) : [relative];
    });
  } catch {
    return [];
  }
}

export interface TrustedContextDiscovery {
  readonly assessment: RepositoryRealityAssessment;
  readonly reconciliation: ReturnType<RepositoryContextReconciliation["reconcile"]>;
  readonly activation_snapshot: ContextActivationSnapshot;
}

export function discoverTrustedContext(
  rootDir = process.cwd(),
  timestamp = new Date().toISOString()
): TrustedContextDiscovery {
  const current = loadRepositoryContextSnapshot(rootDir);
  const architectureFiles = filesUnder(rootDir, "docs/CONSTITUTION");
  const governanceFiles = [
    "CODEX.md",
    "docs/ARCHITECTURE.md",
    "pbos/manifests/playbook-master-manifest.yaml",
  ];
  const assessment = assessRepositoryReality({
    rootDir,
    snapshot: current,
    architectureFiles,
    governanceFiles,
    timestamp,
  });
  const reconciliation = new RepositoryContextReconciliation().reconcile({
    stored: loadRepositoryContextArtifact(rootDir),
    current,
    timestamp,
  });
  const changeInventory = createChangeInventory(rootDir, timestamp);
  const changeBoundary = loadChangeBoundary(rootDir)?.latest ?? null;
  const changeBoundaryValidation = changeBoundary
    ? validateChangeBoundary(changeBoundary, changeInventory, timestamp)
    : { valid: false, findings: ["Approved change boundary is missing."] };
  const launchApproval = loadLaunchApproval(rootDir)?.latest ?? null;
  const launchApprovalValidation = launchApproval
    ? validateLaunchApproval({
        approval: launchApproval,
        boundary: changeBoundary,
        timestamp,
      })
    : { valid: false, findings: ["Human launch approval is missing."] };
  const snapshotBody = {
    context_id: assessment.assessment_id,
    repository_identity: assessment.repository_identity,
    commit_identity: assessment.current_commit,
    branch_identity: assessment.current_branch,
    reconciliation_state: reconciliation.state === "VERIFIED"
      ? "VERIFIED" as const
      : reconciliation.state === "REVIEW_REQUIRED"
        ? "REVIEW_REQUIRED" as const
        : "REJECTED" as const,
    working_tree_clean: assessment.working_tree_state === "CLEAN",
    artifact_inventory_valid: assessment.artifact_state === "VALID",
    architecture_inventory_valid: Boolean(assessment.architecture_digest),
    manifest_digest: assessment.manifest_digest ?? "",
    artifact_digest: assessment.artifact_digest,
    architecture_digest: assessment.architecture_digest,
    governance_digest: artifactDigest(
      governanceFiles.map((file) => ({
        file,
        content: readFileSync(path.join(rootDir, file), "utf8"),
      }))
    ),
    governance_state_valid: assessment.governance_state === "VALID",
    change_boundary_identity: changeBoundary?.digest ?? "",
    change_boundary_valid: changeBoundaryValidation.valid,
    launch_approval_identity: launchApproval?.digest ?? "",
    launch_approval_reviewer_identity: launchApproval?.reviewer_identity ?? "",
    launch_approval_valid:
      launchApprovalValidation.valid && launchApproval?.decision === "APPROVED",
  };
  const activation_snapshot = {
    ...snapshotBody,
    digest: artifactDigest(snapshotBody),
  };
  return { assessment, reconciliation, activation_snapshot };
}

function isTrustedBuildContext(value: unknown): value is TrustedBuildContext {
  if (!value || typeof value !== "object") return false;
  const context = value as Record<string, unknown>;
  return [
    "context_id", "repository_identity", "commit_identity", "branch_identity",
    "manifest_digest", "artifact_digest", "architecture_digest", "governance_digest",
    "change_boundary_identity",
    "launch_approval_identity",
    "activation_decision_id", "created_timestamp", "expiration_timestamp", "created_by", "digest",
  ].every((key) => typeof context[key] === "string" && context[key] !== "");
}

export function loadTrustedBuildContext(rootDir = process.cwd()): TrustedBuildContextHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.trustedBuildContext);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, JsonValue>;
  if (
    record.owner !== "context-activation-authority" ||
    !isTrustedBuildContext(record.latest) ||
    !Array.isArray(record.history) ||
    !record.history.every(isTrustedBuildContext)
  ) return null;
  const body = {
    owner: "context-activation-authority" as const,
    latest: record.latest,
    history: record.history,
  };
  if (record.digest !== artifactDigest(body)) return null;
  return { ...body, digest: record.digest as string };
}

export function persistTrustedContext(
  rootDir: string,
  evidence: ContextActivationEvidence
): TrustedBuildContextHistory {
  if (!evidence.trusted_context || evidence.outcome.decision !== "TRUSTED") {
    throw new Error("Blocked context activation cannot be persisted.");
  }
  const existing = loadTrustedBuildContext(rootDir);
  const history = [
    ...(existing?.history ?? []),
    ...(existing?.latest ? [existing.latest] : []),
  ].filter((value, index, values) =>
    values.findIndex(({ digest }) => digest === value.digest) === index
  );
  const body = {
    owner: "context-activation-authority" as const,
    latest: evidence.trusted_context,
    history,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.trustedBuildContext),
    artifact,
    "context-activation-authority"
  );
  return artifact;
}

export function createActivationEvidence(input: {
  readonly discovery: TrustedContextDiscovery;
  readonly requestedBy: string;
  readonly reviewerIdentity: string;
  readonly decision: "APPROVED" | "REJECTED";
  readonly reason: string;
  readonly riskAcknowledgement: string;
  readonly timestamp: string;
  readonly expirationTimestamp: string;
}): ContextActivationEvidence {
  const requestBody = {
    request_id: `CONTEXT-ACTIVATION-${input.discovery.activation_snapshot.digest.slice(0, 16)}`,
    requested_by: input.requestedBy,
    snapshot_digest: input.discovery.activation_snapshot.digest,
    reconciliation_digest: input.discovery.reconciliation.digest,
    risk_acknowledgement: input.riskAcknowledgement,
    timestamp: input.timestamp,
  };
  const request: ContextActivationRequest = {
    ...requestBody,
    digest: artifactDigest(requestBody),
  };
  const decisionBody = {
    decision_id: `CONTEXT-DECISION-${artifactDigest({
      context: input.discovery.activation_snapshot.context_id,
      reviewer: input.reviewerIdentity,
      timestamp: input.timestamp,
    }).slice(0, 16)}`,
    context_id: input.discovery.activation_snapshot.context_id,
    reviewer_identity: input.reviewerIdentity,
    decision: input.decision,
    reason: input.reason,
    evidence_references: [
      input.discovery.assessment.digest,
      input.discovery.reconciliation.digest,
      input.discovery.activation_snapshot.digest,
    ],
    risk_acknowledgement: input.riskAcknowledgement,
    timestamp: input.timestamp,
  };
  const decision: ContextActivationDecision = {
    ...decisionBody,
    digest: artifactDigest(decisionBody),
  };
  return activateBuildContext(
    input.discovery.activation_snapshot,
    request,
    decision,
    input.timestamp,
    input.expirationTimestamp
  );
}
