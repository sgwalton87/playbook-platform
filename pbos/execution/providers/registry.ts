import { artifactDigest } from "../../kernel/identity";
import {
  PROVIDER_TYPES,
  type ProviderContract,
  type RegisteredExecutionProvider,
} from "./types";

export class ExecutionProviderRegistry {
  readonly #providers = new Map<string, RegisteredExecutionProvider>();

  register(
    contract: Omit<ProviderContract, "digest">,
    adapter: RegisteredExecutionProvider["adapter"]
  ): this {
    if (
      !contract.provider_id ||
      !contract.provider_contract_id ||
      !contract.executable_agent_id ||
      !PROVIDER_TYPES.includes(contract.provider_type) ||
      !contract.version ||
      contract.trust_level !== "CERTIFIED" ||
      contract.execution_method !== "CONTROLLED_DELEGATE" ||
      contract.capabilities.length === 0 ||
      contract.evidence_contract.length === 0 ||
      this.#providers.has(contract.provider_id)
    ) {
      throw new Error("Execution provider registration rejected.");
    }
    this.#providers.set(contract.provider_id, {
      contract: { ...contract, digest: artifactDigest(contract) },
      adapter,
    });
    return this;
  }

  get(providerId: string): RegisteredExecutionProvider | null {
    return this.#providers.get(providerId) ?? null;
  }

  contracts(): readonly ProviderContract[] {
    return [...this.#providers.values()]
      .map(({ contract }) => contract)
      .sort((left, right) => left.provider_id.localeCompare(right.provider_id));
  }
}
