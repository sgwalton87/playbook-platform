import type { AgentRecord } from "../../agents/registry";
import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import { artifactDigest } from "../../kernel";
import type { CodexExecutionPackage } from "../../orchestration";
import type { ProviderContract } from "../providers";
import { executionApprovalRecords } from "./approval-store";
import { providerExecutionAuthorizationRecords } from "./authorization-store";
import { persistExecutionAuthorityLedgerEntry, loadExecutionAuthorityLedger } from "./ledger-store";
import { executionAuthorityRecords } from "./store";
import type { ExecutionAuthorization, ExecutionAuthorityRecord } from "./types";
import { validateExecutionAuthorization } from "./issuer";
import { validateExecutionAuthority } from "./validator";

export interface ReusableExecutionAuthority {
  readonly approval: ApprovalRecord;
  readonly authority: ExecutionAuthorityRecord;
  readonly authorization: ExecutionAuthorization;
}

export interface ExecutionAuthorityReuseAssessment {
  readonly valid: boolean;
  readonly authority: ReusableExecutionAuthority | null;
  readonly findings: readonly string[];
}

export function formatReusableExecutionAuthority(
  value: ReusableExecutionAuthority
): string {
  return [
    "PBOS EXISTING AUTHORITY FOUND",
    `Approval: ${value.approval.approval_id}`,
    `Requester: ${value.approval.requested_by}`,
    `Reviewer: ${value.approval.approved_by}`,
    `Expiration: ${value.authorization.expiration}`,
    "Status: VALID",
    "Proceeding.",
  ].join("\n");
}

function equalScope(left: readonly string[], right: readonly string[]): boolean {
  return JSON.stringify([...left].sort()) === JSON.stringify([...right].sort());
}

export function resolveReusableExecutionAuthority(input: {
  readonly rootDir: string;
  readonly context: TrustedBuildContext;
  readonly package: CodexExecutionPackage;
  readonly provider: ProviderContract;
  readonly agent: AgentRecord;
  readonly expected_scope: readonly string[];
  readonly timestamp: string;
}): ExecutionAuthorityReuseAssessment {
  const approvals = executionApprovalRecords(input.rootDir);
  const authorities = executionAuthorityRecords(input.rootDir);
  const authorizations = providerExecutionAuthorizationRecords(input.rootDir);
  const ledger = loadExecutionAuthorityLedger(input.rootDir);
  const reversed = [...authorizations].reverse();
  const authorization = reversed.find((candidate) =>
    candidate.status === "AUTHORIZED" &&
    candidate.package_id === input.package.package_id &&
    candidate.package_digest === input.package.digest &&
    candidate.repository_identity === input.context.repository_identity &&
    candidate.branch_identity === input.context.branch_identity &&
    candidate.commit_identity === input.context.commit_identity &&
    candidate.context_digest === input.context.digest &&
    candidate.trusted_context_identity === input.context.context_id &&
    candidate.provider_id === input.provider.provider_id &&
    candidate.provider_contract_id === input.provider.provider_contract_id &&
    candidate.provider_contract_digest === input.provider.digest &&
    candidate.agent_id === input.agent.agent_id &&
    equalScope(candidate.allowed_actions, input.expected_scope)
  );
  if (!authorization) {
    const latest = reversed[0];
    const findings = !latest
      ? ["No persisted execution authorization exists."]
      : [
          ...(latest.package_id !== input.package.package_id ||
          latest.package_digest !== input.package.digest
            ? ["Execution package identity or digest changed."]
            : []),
          ...(latest.provider_id !== input.provider.provider_id ||
          latest.provider_contract_id !== input.provider.provider_contract_id ||
          latest.provider_contract_digest !== input.provider.digest ||
          latest.agent_id !== input.agent.agent_id
            ? ["Execution provider, contract, or assigned agent changed."]
            : []),
          ...(!equalScope(latest.allowed_actions, input.expected_scope)
            ? ["Execution scope changed."]
            : []),
          ...(latest.repository_identity !== input.context.repository_identity ||
          latest.branch_identity !== input.context.branch_identity ||
          latest.commit_identity !== input.context.commit_identity ||
          latest.context_digest !== input.context.digest
            ? ["Repository context identity changed."]
            : []),
          ...(Date.parse(latest.expiration) <= Date.parse(input.timestamp)
            ? ["Execution authorization expired."]
            : []),
        ];
    return {
      valid: false,
      authority: null,
      findings: findings.length > 0 ? findings : ["Execution authorization chain does not match."],
    };
  }
  const revoked = ledger?.entries.some(
    (entry) =>
      entry.authorization_id === authorization.authorization_id &&
      entry.status === "REVOKED"
  ) ?? false;
  if (revoked) {
    return { valid: false, authority: null, findings: ["Execution authorization is revoked."] };
  }
  const authority = [...authorities].reverse().find((candidate) =>
    `EXECUTION-AUTHORIZATION-${artifactDigest({
      authority: candidate.digest,
      provider: input.provider.digest,
    }).slice(0, 16)}` === authorization.authorization_id
  );
  const approval = authority
    ? [...approvals].reverse().find(
        (candidate) =>
          candidate.approval_id === authority.approval_id &&
          candidate.digest === authority.approval_digest
      )
    : null;
  const findings = [
    ...(!authority ? ["Execution authority correlation is missing."] : []),
    ...(!approval ? ["Human approval correlation is missing."] : []),
    ...(approval && approval.decision !== "APPROVED"
      ? [`Human approval status is ${approval.decision}.`]
      : []),
    ...(approval && (!approval.expiration || Date.parse(approval.expiration) <= Date.parse(input.timestamp))
      ? ["Human approval expired."]
      : []),
    ...(approval && !equalScope(approval.scope, input.expected_scope)
      ? ["Human approval scope changed."]
      : []),
    ...(authorization.status !== "AUTHORIZED"
      ? ["Execution authorization is not authorized."]
      : []),
    ...validateExecutionAuthorization({
      authorization,
      context: input.context,
      package: input.package,
      provider: input.provider,
      timestamp: input.timestamp,
    }),
    ...(authority && approval
      ? validateExecutionAuthority({
          record: authority,
          context: input.context,
          package: input.package,
          approval,
          agent: input.agent,
          timestamp: input.timestamp,
        }).findings
      : []),
  ];
  if (findings.length > 0 || !authority || !approval) {
    return { valid: false, authority: null, findings };
  }
  persistExecutionAuthorityLedgerEntry({
    rootDir: input.rootDir,
    approval,
    authority,
    authorization,
  });
  return {
    valid: true,
    authority: { approval, authority, authorization },
    findings: [],
  };
}
