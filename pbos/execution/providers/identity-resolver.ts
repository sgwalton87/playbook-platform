import type { AgentRecord, AgentRegistry } from "../../agents/registry";
import { artifactDigest } from "../../kernel/identity";
import type {
  ExecutionIdentityResolution,
  ProviderContract,
} from "./types";

export function resolveExecutionIdentity(input: {
  readonly provider: ProviderContract | null;
  readonly agents: AgentRegistry;
  readonly created_at: string;
}): ExecutionIdentityResolution {
  const { provider } = input;
  if (!provider || provider.trust_level !== "CERTIFIED") {
    throw new Error("Certified execution provider is required.");
  }
  const candidates = input.agents
    .snapshot()
    .agents.filter(
      (agent) =>
        agent.agent_id === provider.executable_agent_id &&
        agent.status === "REGISTERED"
    );
  if (candidates.length !== 1) {
    throw new Error(
      `Execution provider identity resolution requires exactly one agent; found ${candidates.length}.`
    );
  }
  return buildResolution(provider, candidates[0], input.created_at);
}

function buildResolution(
  provider: ProviderContract,
  agent: AgentRecord,
  createdAt: string
): ExecutionIdentityResolution {
  if (
    provider.version !== agent.version ||
    !provider.capabilities.every((capability) =>
      agent.profile.capabilities.includes(capability)
    )
  ) {
    throw new Error("Execution provider and agent contracts are incompatible.");
  }
  const body = {
    resolution_id: `EXECUTION-IDENTITY-${artifactDigest({
      provider: provider.digest,
      agent_id: agent.agent_id,
      agent_version: agent.version,
    }).slice(0, 16)}`,
    provider_id: provider.provider_id,
    provider_contract_id: provider.provider_contract_id,
    agent_id: agent.agent_id,
    agent_version: agent.version,
    capability_set: [...provider.capabilities].sort(),
    certification_status: "CERTIFIED" as const,
    evidence_contract: [...provider.evidence_contract].sort(),
    created_at: createdAt,
  };
  return { ...body, digest: artifactDigest(body) };
}
