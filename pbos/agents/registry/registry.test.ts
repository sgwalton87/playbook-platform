import { describe, expect, it } from "vitest";
import { AgentPermissionPolicy } from "../permissions";
import { createDefaultAgentRegistry } from "./registry";

describe("execution agent registry", () => {
  it("registers all supported governed agent types", () => {
    const snapshot = createDefaultAgentRegistry("2026-07-30T00:00:00.000Z").snapshot();
    expect(snapshot.agents).toHaveLength(6);
    expect(new Set(snapshot.agents.map(({ type }) => type)).size).toBe(6);
  });

  it("rejects forbidden authority capabilities", () => {
    const agent = createDefaultAgentRegistry("2026-07-30T00:00:00.000Z")
      .get("PBOS-CODEX-CODE-001");
    expect(agent).not.toBeNull();
    const result = new AgentPermissionPolicy().evaluate(agent!, [
      "APPROVE_EXECUTION",
    ]);
    expect(result.admitted).toBe(false);
  });
});
