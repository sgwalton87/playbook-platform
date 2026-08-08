import { describe, expect, it } from "vitest";
import { ApplicationSupportRequestService, authorizeSupportRelationship } from "../../../lib/pbos/application-support-request";

const relationship = { relationshipId: "relationship-1", scholarId: "scholar-1", supporterId: "mentor-1",
  supporterEmail: "mentor@example.com", status: "active", permissions: ["view_progress", "support_tasks"] };

describe("application-to-authorized-support journey", () => {
  it("persists and publishes an owner-scoped support request with provenance", async () => {
    const calls: string[] = [];
    const service = new ApplicationSupportRequestService({
      createRequest: async input => { calls.push("save:" + input.workspaceId); return { requestId: "request-1" }; },
      markDelivered: async input => { calls.push("deliver:" + input.requestId); }
    }, {
      registerIdentity: async userId => ({ mappingId: "mapping-1", externalIdentity: { externalIdentityId: userId,
        externalSystemId: "PLAYBOOK-SYSTEM-001", role: "SCHOLAR", authorityReferences: [], active: true },
        pbosIdentity: { actorId: "PLAYBOOK-ACTOR-" + userId, systemId: "PLAYBOOK-OS-001", role: "SCHOLAR",
          authorityContext: [], provenance: "identity:" + userId, active: true }, mappedAt: new Date() }),
      publishRequest: async (_identity, input) => { calls.push("publish:" + input.relationshipId); return ["pbos:support-request"]; }
    });
    const output = await service.request({ actorId: "scholar-1", scholarId: "scholar-1", workspaceId: "workspace-1",
      relationship, category: "RECOMMENDATION", summary: "Please review my recommendation request.",
      approvalId: "approval-1", idempotencyKey: "scholar-1:request-1" });
    expect(calls).toEqual(["save:workspace-1", "publish:relationship-1", "deliver:request-1"]);
    expect(output.provenance).toEqual(expect.arrayContaining(["relationship:relationship-1", "permission:support_tasks", "pbos:support-request"]));
  });

  it("rejects cross-owner, inactive, and under-authorized relationships before persistence", async () => {
    expect(() => authorizeSupportRelationship({ actorId: "other", scholarId: "scholar-1", approvalId: "approval", relationship })).toThrow("Access denied");
    expect(() => authorizeSupportRelationship({ actorId: "scholar-1", scholarId: "scholar-1", approvalId: "approval",
      relationship: { ...relationship, status: "removed" } })).toThrow("not active and authorized");
    const service = new ApplicationSupportRequestService({ createRequest: async () => { throw new Error("must not persist"); },
      markDelivered: async () => undefined }, { registerIdentity: async () => { throw new Error("must not register"); }, publishRequest: async () => [] });
    await expect(service.request({ actorId: "scholar-1", scholarId: "scholar-1", workspaceId: "workspace-1",
      relationship: { ...relationship, permissions: ["view_progress"] }, category: "OTHER", summary: "Need help",
      approvalId: "approval", idempotencyKey: "key" })).rejects.toThrow("not active and authorized");
  });
});
