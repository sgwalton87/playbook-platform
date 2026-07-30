import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { ChangeBoundaryDeclaration, ChangeBoundaryHistory } from "./types";

function isDeclaration(value: unknown): value is ChangeBoundaryDeclaration {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const record = value as Record<string, unknown>;
  return [
    "boundary_id", "boundary_type", "repository_identity", "commit_identity", "branch_identity",
    "requester_identity", "inventory_digest", "inventory_identity", "scope_digest", "purpose",
    "business_purpose", "technical_purpose", "owner_identity",
    "risk_acknowledgment", "creation_timestamp", "created_at",
    "expiration_timestamp", "expiration", "digest",
  ].every((key) => typeof record[key] === "string" && record[key] !== "") &&
    ["context_digest", "manifest_digest", "architecture_digest",
      "artifact_digest", "governance_digest"].every(
      (key) => typeof record[key] === "string"
    ) &&
    (record.boundary_type === "CHANGE" ||
      record.boundary_type === "BASELINE_ACTIVATION") &&
    Array.isArray(record.approved_files) &&
    Array.isArray(record.included_files) &&
    Array.isArray(record.excluded_files);
}

export function loadChangeBoundary(
  rootDir = process.cwd()
): ChangeBoundaryHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.changeBoundary);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const artifact = value as Record<string, unknown>;
  if (
    artifact.owner !== "change-boundary-authority" ||
    !isDeclaration(artifact.latest) ||
    !Array.isArray(artifact.history) ||
    !artifact.history.every(isDeclaration)
  ) return null;
  const body = {
    owner: "change-boundary-authority" as const,
    latest: artifact.latest,
    history: artifact.history,
  };
  if (artifact.digest !== artifactDigest(body)) return null;
  return { ...body, digest: artifact.digest as string };
}

export function persistChangeBoundary(
  rootDir: string,
  declaration: ChangeBoundaryDeclaration
): ChangeBoundaryHistory {
  const existing = loadChangeBoundary(rootDir);
  const history = [
    ...(existing?.history ?? []),
    ...(existing?.latest ? [existing.latest] : []),
  ].filter((value, index, values) =>
    values.findIndex(({ digest }) => digest === value.digest) === index
  );
  const body = {
    owner: "change-boundary-authority" as const,
    latest: declaration,
    history,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.changeBoundary),
    artifact,
    "change-boundary-authority"
  );
  return artifact;
}
