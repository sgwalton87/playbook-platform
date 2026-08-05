import { describe, expect, it } from "vitest";
import { authorizePlaybookFoundation } from "../../../lib/pbos/foundation";

describe("CIP-048 Playbook web foundation", () => {
  it("maps identity and returns governed data and design boundaries", () => {
    const result = authorizePlaybookFoundation({ userId: "scholar-1", ownerId: "scholar-1", role: "SCHOLAR", approvalId: "approval-1" });
    expect(result.identity.pbosIdentity.actorId).toBe("PLAYBOOK-ACTOR-scholar-1");
    expect(result.dataBoundary.policy).toBe("OWNER_SCOPED_RLS");
    expect(result.designTokens.colors.primary).toBeTruthy();
    expect(result.provenance).toContain("approval-1");
  });

  it("fails closed for cross-owner access or missing approval", () => {
    expect(() => authorizePlaybookFoundation({ userId: "scholar-1", ownerId: "scholar-2", role: "SCHOLAR", approvalId: "approval-1" })).toThrow("Access denied");
    expect(() => authorizePlaybookFoundation({ userId: "scholar-1", ownerId: "scholar-1", role: "SCHOLAR" })).toThrow("approval");
  });
});
