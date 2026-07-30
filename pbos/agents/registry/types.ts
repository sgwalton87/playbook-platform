export const AGENT_TYPES = [
  "CODE_GENERATION_AGENT",
  "TEST_EXECUTION_AGENT",
  "DOCUMENTATION_AGENT",
  "DESIGN_GENERATION_AGENT",
  "VALIDATION_AGENT",
  "ANALYSIS_AGENT",
] as const;

export type AgentType = (typeof AGENT_TYPES)[number];
export type AgentStatus = "REGISTERED" | "SUSPENDED" | "REVOKED";
export type AgentTrustLevel = "RESTRICTED" | "STANDARD" | "ELEVATED";

export interface AgentCapabilityProfile {
  readonly capabilities: readonly string[];
  readonly permissions: readonly string[];
}

export interface AgentRecord {
  readonly agent_id: string;
  readonly name: string;
  readonly provider: string;
  readonly version: string;
  readonly type: AgentType;
  readonly profile: AgentCapabilityProfile;
  readonly status: AgentStatus;
  readonly trust_level: AgentTrustLevel;
  readonly created_at: string;
  readonly updated_at: string;
  readonly digest: string;
}

export interface AgentRegistrySnapshot {
  readonly agents: readonly AgentRecord[];
  readonly digest: string;
}
