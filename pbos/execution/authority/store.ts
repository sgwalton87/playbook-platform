import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { ExecutionAuthorityHistory, ExecutionAuthorityRecord } from "./types";

function isRecord(value: unknown): value is ExecutionAuthorityRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return [
    "execution_authority_id", "package_id", "package_digest",
    "package_certification_digest", "context_id", "context_digest",
    "approval_id", "approval_digest", "agent_id", "agent_digest",
    "authorization_time", "expiration_time", "authority_status", "digest",
  ].every((key) => typeof record[key] === "string" && record[key] !== "");
}

export function loadExecutionAuthority(
  rootDir = process.cwd()
): ExecutionAuthorityHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.executionAuthority);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const artifact = value as Record<string, unknown>;
  if (
    artifact.owner !== "execution-authority" ||
    !isRecord(artifact.latest) ||
    !Array.isArray(artifact.history) ||
    !artifact.history.every(isRecord)
  ) return null;
  const body = {
    owner: "execution-authority" as const,
    latest: artifact.latest,
    history: artifact.history,
  };
  if (artifact.digest !== artifactDigest(body)) return null;
  return { ...body, digest: artifact.digest as string };
}

export function persistExecutionAuthority(
  rootDir: string,
  record: ExecutionAuthorityRecord
): ExecutionAuthorityHistory {
  if (record.authority_status !== "AUTHORIZED") {
    throw new Error("Only authorized execution authority may be persisted.");
  }
  const existing = loadExecutionAuthority(rootDir);
  const history = [
    ...(existing?.history ?? []),
    ...(existing?.latest ? [existing.latest] : []),
  ].filter((value, index, values) =>
    values.findIndex(({ digest }) => digest === value.digest) === index
  );
  const body = {
    owner: "execution-authority" as const,
    latest: record,
    history,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.executionAuthority),
    artifact,
    "execution-authority"
  );
  return artifact;
}
