import type { ExecutionAdapter } from "../adapters";

export const PROVIDER_TYPES = [
  "CODE_AGENT",
  "TEST_AGENT",
  "DOCUMENTATION_AGENT",
  "DESIGN_AGENT",
] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];

export interface ProviderContract {
  readonly provider_id: string;
  readonly provider_type: ProviderType;
  readonly capabilities: readonly string[];
  readonly version: string;
  readonly trust_level: "CERTIFIED";
  readonly execution_method: "CONTROLLED_DELEGATE";
  readonly evidence_contract: readonly string[];
  readonly digest: string;
}

export interface RegisteredExecutionProvider {
  readonly contract: ProviderContract;
  readonly adapter: ExecutionAdapter;
}
