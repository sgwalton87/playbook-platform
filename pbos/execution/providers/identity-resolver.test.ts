import { describe, expect, it } from "vitest";
import { AgentRegistry, createDefaultAgentRegistry } from "../../agents/registry";
import { artifactDigest } from "../../kernel/identity";
import { createCodexProviderContract } from "./codex";
import { resolveExecutionIdentity } from "./identity-resolver";
import type { ProviderContract } from "./types";

const timestamp = "2026-07-31T00:00:00.000Z";

function provider(
  overrides: Partial<ProviderContract> = {}
): ProviderContract {
  const body = {
    ...createCodexProviderContract({
      provider_id: "PBOS-CODEX-CODE-001",
      version: "1.0.0",
    }),
    ...overrides,
  };
  return { ...body, digest: artifactDigest(body) };
}

describe("execution provider identity resolution", () => {
  it("resolves exactly one certified provider agent", () => {
    const result = resolveExecutionIdentity({
      provider: provider(),
      agents: createDefaultAgentRegistry(timestamp),
      created_at: timestamp,
    });
    expect(result.agent_id).toBe("PBOS-CODEX-CODE-001");
    expect(result.certification_status).toBe("CERTIFIED");
  });

  it("rejects an unknown provider agent", () => {
    expect(() =>
      resolveExecutionIdentity({
        provider: provider({ executable_agent_id: "UNKNOWN-AGENT" }),
        agents: createDefaultAgentRegistry(timestamp),
        created_at: timestamp,
      })
    ).toThrow("exactly one agent; found 0");
  });

  it("rejects an uncertified provider", () => {
    const uncertified = {
      ...provider(),
      trust_level: "UNVERIFIED",
    } as unknown as ProviderContract;
    expect(() =>
      resolveExecutionIdentity({
        provider: uncertified,
        agents: createDefaultAgentRegistry(timestamp),
        created_at: timestamp,
      })
    ).toThrow("Certified execution provider is required");
  });

  it("rejects a provider when no executable identity is registered", () => {
    expect(() =>
      resolveExecutionIdentity({
        provider: provider(),
        agents: new AgentRegistry(),
        created_at: timestamp,
      })
    ).toThrow("exactly one agent; found 0");
  });
});
