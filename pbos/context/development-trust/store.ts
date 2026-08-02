import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { DevelopmentTrustLease } from "./types";

function isLease(value: unknown): value is DevelopmentTrustLease {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return [
    "lease_id", "repository_identity", "remote_identity", "branch_identity",
    "baseline_commit_identity", "current_commit_identity", "authority_identity",
    "requester_identity", "reviewer_identity", "issued_at", "expiration",
    "status", "digest",
  ].every((key) => typeof record[key] === "string" && record[key] !== "") &&
    Array.isArray(record.protected_scopes) && Array.isArray(record.advancements) &&
    record.digest === artifactDigest({ ...record, digest: undefined });
}

export function loadDevelopmentTrustLease(
  rootDir = process.cwd()
): DevelopmentTrustLease | null {
  const artifactPath = path.join(rootDir, Artifacts.developmentTrustLease);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  return isLease(value) ? value : null;
}

export function persistDevelopmentTrustLease(
  rootDir: string,
  lease: DevelopmentTrustLease
): DevelopmentTrustLease {
  const body = { ...lease, digest: undefined };
  const persisted = { ...lease, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.developmentTrustLease),
    persisted,
    "development-trust-authority"
  );
  return persisted;
}
