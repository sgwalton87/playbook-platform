import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { LaunchApprovalHistory, LaunchApprovalRecord } from "./types";

function isApproval(value: unknown): value is LaunchApprovalRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return [
    "approval_id", "requester_identity", "reviewer_identity", "boundary_id",
    "boundary_digest", "decision", "decision_reason", "risk_acknowledgment",
    "scope_identity", "timestamp", "approval_timestamp",
    "expiration", "digest",
  ].every((key) => typeof record[key] === "string" && record[key] !== "") &&
    typeof record.ledger_decision === "object";
}

export function loadLaunchApproval(
  rootDir = process.cwd()
): LaunchApprovalHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.launchApproval);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const artifact = value as Record<string, unknown>;
  if (
    artifact.owner !== "authority-ledger" ||
    !isApproval(artifact.latest) ||
    !Array.isArray(artifact.history) ||
    !artifact.history.every(isApproval)
  ) return null;
  const body = {
    owner: "authority-ledger" as const,
    latest: artifact.latest,
    history: artifact.history,
  };
  if (artifact.digest !== artifactDigest(body)) return null;
  return { ...body, digest: artifact.digest as string };
}

export function persistLaunchApproval(
  rootDir: string,
  approval: LaunchApprovalRecord
): LaunchApprovalHistory {
  const existing = loadLaunchApproval(rootDir);
  const history = [
    ...(existing?.history ?? []),
    ...(existing?.latest ? [existing.latest] : []),
  ].filter((value, index, values) =>
    values.findIndex(({ digest }) => digest === value.digest) === index
  );
  const body = {
    owner: "authority-ledger" as const,
    latest: approval,
    history,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(path.join(rootDir, Artifacts.launchApproval), artifact, "authority-ledger");
  return artifact;
}
