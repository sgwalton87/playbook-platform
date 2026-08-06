import { describe, expect, it } from "vitest";
import { ScholarOnboardingService } from "../../../lib/pbos/scholar-onboarding-service";

describe("governed Scholar onboarding-to-dashboard", () => {
  it("persists an idempotent journey with PBOS provenance", async () => {
    const calls: string[] = [];
    const service = new ScholarOnboardingService({
      persistOnboarding: async input => { calls.push("persist:" + input.idempotencyKey); return { scholarRecordId: input.scholarId, goalId: "goal-1" }; },
      persistDashboard: async input => { calls.push("dashboard:" + input.exchangeApprovalId); }
    }, {
      registerIdentity: async userId => ({ mappingId: "mapping-1", externalIdentity: { externalIdentityId: userId, externalSystemId: "PLAYBOOK-SYSTEM-001", role: "SCHOLAR", authorityReferences: [], active: true }, pbosIdentity: { actorId: "PLAYBOOK-ACTOR-" + userId, systemId: "PLAYBOOK-OS-001", role: "SCHOLAR", authorityContext: [], provenance: "identity:" + userId, active: true }, mappedAt: new Date() }),
      verifyReady: async () => ["pbos:health"], publishOnboarding: async () => ["pbos:onboarding"], projectDashboard: async () => ["pbos:dashboard"]
    });
    const result = await service.complete({ actorId: "scholar-1", ownerId: "scholar-1", displayName: "Scholar One",
      goalTitle: "Graduate", identityApprovalId: "identity-approval", exchangeApprovalId: "exchange-approval", idempotencyKey: "journey-1" });
    expect(calls).toEqual(["persist:journey-1", "dashboard:exchange-approval"]);
    expect(result.sectionIds).toEqual(["identity", "goals"]);
    expect(result.provenance).toEqual(expect.arrayContaining(["identity-approval", "pbos:health", "pbos:onboarding", "pbos:dashboard", "exchange-approval"]));
  });

  it("fails closed before persistence for cross-owner access or missing exchange approval", async () => {
    const repository = { persistOnboarding: async () => { throw new Error("must not persist"); }, persistDashboard: async () => undefined };
    const runtime = { registerIdentity: async () => { throw new Error("must not register"); }, verifyReady: async () => [], publishOnboarding: async () => [], projectDashboard: async () => [] };
    const service = new ScholarOnboardingService(repository, runtime);
    await expect(service.complete({ actorId: "one", ownerId: "two", displayName: "One", goalTitle: "Graduate",
      identityApprovalId: "approval", exchangeApprovalId: "exchange", idempotencyKey: "key" })).rejects.toThrow("Access denied");
    await expect(service.complete({ actorId: "one", ownerId: "one", displayName: "One", goalTitle: "Graduate",
      identityApprovalId: "approval", exchangeApprovalId: "", idempotencyKey: "key" })).rejects.toThrow("exchange approval");
  });
});
