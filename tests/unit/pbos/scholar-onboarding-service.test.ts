import { describe, expect, it } from "vitest";
import { ScholarOnboardingService } from "../../../lib/pbos/scholar-onboarding-service";

function identity(userId: string, role: "SCHOLAR" | "SCHOLAR_ATHLETE" | "TRANSITION_YOUTH") {
  return {
    mappingId: "mapping-1",
    externalIdentity: { externalIdentityId: userId, externalSystemId: "PLAYBOOK-SYSTEM-001" as const, role, authorityReferences: [], active: true },
    pbosIdentity: { actorId: "PLAYBOOK-ACTOR-" + userId, systemId: "PLAYBOOK-OS-001" as const, role, authorityContext: [], provenance: "identity:" + userId, active: true },
    mappedAt: new Date(),
  };
}

describe("governed Scholar onboarding-to-dashboard", () => {
  it("persists an idempotent Scholar journey with PBOS provenance", async () => {
    const calls: string[] = [];
    const service = new ScholarOnboardingService({
      persistOnboarding: async input => { calls.push("persist:" + input.idempotencyKey + ":" + input.role); return { scholarRecordId: input.scholarId, goalId: "goal-1" }; },
      persistDashboard: async input => { calls.push("dashboard:" + input.exchangeApprovalId); }
    }, {
      registerIdentity: async userId => identity(userId, "SCHOLAR"),
      verifyReady: async () => ["pbos:health"], publishOnboarding: async () => ["pbos:onboarding"], projectDashboard: async () => ["pbos:dashboard"]
    });
    const result = await service.complete({ actorId: "scholar-1", ownerId: "scholar-1", displayName: "Scholar One",
      goalTitle: "Graduate", identityApprovalId: "identity-approval", exchangeApprovalId: "exchange-approval", idempotencyKey: "journey-1" });
    expect(calls).toEqual(["persist:journey-1:SCHOLAR", "dashboard:exchange-approval"]);
    expect(result.role).toBe("SCHOLAR");
    expect(result.sectionIds).toEqual(["identity", "goals"]);
    expect(result.provenance).toEqual(expect.arrayContaining(["identity-approval", "pbos:health", "pbos:onboarding", "pbos:dashboard", "exchange-approval"]));
  });

  it("extends the canonical Scholar Record for Scholar-Athletes without changing ownership", async () => {
    const persisted: Array<{ role: string; sections?: readonly string[] }> = [];
    const service = new ScholarOnboardingService({
      persistOnboarding: async input => { persisted.push({ role: input.role }); return { scholarRecordId: input.scholarId, goalId: "goal-athlete" }; },
      persistDashboard: async input => { persisted.push({ role: input.role, sections: input.sectionIds }); }
    }, {
      registerIdentity: async userId => identity(userId, "SCHOLAR_ATHLETE"),
      verifyReady: async () => ["pbos:health"], publishOnboarding: async () => ["pbos:onboarding"], projectDashboard: async () => ["pbos:dashboard"]
    });
    const result = await service.complete({ actorId: "athlete-1", ownerId: "athlete-1", displayName: "Athlete One",
      goalTitle: "Compete in college", role: "SCHOLAR_ATHLETE", identityApprovalId: "athlete-identity-approval",
      exchangeApprovalId: "athlete-exchange-approval", idempotencyKey: "athlete-journey-1" });
    expect(result.role).toBe("SCHOLAR_ATHLETE");
    expect(result.scholarRecordId).toBe("athlete-1");
    expect(result.sectionIds).toEqual(["identity", "goals", "athletics"]);
    expect(persisted).toEqual([
      { role: "SCHOLAR_ATHLETE" },
      { role: "SCHOLAR_ATHLETE", sections: ["identity", "goals", "athletics"] },
    ]);
  });

  it("keeps Transition-Aged Youth on the canonical Scholar Record with support projection", async () => {
    const persisted: Array<{ role: string; sections?: readonly string[] }> = [];
    const service = new ScholarOnboardingService({
      persistOnboarding: async input => { persisted.push({ role: input.role }); return { scholarRecordId: input.scholarId, goalId: "goal-tay" }; },
      persistDashboard: async input => { persisted.push({ role: input.role, sections: input.sectionIds }); }
    }, {
      registerIdentity: async userId => identity(userId, "TRANSITION_YOUTH"),
      verifyReady: async () => ["pbos:health"], publishOnboarding: async () => ["pbos:onboarding"], projectDashboard: async () => ["pbos:dashboard"]
    });
    const result = await service.complete({ actorId: "tay-1", ownerId: "tay-1", displayName: "TAY One",
      goalTitle: "Build my next-step plan", role: "TRANSITION_YOUTH", identityApprovalId: "tay-identity-approval",
      exchangeApprovalId: "tay-exchange-approval", idempotencyKey: "tay-journey-1" });
    expect(result.role).toBe("TRANSITION_YOUTH");
    expect(result.scholarRecordId).toBe("tay-1");
    expect(result.sectionIds).toEqual(["identity", "goals", "support"]);
    expect(persisted).toEqual([
      { role: "TRANSITION_YOUTH" },
      { role: "TRANSITION_YOUTH", sections: ["identity", "goals", "support"] },
    ]);
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

  it("rejects a PBOS identity whose role does not match the governed journey", async () => {
    let persisted = false;
    const service = new ScholarOnboardingService({
      persistOnboarding: async input => { persisted = true; return { scholarRecordId: input.scholarId, goalId: "goal" }; },
      persistDashboard: async () => undefined,
    }, {
      registerIdentity: async userId => identity(userId, "SCHOLAR"),
      verifyReady: async () => ["must-not-run"], publishOnboarding: async () => ["must-not-run"], projectDashboard: async () => ["must-not-run"],
    });
    await expect(service.complete({ actorId: "athlete-1", ownerId: "athlete-1", displayName: "Athlete One",
      goalTitle: "Compete", role: "SCHOLAR_ATHLETE", identityApprovalId: "approval", exchangeApprovalId: "exchange",
      idempotencyKey: "athlete-key" })).rejects.toThrow("identity role does not match");
    expect(persisted).toBe(false);
  });
});
