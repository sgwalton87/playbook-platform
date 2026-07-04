import { describe, expect, it } from "vitest";
import {
  buildSecureShareId,
  canAccessSecureShare,
  generateShareToken,
  isShareExpired,
} from "@/lib/secure-sharing";

describe("Secure Sharing", () => {
  it("generates share token", () => {
    expect(generateShareToken().length).toBeGreaterThan(20);
  });

  it("builds secure share id", () => {
    expect(buildSecureShareId({ scholarId: "s1", purpose: "portfolio" })).toContain("portfolio-s1");
  });

  it("checks expiration", () => {
    expect(isShareExpired("2000-01-01")).toBe(true);
  });

  it("checks access", () => {
    expect(canAccessSecureShare({ status: "active" })).toBe(true);
    expect(canAccessSecureShare({ status: "revoked" })).toBe(false);
  });
});
