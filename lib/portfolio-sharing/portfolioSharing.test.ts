import { describe, expect, it, vi } from "vitest";
import { canViewPortfolioShare } from "./portfolioSharing";

describe("portfolio sharing lifecycle", () => {
  it("allows only active non-expired shares", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-16T20:00:00-07:00"));

    expect(canViewPortfolioShare({ status: "active" })).toBe(true);
    expect(canViewPortfolioShare({ status: "active", expiresAt: "2026-08-17T04:00:00Z" })).toBe(true);
    expect(canViewPortfolioShare({ status: "active", expiresAt: "2026-08-17T02:00:00Z" })).toBe(false);
    expect(canViewPortfolioShare({ status: "revoked" })).toBe(false);
    expect(canViewPortfolioShare({ status: "draft" })).toBe(false);

    vi.useRealTimers();
  });

  it("fails closed for malformed expiry values", () => {
    expect(canViewPortfolioShare({ status: "active", expiresAt: "not-a-date" })).toBe(false);
  });
});
