import { describe, expect, it } from "vitest";
import { sanitizeLaunchAnalytics } from "@/lib/launch-controls";
describe("launch analytics sanitization", () => {
  it("retains only allowlisted scalar properties", () => expect(sanitizeLaunchAnalytics({ event: "portfolio.shared", properties: { sectionCount: 3, expiresInDays: 7, email: "private@example.com", nested: { secret: true } } })).toEqual({ event: "portfolio.shared", properties: { sectionCount: 3, expiresInDays: 7 } }));
  it("rejects undeclared events", () => expect(sanitizeLaunchAnalytics({ event: "profile.secret_viewed", properties: {} })).toBeNull());
  it("bounds string dimensions", () => expect(sanitizeLaunchAnalytics({ event: "auth.signed_in", properties: { role: "x".repeat(300), method: "password" } })?.properties.role).toHaveLength(160));
});
