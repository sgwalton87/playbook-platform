import { describe, expect, it } from "vitest";
import { buildRedemption, canRedeem, connectNILPromotion, getStoreItems } from "@/lib/store-v2";
import StoreV2 from "@/components/store-v2/StoreV2";

describe("Store v2", () => {
  it("returns store items", () => {
    expect(getStoreItems().length).toBeGreaterThan(0);
  });

  it("checks redemption", () => {
    expect(canRedeem({ balance: 500, coinPrice: 300, inventory: 1 })).toBe(true);
  });

  it("builds redemption", () => {
    expect(buildRedemption({ scholarId: "s1", itemId: "i1", coinPrice: 100 }).status).toBe("pending_fulfillment");
  });

  it("connects NIL promotion", () => {
    expect(connectNILPromotion({ athleteId: "a1", brandPartner: "Brand", storeItemId: "item" }).status).toContain("campaign");
  });

  it("component is defined", () => {
    expect(StoreV2).toBeTruthy();
  });
});
