import { describe, expect, it, vi } from "vitest";
import { ExecutionProviderRegistry, registerCodexProvider } from "./index";

describe("execution provider registry", () => {
  it("registers a certified replaceable Codex provider", () => {
    const delegate = vi.fn();
    const registry = registerCodexProvider({
      registry: new ExecutionProviderRegistry(),
      provider_id: "PBOS-CODEX-CODE-001",
      version: "1.0.0",
      delegate,
    });
    expect(registry.get("PBOS-CODEX-CODE-001")?.contract).toEqual(
      expect.objectContaining({
        provider_type: "CODE_AGENT",
        trust_level: "CERTIFIED",
        execution_method: "CONTROLLED_DELEGATE",
      })
    );
  });

  it("rejects duplicate or uncertified providers", () => {
    const registry = new ExecutionProviderRegistry();
    const adapter = { execute: vi.fn() };
    registry.register({
      provider_contract_id: "PROVIDER-CONTRACT-001",
      provider_id: "PROVIDER-001",
      executable_agent_id: "PBOS-CODEX-TEST-001",
      provider_type: "TEST_AGENT",
      capabilities: ["TEST_EXECUTION"],
      version: "1.0.0",
      trust_level: "CERTIFIED",
      execution_method: "CONTROLLED_DELEGATE",
      evidence_contract: ["VALIDATION_RESULTS"],
    }, adapter);
    expect(() => registry.register({
      provider_contract_id: "PROVIDER-CONTRACT-001",
      provider_id: "PROVIDER-001",
      executable_agent_id: "PBOS-CODEX-TEST-001",
      provider_type: "TEST_AGENT",
      capabilities: ["TEST_EXECUTION"],
      version: "1.0.0",
      trust_level: "CERTIFIED",
      execution_method: "CONTROLLED_DELEGATE",
      evidence_contract: ["VALIDATION_RESULTS"],
    }, adapter)).toThrow("registration rejected");
  });
});
