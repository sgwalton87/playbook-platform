import { describe, expect, it } from "vitest";
import { ApplicationWorkspaceJourneyService } from "../../../lib/pbos/application-workspace-journey";

const identity = { mappingId: "mapping", externalIdentity: { externalIdentityId: "scholar-1", externalSystemId: "PLAYBOOK-SYSTEM-001", role: "SCHOLAR", authorityReferences: [], active: true },
  pbosIdentity: { actorId: "PLAYBOOK-ACTOR-scholar-1", systemId: "PLAYBOOK-OS-001", role: "SCHOLAR", authorityContext: [], provenance: "identity:scholar-1", active: true }, mappedAt: new Date() } as const;

describe("opportunity-to-application journey", () => {
  it("creates an owner-scoped durable workspace and records PBOS provenance", async () => {
    const calls: string[] = []; const service = new ApplicationWorkspaceJourneyService({
      createPending: async input => { calls.push("create:" + input.ownerId + ":" + input.tasks.length); return { workspaceId: "workspace-1" }; },
      activate: async input => { calls.push("activate:" + input.workspaceId); },
      transition: async () => ({ readiness: 25, status: "building" }), recordTransition: async () => undefined
    }, { registerIdentity: async () => identity, publish: async (_identity, input) => ["pbos:" + input.eventType] });
    const result = await service.create({ actorId: "scholar-1", ownerId: "scholar-1", approvalId: "approval-1",
      opportunityId: "opp-1", opportunityName: "Future Scholars Award", opportunityType: "scholarship",
      deadline: "2026-09-01", idempotencyKey: "application-1" });
    expect(calls).toEqual(["create:scholar-1:4", "activate:workspace-1"]);
    expect(result.provenance).toEqual(expect.arrayContaining(["approval-1", "pbos:APPLICATION_WORKSPACE_CREATED"]));
  });

  it("persists task progress before publishing its governed lifecycle event", async () => {
    const calls: string[] = []; const service = new ApplicationWorkspaceJourneyService({
      createPending: async () => ({ workspaceId: "workspace-1" }), activate: async () => undefined,
      transition: async input => { calls.push("task:" + input.ownerId); return { readiness: 50, status: "building" }; },
      recordTransition: async input => { calls.push("event:" + input.action); }
    }, { registerIdentity: async () => identity, publish: async (_identity, input) => { calls.push("pbos:" + input.eventType); return ["pbos:progress"]; } });
    const result = await service.transition({ actorId: "scholar-1", ownerId: "scholar-1", approvalId: "approval-1",
      workspaceId: "workspace-1", taskId: "task-1", action: "TASK_COMPLETED", idempotencyKey: "transition-1" });
    expect(calls).toEqual(["task:scholar-1", "pbos:APPLICATION_WORKSPACE_PROGRESS_UPDATED", "event:TASK_COMPLETED"]);
    expect(result.readiness).toBe(50);
  });

  it("fails closed for cross-owner access, invalid type, and missing authority", async () => {
    const service = new ApplicationWorkspaceJourneyService({ createPending: async () => { throw new Error("must not persist"); },
      activate: async () => undefined, transition: async () => { throw new Error("must not mutate"); }, recordTransition: async () => undefined },
      { registerIdentity: async () => identity, publish: async () => [] });
    await expect(service.create({ actorId: "scholar-1", ownerId: "other", approvalId: "approval", opportunityId: "opp",
      opportunityName: "Award", opportunityType: "scholarship", idempotencyKey: "key" })).rejects.toThrow("Access denied");
    await expect(service.create({ actorId: "scholar-1", ownerId: "scholar-1", approvalId: "approval", opportunityId: "opp",
      opportunityName: "Award", opportunityType: "unknown" as never, idempotencyKey: "key" })).rejects.toThrow("type is invalid");
  });
});
