import { artifactDigest } from "../../kernel/identity";
import { AGENT_TYPES, type AgentRecord, type AgentRegistrySnapshot } from "./types";

export class AgentRegistry {
  readonly #agents: readonly AgentRecord[];

  constructor(agents: readonly AgentRecord[] = []) {
    this.#agents = [...agents];
  }

  register(input: Omit<AgentRecord, "digest">): AgentRegistry {
    if (
      !input.agent_id ||
      !input.name ||
      !input.provider ||
      !input.version ||
      !AGENT_TYPES.includes(input.type) ||
      input.profile.capabilities.length === 0 ||
      input.profile.permissions.length === 0 ||
      input.status !== "REGISTERED" ||
      this.#agents.some(({ agent_id }) => agent_id === input.agent_id)
    ) {
      throw new Error("Agent registration rejected.");
    }
    return new AgentRegistry([
      ...this.#agents,
      { ...input, digest: artifactDigest(input) },
    ]);
  }

  get(agentId: string): AgentRecord | null {
    return this.#agents.find(({ agent_id }) => agent_id === agentId) ?? null;
  }

  snapshot(): AgentRegistrySnapshot {
    const agents = [...this.#agents].sort((a, b) => a.agent_id.localeCompare(b.agent_id));
    return { agents, digest: artifactDigest(agents) };
  }
}

export function createDefaultAgentRegistry(timestamp: string): AgentRegistry {
  return [
    ["PBOS-CODEX-CODE-001", "Codex Code Agent", "CODE_GENERATION_AGENT", ["CODE_GENERATION"], ["READ_APPROVED_SCOPE", "CREATE_APPROVED_FILES", "MODIFY_APPROVED_FILES", "RUN_TESTS", "RUN_VALIDATION"]],
    ["PBOS-CODEX-TEST-001", "Codex Test Agent", "TEST_EXECUTION_AGENT", ["TEST_EXECUTION"], ["READ_APPROVED_SCOPE", "RUN_TESTS", "RUN_VALIDATION"]],
    ["PBOS-CODEX-DOCS-001", "Codex Documentation Agent", "DOCUMENTATION_AGENT", ["DOCUMENTATION"], ["READ_APPROVED_SCOPE", "CREATE_APPROVED_FILES", "MODIFY_APPROVED_FILES", "RUN_VALIDATION"]],
    ["PBOS-CODEX-DESIGN-001", "Codex Design Agent", "DESIGN_GENERATION_AGENT", ["DESIGN_GENERATION"], ["READ_APPROVED_SCOPE", "CREATE_APPROVED_FILES", "MODIFY_APPROVED_FILES", "RUN_VALIDATION"]],
    ["PBOS-VALIDATOR-001", "PBOS Validation Agent", "VALIDATION_AGENT", ["VALIDATION"], ["READ_APPROVED_SCOPE", "RUN_TESTS", "RUN_VALIDATION"]],
    ["PBOS-ANALYSIS-001", "PBOS Analysis Agent", "ANALYSIS_AGENT", ["ANALYSIS"], ["READ_APPROVED_SCOPE", "RUN_VALIDATION"]],
  ].reduce(
    (registry, [agent_id, name, type, capabilities, permissions]) =>
      registry.register({
        agent_id: agent_id as string,
        name: name as string,
        provider: "PBOS",
        version: "1.0.0",
        type: type as AgentRecord["type"],
        profile: {
          capabilities: capabilities as string[],
          permissions: permissions as string[],
        },
        status: "REGISTERED",
        trust_level: "RESTRICTED",
        created_at: timestamp,
        updated_at: timestamp,
      }),
    new AgentRegistry()
  );
}
