import { describe, expect, it } from "vitest";
import { buildExplainableOpportunityMatches, OpportunityJourneyService } from "../../../lib/pbos/opportunity-journey-service";

const identity = { mappingId: "mapping", externalIdentity: { externalIdentityId: "scholar-1",
  externalSystemId: "PLAYBOOK-SYSTEM-001" as const, role: "SCHOLAR" as const, authorityReferences: [], active: true },
  pbosIdentity: { actorId: "PLAYBOOK-ACTOR-scholar-1", systemId: "PLAYBOOK-OS-001" as const,
    role: "SCHOLAR" as const, authorityContext: [], provenance: "identity:scholar-1", active: true }, mappedAt: new Date() };

describe("owner-scoped opportunity journey", () => {
  it("persists only explainable matches and PBOS delivery provenance", async () => {
    const calls: string[] = [];
    const service = new OpportunityJourneyService({
      persistMatches: async input => { calls.push("persist:" + input.ownerId); return input.matches.map((match, index) => ({ ...match,
        id: "match-" + index, status: "RECOMMENDED" as const, deliveryState: "PENDING" as const, provenance: input.provenance })); },
      completeMatchDelivery: async input => { calls.push("complete:" + input.matchIds.length); },
      stageDecision: async () => { throw new Error("not used"); }, completeDecision: async () => { throw new Error("not used"); }
    }, { registerIdentity: async () => identity, publish: async () => ["pbos:opportunity"] });
    const result = await service.discover({ actorId: "scholar-1", ownerId: "scholar-1", approvalId: "approval-1",
      signals: { skills: ["scientific thinking", "research"], majors: ["Biology"], careers: [], opportunities: [] } });
    expect(result.matches.length).toBeGreaterThan(0);
    expect(result.matches.every(match => match.reasons.length > 0 && match.deliveryState === "DELIVERED")).toBe(true);
    expect(result.provenance).toEqual(expect.arrayContaining(["approval-1", "pbos:opportunity"]));
    expect(calls).toEqual(["persist:scholar-1", "complete:" + result.matches.length]);
  });

  it("durably stages and commits save or dismiss after PBOS accepts it", async () => {
    const calls: string[] = [];
    const durable = { id: "match-1", opportunityId: "stem", title: "STEM", type: "scholarship", description: "Path",
      score: 90, reasons: ["Skill match: research"], nextSteps: ["Apply"], status: "RECOMMENDED" as const,
      deliveryState: "PENDING" as const, provenance: [] };
    const service = new OpportunityJourneyService({ persistMatches: async () => [], completeMatchDelivery: async () => undefined,
      stageDecision: async input => { calls.push("stage:" + input.ownerId + ":" + input.decision); return durable; },
      completeDecision: async input => { calls.push("complete:" + input.decision); return { ...durable,
        status: input.decision, deliveryState: "DELIVERED" as const, provenance: input.provenance }; }
    }, { registerIdentity: async () => identity, publish: async () => ["pbos:decision"] });
    const result = await service.decide({ actorId: "scholar-1", ownerId: "scholar-1", approvalId: "approval-1",
      matchId: "match-1", decision: "SAVED", requestId: "decision-1" });
    expect(result.status).toBe("SAVED");
    expect(result.provenance).toContain("pbos:decision");
    expect(calls).toEqual(["stage:scholar-1:SAVED", "complete:SAVED"]);
  });

  it("fails closed for cross-owner access and does not invent unexplained matches", async () => {
    expect(buildExplainableOpportunityMatches({ skills: [], majors: [], careers: [], opportunities: [] })).toEqual([]);
    const service = new OpportunityJourneyService({ persistMatches: async () => { throw new Error("must not persist"); },
      completeMatchDelivery: async () => undefined, stageDecision: async () => { throw new Error("must not stage"); },
      completeDecision: async () => { throw new Error("must not commit"); } },
      { registerIdentity: async () => { throw new Error("must not register"); }, publish: async () => [] });
    await expect(service.discover({ actorId: "one", ownerId: "two", approvalId: "approval",
      signals: { skills: ["research"], majors: [], careers: [], opportunities: [] } })).rejects.toThrow("Access denied");
  });
});
