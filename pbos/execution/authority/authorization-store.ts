import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { ExecutionAuthorization } from "./types";

export interface ExecutionAuthorizationHistory {
  readonly owner: "execution-authorization-authority";
  readonly latest: ExecutionAuthorization;
  readonly history: readonly AuthorizationEvidence[];
  readonly digest: string;
}

type AuthorizationEvidence = Readonly<Record<string, unknown>> & {
  readonly digest: string;
};

interface AuthorizationEnvelope {
  readonly latest: AuthorizationEvidence;
  readonly history: readonly AuthorizationEvidence[];
}

function objectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isAuthorization(value: unknown): value is ExecutionAuthorization {
  if (!objectRecord(value)) return false;
  return [
    "authorization_id", "package_id", "package_digest", "repository_identity",
    "branch_identity", "commit_identity", "context_digest", "provider_id",
    "provider_contract_id", "agent_id",
    "provider_contract_digest", "expiration", "trusted_context_identity",
    "created_by", "approved_by", "status", "issued_at", "digest",
  ].every((key) => key in value && typeof value[key as keyof typeof value] === "string") &&
    "allowed_actions" in value &&
    "prohibited_actions" in value &&
    "evidence_requirements" in value &&
    Array.isArray(value.allowed_actions) &&
    Array.isArray(value.prohibited_actions) &&
    Array.isArray(value.evidence_requirements);
}

function isAuthorizationEvidence(value: unknown): value is AuthorizationEvidence {
  return (
    objectRecord(value) &&
    typeof value.digest === "string" &&
    value.digest === artifactDigest({ ...value, digest: undefined })
  );
}

function loadAuthorizationEnvelope(rootDir: string): AuthorizationEnvelope | null {
  const artifactPath = path.join(rootDir, Artifacts.executionFabricAuthorization);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (
    !objectRecord(value) ||
    value.owner !== "execution-authorization-authority" ||
    !isAuthorizationEvidence(value.latest) ||
    !Array.isArray(value.history) ||
    !value.history.every(isAuthorizationEvidence) ||
    typeof value.digest !== "string"
  ) {
    throw new Error("Provider execution authorization history is invalid.");
  }
  const body = {
    owner: value.owner,
    latest: value.latest,
    history: value.history,
  };
  if (value.digest !== artifactDigest(body)) {
    throw new Error("Provider execution authorization history digest is invalid.");
  }
  return { latest: value.latest, history: value.history };
}

export function loadProviderExecutionAuthorization(
  rootDir = process.cwd()
): ExecutionAuthorizationHistory | null {
  const value = loadAuthorizationEnvelope(rootDir);
  if (!value || !isAuthorization(value.latest)) return null;
  const body = {
    owner: "execution-authorization-authority" as const,
    latest: value.latest,
    history: value.history,
  };
  return {
    owner: "execution-authorization-authority",
    latest: value.latest,
    history: value.history,
    digest: artifactDigest(body),
  };
}

export function persistProviderExecutionAuthorization(
  rootDir: string,
  authorization: ExecutionAuthorization
): ExecutionAuthorizationHistory {
  if (
    authorization.status !== "AUTHORIZED" ||
    authorization.digest !==
      artifactDigest({ ...authorization, digest: undefined })
  ) {
    throw new Error("Provider execution authorization persistence rejected.");
  }
  const existing = loadAuthorizationEnvelope(rootDir);
  const history = existing
    ? [...existing.history, existing.latest].filter(
        (item, index, items) =>
          items.findIndex(({ digest }) => digest === item.digest) === index
      )
    : [];
  const body = {
    owner: "execution-authorization-authority" as const,
    latest: authorization,
    history,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.executionFabricAuthorization),
    artifact,
    "execution-authorization-authority"
  );
  return artifact;
}

export function providerExecutionAuthorizationRecords(
  rootDir = process.cwd()
): readonly ExecutionAuthorization[] {
  const value = loadAuthorizationEnvelope(rootDir);
  if (!value) return [];
  const records: ExecutionAuthorization[] = [];
  for (const candidate of [...value.history, value.latest]) {
    if (isAuthorization(candidate)) records.push(candidate);
  }
  return records;
}
