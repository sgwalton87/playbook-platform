import { artifactDigest } from "../../kernel/identity";
import type {
  ExecutionAdmissionEvidence,
  ExecutionAdmissionRequest,
} from "./types";
import { validateExecutionAuthority } from "../authority";

export function evaluateAgentExecutionAdmission(
  request: ExecutionAdmissionRequest,
  decidedAt: string
): ExecutionAdmissionEvidence {
  const {
    context,
    package: executionPackage,
    approval,
    agent,
    assignment,
    identity_resolution: resolution,
  } = request;
  const authorityValidation = request.execution_authority
    ? validateExecutionAuthority({
        record: request.execution_authority,
        context,
        package: executionPackage,
        approval,
        agent,
        timestamp: request.requested_at,
      })
    : { valid: false, findings: ["Execution authority record is required."] };
  const expiration = approval?.expiration ? Date.parse(approval.expiration) : null;
  const findings = [
    ...(!context ? ["Trusted build context is required."] : []),
    ...(!executionPackage ? ["Certified execution package is required."] : []),
    ...(!request.package_certification_digest ? ["Package certification is required."] : []),
    ...(!approval || approval.decision !== "APPROVED" ? ["Valid approval is required."] : []),
    ...(!agent || agent.status !== "REGISTERED" ? ["Authorized agent is required."] : []),
    ...(!resolution || resolution.certification_status !== "CERTIFIED"
      ? ["Certified provider identity resolution is required."]
      : []),
    ...(!assignment || !assignment.assigned ? ["Governed task assignment is required."] : []),
    ...authorityValidation.findings,
    ...(approval && executionPackage && approval.package_digest !== executionPackage.digest
      ? ["Approval package identity does not match."]
      : []),
    ...(approval && context && approval.context_digest !== context.digest
      ? ["Approval context identity does not match."]
      : []),
    ...(assignment && executionPackage && assignment.task.package_id !== executionPackage.package_id
      ? ["Assignment package identity does not match."]
      : []),
    ...(assignment && context && assignment.task.context_identity !== context.digest
      ? ["Assignment context identity does not match."]
      : []),
    ...(assignment && approval && assignment.task.authorization_reference !== approval.approval_id
      ? ["Assignment approval identity does not match."]
      : []),
    ...(assignment && agent && assignment.task.assigned_agent !== agent.agent_id
      ? ["Assignment agent identity does not match."]
      : []),
    ...(resolution && agent && resolution.agent_id !== agent.agent_id
      ? ["Resolved agent identity does not match registration."]
      : []),
    ...(resolution && assignment &&
    (assignment.task.execution_authorization_id.length === 0 ||
      assignment.task.provider_id !== resolution.provider_id ||
      assignment.task.provider_contract_id !== resolution.provider_contract_id ||
      assignment.task.assigned_agent !== resolution.agent_id)
      ? ["Assignment identity chain does not match provider resolution."]
      : []),
    ...(assignment && agent
      ? assignment.task.required_capabilities
          .filter((capability) => !agent.profile.capabilities.includes(capability))
          .map((capability) => `Agent capability unavailable: ${capability}.`)
      : []),
    ...(expiration !== null && expiration <= Date.parse(request.requested_at)
      ? ["Approval is expired."]
      : []),
    ...(assignment?.task.allowed_scope.some((path) =>
      assignment.task.prohibited_scope.some(
        (blocked) => path === blocked || path.startsWith(`${blocked}/`)
      )
    )
      ? ["Assignment scope is invalid."]
      : []),
  ];
  const decisionBody = {
    request_id: request.request_id,
    admitted: findings.length === 0,
    authority: "PBOS-AGENT-EXECUTION-ADMISSION" as const,
    findings,
    decided_at: decidedAt,
  };
  const decision = { ...decisionBody, digest: artifactDigest(decisionBody) };
  const body = {
    request_digest: request.digest,
    context_digest: context?.digest ?? null,
    package_digest: executionPackage?.digest ?? null,
    approval_digest: approval?.digest ?? null,
    agent_digest: agent?.digest ?? null,
    identity_resolution_digest: resolution?.digest ?? null,
    assignment_digest: assignment?.digest ?? null,
    certification_digest: request.package_certification_digest,
    execution_authority_digest: request.execution_authority?.digest ?? null,
    decision,
  };
  return { ...body, digest: artifactDigest(body) };
}
