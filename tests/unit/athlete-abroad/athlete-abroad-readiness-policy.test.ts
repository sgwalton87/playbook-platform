import { describe, expect, it } from "vitest";
import { buildAthleteAbroadEvidence, globalCapabilityReady } from "@/lib/athlete-abroad-verification/policy";

describe("Athlete Abroad readiness policy", () => {
  it("requires destination, passport, and eligibility context", () => {
    expect(() => buildAthleteAbroadEvidence({ destination_regions: ["Europe"] })).toThrow();
    expect(buildAthleteAbroadEvidence({
      destination_regions: ["Europe"],
      passport_readiness: "In progress",
      eligibility_context: "Club and federation review",
      international_support_needs: ["Visa guidance", "Housing"],
    }).supportNeeds).toEqual(["Visa guidance", "Housing"]);
  });

  it("requires self-owned identity, reviewed readiness, and approved jurisdiction scope", () => {
    expect(globalCapabilityReady({ identityOwned: true, readinessReviewed: true, jurisdictionScopeApproved: false })).toBe(false);
    expect(globalCapabilityReady({ identityOwned: true, readinessReviewed: false, jurisdictionScopeApproved: true })).toBe(false);
    expect(globalCapabilityReady({ identityOwned: true, readinessReviewed: true, jurisdictionScopeApproved: true })).toBe(true);
  });
});
