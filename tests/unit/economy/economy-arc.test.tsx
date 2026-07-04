import { describe, expect, it } from "vitest";
import {
  buildRewardIdempotencyKey,
  buildRewardPolicyDecision,
  shouldRewardMessage,
  buildLedgerReversal,
} from "@/lib/economy-integrity";
import {
  getRoleTour,
  getTourProgress,
  getContextualHelp,
} from "@/lib/guided-experience";
import {
  buildRedemptionTransaction,
  buildStoreProduct,
  updateFulfillmentStatus,
} from "@/lib/store-economy";
import {
  buildBrandPartner,
  buildNILStoreCampaign,
  evaluateCampaignReadiness,
} from "@/lib/brand-partners";
import EconomyCommandCenter from "@/components/economy/EconomyCommandCenter";

describe("Beta 3.4 Economy Arc", () => {
  it("handles reward idempotency", () => {
    const key = buildRewardIdempotencyKey({
      scholarId: "s1",
      eventType: "course.completed",
      sourceId: "c1",
    });

    expect(key).toBe("s1:course.completed:c1");

    expect(
      buildRewardPolicyDecision({
        scholarId: "s1",
        eventType: "course.completed",
        sourceId: "c1",
        alreadyProcessedKeys: [key],
      }).allowed
    ).toBe(false);
  });

  it("limits message reward farming", () => {
    expect(shouldRewardMessage({ messageCountToday: 4 })).toBe(false);
    expect(shouldRewardMessage({ messageCountToday: 4, hasActionContext: true })).toBe(true);
  });

  it("builds ledger reversal", () => {
    expect(buildLedgerReversal({
      originalLedgerId: "l1",
      scholarId: "s1",
      coins: 100,
      xp: 20,
      reason: "Correction",
    }).coins).toBe(-100);
  });

  it("builds guided tours", () => {
    expect(getRoleTour("scholar_athlete").length).toBeGreaterThan(0);
    expect(getTourProgress({ role: "scholar", completedStepIds: ["dashboard"] })).toBeGreaterThan(0);
    expect(getContextualHelp("/store-v2")).toContain("coins");
  });

  it("handles store redemption and fulfillment", () => {
    const product = buildStoreProduct({
      id: "p1",
      name: "Training Kit",
      category: "athletic_training",
      coinPrice: 500,
      inventory: 10,
    });

    expect(product.active).toBe(true);
    expect(buildRedemptionTransaction({
      scholarId: "s1",
      productId: "p1",
      coinPrice: 500,
      currentBalance: 600,
    }).ok).toBe(true);
    expect(updateFulfillmentStatus({ redemptionId: "r1", status: "shipped" }).status).toBe("shipped");
  });

  it("handles brand partner NIL campaigns", () => {
    const partner = buildBrandPartner({
      id: "b1",
      name: "Brand",
      category: "athletics",
    });

    const campaign = buildNILStoreCampaign({
      id: "c1",
      partnerId: partner.id,
      storeProductId: "p1",
      athleteId: "a1",
      deliverables: ["Post"],
    });

    expect(campaign.disclosureRequired).toBe(true);
    expect(evaluateCampaignReadiness({
      status: "approved",
      deliverables: ["Post"],
      disclosureApproved: true,
      athleteApproved: true,
    }).ready).toBe(true);
  });

  it("component is defined", () => {
    expect(EconomyCommandCenter).toBeTruthy();
  });
});
