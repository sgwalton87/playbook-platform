import type { AgentRegistry } from "../../agents/registry";
import { AgentPermissionPolicy } from "../../agents/permissions";
import type { ApprovalRecord } from "../../authority";
import type { TrustedBuildContext } from "../../context/activation";
import { artifactDigest } from "../../kernel/identity";
import type { CodexExecutionPackage } from "../../orchestration/execution-packages";
import type {
  ExecutionTask,
  GovernedTaskAssignment,
  TaskAssignment,
} from "./types";

export function createGovernedTaskAssignment(
  input: Omit<GovernedTaskAssignment, "digest">
): GovernedTaskAssignment {
  if (
    !input.task_id ||
    !input.package_id ||
    !input.milestone_id ||
    !input.agent_id ||
    !input.context_id ||
    !input.approval_id ||
    input.allowed_operations.length === 0 ||
    input.allowed_scope.length === 0 ||
    input.validation_requirements.length === 0 ||
    input.evidence_requirements.length === 0 ||
    input.allowed_operations.some((operation) =>
      input.blocked_operations.includes(operation)
    )
  ) {
    throw new Error("Governed task assignment contract rejected.");
  }
  return { ...input, digest: artifactDigest(input) };
}

export function assignExecutionTask(input: {
  readonly task: Omit<ExecutionTask, "digest">;
  readonly registry: AgentRegistry;
  readonly context: TrustedBuildContext | null;
  readonly approval: ApprovalRecord | null;
  readonly package: CodexExecutionPackage | null;
  readonly execution_authorization_id: string;
  readonly provider_id: string;
  readonly provider_contract_id: string;
  readonly resolved_agent_id: string;
  readonly required_permissions: readonly string[];
}): TaskAssignment {
  const agent = input.registry.get(input.task.assigned_agent);
  const findings = [
    ...(!input.execution_authorization_id ||
    input.task.execution_authorization_id !== input.execution_authorization_id
      ? ["Task execution authorization identity does not match."]
      : []),
    ...(!input.provider_id || input.task.provider_id !== input.provider_id
      ? ["Task provider identity does not match."]
      : []),
    ...(!input.provider_contract_id ||
    input.task.provider_contract_id !== input.provider_contract_id
      ? ["Task provider contract identity does not match."]
      : []),
    ...(!input.resolved_agent_id ||
    input.task.assigned_agent !== input.resolved_agent_id
      ? ["Task resolved agent identity does not match."]
      : []),
    ...(!input.context ? ["Trusted context is required."] : []),
    ...(!input.approval || input.approval.decision !== "APPROVED"
      ? ["Approved authority record is required."]
      : []),
    ...(!input.package ? ["Execution package is required."] : []),
    ...(!agent ? ["Assigned agent is unknown."] : []),
    ...(input.context && input.task.context_identity !== input.context.digest
      ? ["Task context identity does not match."]
      : []),
    ...(input.approval && input.task.authorization_reference !== input.approval.approval_id
      ? ["Task authorization identity does not match."]
      : []),
    ...(input.package &&
    (input.task.package_id !== input.package.package_id ||
      input.task.milestone_id !== input.package.milestone_id)
      ? ["Task package identity does not match."]
      : []),
    ...(agent
      ? input.task.required_capabilities
          .filter((capability) => !agent.profile.capabilities.includes(capability))
          .map((capability) => `Agent capability unavailable: ${capability}.`)
      : []),
    ...(input.task.allowed_scope.length === 0 ? ["Approved scope is required."] : []),
    ...input.task.allowed_scope
      .filter((path) =>
        input.task.prohibited_scope.some(
          (prohibited) => path === prohibited || path.startsWith(`${prohibited}/`)
        )
      )
      .map((path) => `Approved scope intersects prohibited scope: ${path}.`),
  ];
  if (agent) {
    findings.push(
      ...new AgentPermissionPolicy()
        .evaluate(agent, input.required_permissions)
        .findings
    );
  }
  const task = { ...input.task, digest: artifactDigest(input.task) };
  const body = {
    task,
    assigned: findings.length === 0,
    authority: "PBOS-TASK-ASSIGNMENT" as const,
    findings,
  };
  return { ...body, digest: artifactDigest(body) };
}
