import { CodexExecutionAdapter, type CodexTaskDelegate } from "../adapters";
import type { ProviderContract } from "./types";
import { ExecutionProviderRegistry } from "./registry";

export function createCodexProviderContract(input: {
  readonly provider_id: string;
  readonly version: string;
}): Omit<ProviderContract, "digest"> {
  return {
    provider_id: input.provider_id,
    provider_type: "CODE_AGENT",
    capabilities: ["CODE_GENERATION", "TEST_EXECUTION", "DOCUMENTATION"],
    version: input.version,
    trust_level: "CERTIFIED",
    execution_method: "CONTROLLED_DELEGATE",
    evidence_contract: [
      "COMMAND_INVENTORY",
      "FILE_CHANGE_INVENTORY",
      "VALIDATION_RESULTS",
      "EXECUTION_TIMESTAMPS",
    ],
  };
}

export function registerCodexProvider(input: {
  readonly registry: ExecutionProviderRegistry;
  readonly provider_id: string;
  readonly version: string;
  readonly delegate: CodexTaskDelegate;
}): ExecutionProviderRegistry {
  const contract = createCodexProviderContract(input);
  return input.registry.register(
    contract,
    new CodexExecutionAdapter(input.delegate)
  );
}
