export const AGENT_PERMISSIONS = [
  "READ_APPROVED_SCOPE",
  "CREATE_APPROVED_FILES",
  "MODIFY_APPROVED_FILES",
  "RUN_TESTS",
  "RUN_VALIDATION",
] as const;

export type AgentPermission = (typeof AGENT_PERMISSIONS)[number];

export interface AgentPermissionDecision {
  readonly admitted: boolean;
  readonly findings: readonly string[];
  readonly digest: string;
}
