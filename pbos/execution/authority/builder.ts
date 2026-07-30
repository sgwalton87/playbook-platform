import type { AgentRecord } from "../../agents/registry";
import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import { artifactDigest } from "../../kernel/identity";
import type { CodexExecutionPackage } from "../../orchestration/execution-packages";
import type { ExecutionAuthorityRecord } from "./types";
import { validateExecutionAuthority } from "./validator";

export function createExecutionAuthority(input: {
  readonly context: TrustedBuildContext;
  readonly package: CodexExecutionPackage;
  readonly packageCertificationDigest: string;
  readonly approval: ApprovalRecord;
  readonly agent: AgentRecord;
  readonly scope: readonly string[];
  readonly blockedOperations: readonly string[];
  readonly requiredCapabilities: readonly string[];
  readonly evidenceRequirements: readonly string[];
  readonly authorizationTime: string;
  readonly expirationTime: string;
}): ExecutionAuthorityRecord {
  const body = {
    execution_authority_id: `EXECUTION-AUTHORITY-${artifactDigest({
      package: input.package.digest,
      context: input.context.digest,
      approval: input.approval.digest,
      agent: input.agent.digest,
    }).slice(0, 16)}`,
    package_id: input.package.package_id,
    package_digest: input.package.digest,
    package_certification_digest: input.packageCertificationDigest,
    context_id: input.context.context_id,
    context_digest: input.context.digest,
    approval_id: input.approval.approval_id,
    approval_digest: input.approval.digest,
    agent_id: input.agent.agent_id,
    agent_digest: input.agent.digest,
    scope: [...input.scope].sort(),
    blocked_operations: [...input.blockedOperations].sort(),
    required_capabilities: [...input.requiredCapabilities].sort(),
    evidence_requirements: [...input.evidenceRequirements].sort(),
    risk_level: input.approval.risk_level,
    authorization_time: input.authorizationTime,
    expiration_time: input.expirationTime,
    authority_status: "AUTHORIZED" as const,
  };
  const record = { ...body, digest: artifactDigest(body) };
  const validation = validateExecutionAuthority({
    record,
    context: input.context,
    package: input.package,
    approval: input.approval,
    agent: input.agent,
    timestamp: input.authorizationTime,
  });
  if (!validation.valid) {
    throw new Error(`Execution authority rejected: ${validation.findings.join(" ")}`);
  }
  return record;
}
