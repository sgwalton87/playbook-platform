import { describe, expect, it } from "vitest";
import { authorizeMessagingRelationship, messagingAction, normalizeGovernedMessage, supporterRoleForRelationship } from "@/lib/pbos/governed-messaging";
describe("governed messaging", () => {
  const relationship = { id: "rel-1", scholarId: "scholar-1", supporterId: "mentor-1", supporterEmail: "mentor@example.com",
    relationship: "coach", status: "active", permissions: ["support_tasks"] };
  it("allows only the Scholar or active permission-bearing supporter", () => {
    expect(authorizeMessagingRelationship({ actorId: "scholar-1", relationship, approvalId: "approval" }).role).toBe("scholar");
    expect(authorizeMessagingRelationship({ actorId: "mentor-1", relationship, approvalId: "approval" })).toMatchObject({ role: "supporter", pbosRole: "COACH" });
    expect(() => authorizeMessagingRelationship({ actorId: "stranger", relationship, approvalId: "approval" })).toThrow("active permission-bearing");
    expect(supporterRoleForRelationship("guardian")).toBe("FAMILY");
  });
  it("normalizes content and refuses ungoverned moderation actions", () => {
    expect(normalizeGovernedMessage("  We   can help. ")).toBe("We can help.");
    expect(() => normalizeGovernedMessage(" ")).toThrow("1 to 2000");
    expect(messagingAction("REPORT")).toBe("REPORT");
    expect(() => messagingAction("DELETE")).toThrow("not governed");
  });
});
