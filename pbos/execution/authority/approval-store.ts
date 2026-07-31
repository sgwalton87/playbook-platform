import path from "node:path";
import type { ApprovalRecord } from "../../authority";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";

export interface ExecutionApprovalHistory {
  readonly owner: "execution-approval-authority";
  readonly latest: ApprovalRecord;
  readonly history: readonly ApprovalRecord[];
  readonly digest: string;
}

function objectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isApproval(value: unknown): value is ApprovalRecord {
  if (!objectRecord(value)) return false;
  return [
    "approval_id", "request_id", "package_id", "package_digest",
    "context_digest", "requested_by", "approved_by", "authority_type",
    "risk_level", "decision", "timestamp", "digest",
  ].every((key) => key in value && typeof value[key as keyof typeof value] === "string") &&
    "scope" in value &&
    Array.isArray(value.scope);
}

export function loadExecutionApproval(
  rootDir = process.cwd()
): ExecutionApprovalHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.executionApproval);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (
    !objectRecord(value) ||
    value.owner !== "execution-approval-authority" ||
    !isApproval(value.latest) ||
    !Array.isArray(value.history) ||
    !value.history.every(isApproval) ||
    typeof value.digest !== "string"
  ) {
    throw new Error("Execution approval history is invalid.");
  }
  const body = {
    owner: value.owner,
    latest: value.latest,
    history: value.history,
  };
  if (value.digest !== artifactDigest(body)) {
    throw new Error("Execution approval history digest is invalid.");
  }
  return {
    owner: "execution-approval-authority",
    latest: value.latest,
    history: value.history,
    digest: value.digest,
  };
}

export function persistExecutionApproval(
  rootDir: string,
  approval: ApprovalRecord
): ExecutionApprovalHistory {
  if (
    approval.digest !== artifactDigest({ ...approval, digest: undefined })
  ) {
    throw new Error("Execution approval persistence rejected.");
  }
  const existing = loadExecutionApproval(rootDir);
  const history = existing
    ? [...existing.history, existing.latest].filter(
        (item, index, items) =>
          items.findIndex(({ digest }) => digest === item.digest) === index
      )
    : [];
  const body = {
    owner: "execution-approval-authority" as const,
    latest: approval,
    history,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.executionApproval),
    artifact,
    "execution-approval-authority"
  );
  return artifact;
}
