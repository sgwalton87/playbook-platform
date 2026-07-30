import type { AgentRecord } from "../../agents/registry";
import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import { artifactDigest } from "../../kernel/identity";
import { CodexExecutionPackageEngine } from "../../orchestration/execution-packages";
import type { CodexExecutionPackage } from "../../orchestration/execution-packages";
import type { ExecutionAuthorityRecord, ExecutionAuthorityValidation } from "./types";

export function validateExecutionAuthority(input: {
  readonly record: ExecutionAuthorityRecord;
  readonly context: TrustedBuildContext | null;
  readonly package: CodexExecutionPackage | null;
  readonly approval: ApprovalRecord | null;
  readonly agent: AgentRecord | null;
  readonly timestamp: string;
}): ExecutionAuthorityValidation {
  const { record, context, package: executionPackage, approval, agent } = input;
  const findings = [
    ...(artifactDigest({ ...record, digest: undefined }) !== record.digest
      ? ["Execution authority digest is invalid."]
      : []),
    ...(!context ? ["Trusted context is required."] : []),
    ...(!executionPackage ? ["Certified package is required."] : []),
    ...(executionPackage &&
    !new CodexExecutionPackageEngine().validate(executionPackage).valid
      ? ["Execution package validation failed."]
      : []),
    ...(!approval || approval.decision !== "APPROVED"
      ? ["Human approval is required."]
      : []),
    ...(!agent || agent.status !== "REGISTERED"
      ? ["Registered authorized agent is required."]
      : []),
    ...(context &&
    (record.context_id !== context.context_id ||
      record.context_digest !== context.digest)
      ? ["Trusted context identity does not match."]
      : []),
    ...(context && Date.parse(context.expiration_timestamp) <= Date.parse(input.timestamp)
      ? ["Trusted context is expired."]
      : []),
    ...(executionPackage &&
    (record.package_id !== executionPackage.package_id ||
      record.package_digest !== executionPackage.digest)
      ? ["Execution package identity does not match."]
      : []),
    ...(approval &&
    (record.approval_id !== approval.approval_id ||
      record.approval_digest !== approval.digest ||
      approval.package_digest !== record.package_digest ||
      approval.context_digest !== record.context_digest)
      ? ["Approval identity does not match execution authority."]
      : []),
    ...(agent &&
    (record.agent_id !== agent.agent_id || record.agent_digest !== agent.digest)
      ? ["Agent identity does not match execution authority."]
      : []),
    ...(agent
      ? record.required_capabilities
          .filter((capability) => !agent.profile.capabilities.includes(capability))
          .map((capability) => `Agent capability unavailable: ${capability}.`)
      : []),
    ...(record.scope.length === 0 ? ["Execution scope is required."] : []),
    ...record.scope
      .filter((allowed) =>
        record.blocked_operations.some(
          (blocked) => allowed === blocked || allowed.startsWith(`${blocked}/`)
        )
      )
      .map((allowed) => `Execution scope violates blocked operation: ${allowed}.`),
    ...(record.evidence_requirements.length === 0
      ? ["Execution evidence requirements are required."]
      : []),
    ...(!record.package_certification_digest
      ? ["Package certification evidence is required."]
      : []),
    ...(record.authority_status !== "AUTHORIZED"
      ? ["Execution authority is not authorized."]
      : []),
    ...(Date.parse(record.expiration_time) <= Date.parse(input.timestamp)
      ? ["Execution authority is expired."]
      : []),
    ...(Date.parse(record.authorization_time) > Date.parse(input.timestamp)
      ? ["Execution authority is not yet effective."]
      : []),
  ];
  return { valid: findings.length === 0, findings };
}
