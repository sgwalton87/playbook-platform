import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type {
  ContextRefreshApprovalHistory,
  ContextRefreshApprovalRecord,
} from "./types";

function isApproval(value: unknown): value is ContextRefreshApprovalRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  const strings = [
    "approval_id", "requester_identity", "reviewer_identity", "decision",
    "decision_reason", "risk_acknowledgment", "repository_identity",
    "branch_identity", "commit_identity", "reconciliation_digest",
    "proposed_context_identity", "state", "timestamp", "expiration", "digest",
  ];
  return strings.every((key) => typeof record[key] === "string" && record[key] !== "") &&
    (record.previous_context_identity === null ||
      typeof record.previous_context_identity === "string") &&
    (record.applied_at === null || typeof record.applied_at === "string") &&
    (record.resulting_context_identity === null ||
      typeof record.resulting_context_identity === "string");
}

export function loadContextRefreshApproval(
  rootDir = process.cwd()
): ContextRefreshApprovalHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.contextRefreshApproval);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const artifact = value as Record<string, unknown>;
  if (
    artifact.owner !== "context-refresh-authority" ||
    !isApproval(artifact.latest) ||
    !Array.isArray(artifact.history) ||
    !artifact.history.every(isApproval)
  ) return null;
  const body = {
    owner: "context-refresh-authority" as const,
    latest: artifact.latest,
    history: artifact.history,
  };
  if (artifact.digest !== artifactDigest(body)) return null;
  return { ...body, digest: artifact.digest as string };
}

export function persistContextRefreshApproval(
  rootDir: string,
  approval: ContextRefreshApprovalRecord
): ContextRefreshApprovalHistory {
  const existing = loadContextRefreshApproval(rootDir);
  const history = [
    ...(existing?.history ?? []),
    ...(existing?.latest ? [existing.latest] : []),
  ].filter((value, index, values) =>
    values.findIndex(({ digest }) => digest === value.digest) === index
  );
  const body = {
    owner: "context-refresh-authority" as const,
    latest: approval,
    history,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.contextRefreshApproval),
    artifact,
    "context-refresh-authority"
  );
  return artifact;
}
