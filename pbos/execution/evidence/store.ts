import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { ExecutionEvidenceBundle } from "./types";

export interface ExecutionEvidenceHistory {
  readonly owner: "execution-evidence";
  readonly latest: ExecutionEvidenceBundle;
  readonly history: readonly ExecutionEvidenceBundle[];
  readonly digest: string;
}

function validBundle(bundle: ExecutionEvidenceBundle): boolean {
  return bundle.digest === artifactDigest({
    record: bundle.record,
    completion: bundle.completion,
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEvidenceBundle(value: unknown): value is ExecutionEvidenceBundle {
  if (!isRecord(value) || !isRecord(value.record) ||
    !isRecord(value.completion)) return false;
  const record = value.record;
  const completion = value.completion;
  return (
    typeof value.digest === "string" &&
    typeof record.execution_id === "string" &&
    typeof record.task_id === "string" &&
    typeof record.package_digest === "string" &&
    typeof record.context_digest === "string" &&
    typeof record.approval_id === "string" &&
    typeof record.authorization_id === "string" &&
    typeof record.provider_id === "string" &&
    typeof record.provider_contract_id === "string" &&
    typeof record.agent_id === "string" &&
    (record.status === "SUCCEEDED" || record.status === "FAILED") &&
    Array.isArray(record.artifacts) &&
    Array.isArray(record.validation_results) &&
    Array.isArray(record.evidence_references) &&
    typeof record.completed_at === "string" &&
    typeof record.digest === "string" &&
    typeof completion.execution_id === "string" &&
    typeof completion.complete === "boolean" &&
    typeof completion.advancement_eligible === "boolean" &&
    Array.isArray(completion.findings) &&
    typeof completion.digest === "string"
  );
}

function decodeHistory(value: unknown): ExecutionEvidenceHistory {
  if (
    !isRecord(value) ||
    value.owner !== "execution-evidence" ||
    !isEvidenceBundle(value.latest) ||
    !Array.isArray(value.history) ||
    !value.history.every(isEvidenceBundle) ||
    typeof value.digest !== "string"
  ) {
    throw new Error("Execution evidence history is invalid.");
  }
  return {
    owner: value.owner,
    latest: value.latest,
    history: value.history,
    digest: value.digest,
  };
}

export function loadExecutionEvidence(
  rootDir = process.cwd()
): ExecutionEvidenceHistory | null {
  const artifactPath = path.join(rootDir, Artifacts.executionEvidence);
  if (!Runtime.exists(artifactPath)) return null;
  const value = decodeHistory(Runtime.load(artifactPath));
  const body = {
    owner: value.owner,
    latest: value.latest,
    history: value.history,
  };
  if (
    value.owner !== "execution-evidence" ||
    !Array.isArray(value.history) ||
    !validBundle(value.latest) ||
    !value.history.every(validBundle) ||
    value.digest !== artifactDigest(body)
  ) {
    throw new Error("Execution evidence history is invalid.");
  }
  return value;
}

export function persistExecutionEvidence(
  rootDir: string,
  bundle: ExecutionEvidenceBundle
): ExecutionEvidenceHistory {
  if (!validBundle(bundle)) {
    throw new Error("Execution evidence persistence rejected.");
  }
  const existing = loadExecutionEvidence(rootDir);
  const history = existing
    ? [...existing.history, existing.latest].filter(
        (item, index, items) =>
          items.findIndex(({ digest }) => digest === item.digest) === index
      )
    : [];
  const body = {
    owner: "execution-evidence" as const,
    latest: bundle,
    history,
  };
  const artifact = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(rootDir, Artifacts.executionEvidence),
    artifact,
    "execution-evidence"
  );
  return artifact;
}
