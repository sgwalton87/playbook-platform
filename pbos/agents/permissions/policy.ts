import { artifactDigest } from "../../kernel/identity";
import type { AgentRecord } from "../registry";
import { AGENT_PERMISSIONS, type AgentPermission, type AgentPermissionDecision } from "./types";

const FORBIDDEN = [
  "SELECT_NEXT_MILESTONE",
  "APPROVE_EXECUTION",
  "MODIFY_MANIFEST",
  "CHANGE_KERNEL_POLICY",
  "ISSUE_CERTIFICATION",
  "ALTER_AUTHORITY_RULES",
] as const;

export class AgentPermissionPolicy {
  evaluate(agent: AgentRecord, requested: readonly string[]): AgentPermissionDecision {
    const findings = [
      ...(agent.status !== "REGISTERED" ? ["Agent is not active."] : []),
      ...requested
        .filter((permission) => FORBIDDEN.includes(permission as never))
        .map((permission) => `Forbidden agent permission requested: ${permission}.`),
      ...requested
        .filter((permission) => !AGENT_PERMISSIONS.includes(permission as AgentPermission))
        .map((permission) => `Unknown agent permission requested: ${permission}.`),
      ...requested
        .filter((permission) => !agent.profile.permissions.includes(permission))
        .map((permission) => `Agent lacks permission: ${permission}.`),
    ];
    const body = { admitted: findings.length === 0, findings };
    return { ...body, digest: artifactDigest(body) };
  }
}
