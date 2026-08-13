import { describe, expect, it } from "vitest";
import {
  parseInvitationAcceptPayload,
  parseInvitationSendPayload,
} from "@/lib/api/contracts/invitations";
import { parseStoreRedemptionPayload } from "@/lib/api/contracts/store";

describe("API contract parsers", () => {
  it("accepts a valid invitation send payload", () => {
    const result = parseInvitationSendPayload({
      scholarName: "Maya",
      inviteeName: "Coach Taylor",
      inviteeEmail: "coach@example.com",
      relationship: "mentor",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.inviteeEmail).toBe("coach@example.com");
      expect(result.value.relationship).toBe("mentor");
    }
  });

  it("rejects invitation send when relationship is unsupported", () => {
    const result = parseInvitationSendPayload({
      inviteeEmail: "coach@example.com",
      relationship: "alien",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("relationship");
    }
  });

  it("defaults invitation acceptance status when omitted", () => {
    const result = parseInvitationAcceptPayload({
      token: "abc123",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("accepted");
    }
  });

  it("accepts a valid redemption payload", () => {
    const result = parseStoreRedemptionPayload({
      scholarId: "scholar-1",
      productId: "reward-1",
      coinPrice: 250,
      shippingPayload: { carrier: "UPS", tracking: false },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.coinPrice).toBe(250);
      expect(result.value.shippingPayload?.carrier).toBe("UPS");
    }
  });

  it("rejects redemption payload with non-positive coin price", () => {
    const result = parseStoreRedemptionPayload({
      productId: "reward-1",
      coinPrice: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toContain("coinPrice");
    }
  });
});
