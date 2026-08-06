import { describe, expect, it } from "vitest";
import { AcademicTranscriptJourneyService, validateTranscriptInput } from "../../../lib/pbos/academic-transcript-journey";

describe("authenticated transcript-to-readiness journey", () => {
  it("persists owner-scoped evidence and PBOS provenance", async () => {
    const calls: string[] = [];
    const service = new AcademicTranscriptJourneyService({ saveEvidence: async input => { calls.push(input.ownerId); return { evidenceId: "evidence-1" }; },
      completeEvidence: async input => { calls.push("complete:" + input.evidenceId); } }, {
      registerIdentity: async userId => ({ mappingId: "mapping", externalIdentity: { externalIdentityId: userId,
        externalSystemId: "PLAYBOOK-SYSTEM-001", role: "SCHOLAR", authorityReferences: [], active: true },
        pbosIdentity: { actorId: "PLAYBOOK-ACTOR-" + userId, systemId: "PLAYBOOK-OS-001", role: "SCHOLAR",
          authorityContext: [], provenance: "identity:" + userId, active: true }, mappedAt: new Date() }),
      publish: async () => ["pbos:academic"]
    });
    const result = await service.complete({ actorId: "scholar-1", ownerId: "scholar-1", approvalId: "approval-1",
      readinessScore: 82, agUpdates: 7, idempotencyKey: "transcript-1" });
    expect(calls).toEqual(["scholar-1", "complete:evidence-1"]);
    expect(result.provenance).toEqual(expect.arrayContaining(["approval-1", "pbos:academic"]));
  });

  it("rejects cross-owner access and unsafe transcript input", async () => {
    const service = new AcademicTranscriptJourneyService({ saveEvidence: async () => { throw new Error("must not save"); }, completeEvidence: async () => undefined },
      { registerIdentity: async () => { throw new Error("must not register"); }, publish: async () => [] });
    await expect(service.complete({ actorId: "one", ownerId: "two", approvalId: "approval", readinessScore: 50,
      agUpdates: 7, idempotencyKey: "key" })).rejects.toThrow("Access denied");
    expect(() => validateTranscriptInput("data", "text/plain")).toThrow("not supported");
    expect(() => validateTranscriptInput("", "application/pdf")).toThrow("required");
  });
});
