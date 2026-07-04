import { describe, expect, it } from "vitest";
import {
  buildAthleteNextActions,
  buildEligibilityScenario,
  evaluateEligibilityReadiness,
  evaluateNILDealReadiness,
  getRecruitingPipelineSummary,
  summarizeAthleteFinances,
} from "@/lib/scholar-athlete";
import ScholarAthleteDashboard from "@/components/scholar-athlete/ScholarAthleteDashboard";

describe("Scholar-Athlete OS", () => {
  it("evaluates eligibility readiness", () => {
    const result = evaluateEligibilityReadiness({
      governingBody: "NCAA",
      division: "D1",
      version: "test",
      effectiveDate: "2026-01-01",
      sourceUrl: "official-source",
      requirements: [
        {
          id: "academic-1",
          label: "Academic evidence",
          required: true,
          completed: true,
          evidenceVerified: true,
        },
      ],
    });

    expect(result.status).toBe("ready");
  });

  it("builds eligibility scenario", () => {
    expect(
      buildEligibilityScenario({
        currentReadiness: 70,
        actions: [{ label: "Verify evidence", impact: 20 }],
      }).projected
    ).toBe(90);
  });

  it("summarizes recruiting pipeline", () => {
    const result = getRecruitingPipelineSummary([
      {
        id: "1",
        schoolName: "College A",
        stage: "offer",
      },
    ]);

    expect(result.offers).toBe(1);
  });

  it("flags NIL readiness issue", () => {
    const result = evaluateNILDealReadiness({
      id: "deal-1",
      brandName: "Brand",
      opportunityTitle: "Campaign",
      stage: "active",
      deliverables: [],
      contractStatus: "received",
      disclosureStatus: "not_started",
      paymentStatus: "not_due",
    });

    expect(result.ready).toBe(false);
  });

  it("summarizes athlete finances", () => {
    const result = summarizeAthleteFinances([
      {
        id: "1",
        type: "income",
        amount: 1000,
        category: "NIL",
      },
      {
        id: "2",
        type: "saving",
        amount: 200,
        category: "Goals",
      },
    ]);

    expect(result.availableAfterTrackedAllocations).toBe(800);
  });

  it("creates Athlete Compass actions", () => {
    const actions = buildAthleteNextActions({
      eligibilityStatus: "action_needed",
      recruitingTargets: 0,
      activeDeals: 1,
      financialPlanComplete: false,
    });

    expect(actions.length).toBe(3);
  });

  it("component is defined", () => {
    expect(ScholarAthleteDashboard).toBeTruthy();
  });
});
