import path from "node:path";
import { Artifacts, Runtime, artifactDigest } from "../../kernel";
import type { ApprovalRecord } from "../../authority";
import type { ExecutionAuthorization, ExecutionAuthorityRecord } from "./types";

export interface ExecutionAuthorityLedgerEntry {
  readonly ledger_entry_id: string;
  readonly approval_id: string;
  readonly approval_digest: string;
  readonly authority_id: string;
  readonly authority_digest: string;
  readonly authorization_id: string;
  readonly authorization_digest: string;
  readonly package_id: string;
  readonly package_digest: string;
  readonly provider_id: string;
  readonly provider_contract_id: string;
  readonly assigned_agent_id: string;
  readonly context_digest: string;
  readonly scope_digest: string;
  readonly requester: string;
  readonly reviewer: string;
  readonly expiration: string;
  readonly status: "AUTHORIZED" | "REVOKED";
  readonly recorded_at: string;
  readonly digest: string;
}

export interface ExecutionAuthorityLedger {
  readonly owner: "execution-authority-ledger";
  readonly entries: readonly ExecutionAuthorityLedgerEntry[];
  readonly digest: string;
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function entry(value: unknown): value is ExecutionAuthorityLedgerEntry {
  if (!record(value)) return false;
  const { digest, ...body } = value;
  return (
    typeof digest === "string" &&
    digest === artifactDigest(body) &&
    typeof value.authorization_id === "string" &&
    typeof value.package_digest === "string" &&
    (value.status === "AUTHORIZED" || value.status === "REVOKED")
  );
}

export function loadExecutionAuthorityLedger(
  rootDir = process.cwd()
): ExecutionAuthorityLedger | null {
  const artifactPath = path.join(rootDir, Artifacts.executionAuthorityLedger);
  if (!Runtime.exists(artifactPath)) return null;
  const value = Runtime.load(artifactPath);
  if (
    !record(value) ||
    value.owner !== "execution-authority-ledger" ||
    !Array.isArray(value.entries) ||
    !value.entries.every(entry) ||
    typeof value.digest !== "string"
  ) {
    throw new Error("Execution authority ledger is invalid.");
  }
  const body = { owner: value.owner, entries: value.entries };
  if (value.digest !== artifactDigest(body)) {
    throw new Error("Execution authority ledger digest is invalid.");
  }
  return value as unknown as ExecutionAuthorityLedger;
}

export function persistExecutionAuthorityLedgerEntry(input: {
  readonly rootDir: string;
  readonly approval: ApprovalRecord;
  readonly authority: ExecutionAuthorityRecord;
  readonly authorization: ExecutionAuthorization;
}): ExecutionAuthorityLedger {
  const { approval, authority, authorization } = input;
  if (
    approval.decision !== "APPROVED" ||
    authority.authority_status !== "AUTHORIZED" ||
    authorization.status !== "AUTHORIZED" ||
    authority.approval_id !== approval.approval_id ||
    authorization.package_digest !== authority.package_digest ||
    authorization.context_digest !== authority.context_digest
  ) {
    throw new Error("Execution authority ledger correlation rejected.");
  }
  const entryBody = {
    ledger_entry_id: `EXECUTION-AUTHORITY-LEDGER-${authorization.authorization_id}`,
    approval_id: approval.approval_id,
    approval_digest: approval.digest,
    authority_id: authority.execution_authority_id,
    authority_digest: authority.digest,
    authorization_id: authorization.authorization_id,
    authorization_digest: authorization.digest,
    package_id: authorization.package_id,
    package_digest: authorization.package_digest,
    provider_id: authorization.provider_id,
    provider_contract_id: authorization.provider_contract_id,
    assigned_agent_id: authorization.agent_id,
    context_digest: authorization.context_digest,
    scope_digest: artifactDigest([...authorization.allowed_actions].sort()),
    requester: approval.requested_by,
    reviewer: approval.approved_by,
    expiration: authorization.expiration,
    status: "AUTHORIZED" as const,
    recorded_at: authorization.issued_at,
  };
  const ledgerEntry = { ...entryBody, digest: artifactDigest(entryBody) };
  const existing = loadExecutionAuthorityLedger(input.rootDir);
  const entries = [...(existing?.entries ?? []), ledgerEntry].filter(
    (item, index, values) =>
      values.findIndex(({ authorization_id }) => authorization_id === item.authorization_id) === index
  );
  const body = { owner: "execution-authority-ledger" as const, entries };
  const ledger = { ...body, digest: artifactDigest(body) };
  Runtime.save(
    path.join(input.rootDir, Artifacts.executionAuthorityLedger),
    ledger,
    "execution-authority-ledger"
  );
  return ledger;
}
