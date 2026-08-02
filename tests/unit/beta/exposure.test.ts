import { describe, expect, it } from "vitest";
import { decideBetaRoute, parseBetaExposureMode } from "@/lib/beta/exposure";

describe("beta exposure boundary", () => {
  it("is inert unless explicitly enabled", () => {
    expect(parseBetaExposureMode(undefined)).toBe("off");
    expect(decideBetaRoute("/studio/oracle", "off", true)).toEqual({
      outcome: "allow_public",
    });
  });

  it("keeps authentication and controlled share entry routes public", () => {
    expect(decideBetaRoute("/login", "allowlist", true)).toEqual({
      outcome: "allow_public",
    });
    expect(decideBetaRoute("/portfolio/share-id", "allowlist", true)).toEqual({
      outcome: "allow_public",
    });
    expect(
      decideBetaRoute("/api/invitations/accept", "allowlist", true),
    ).toEqual({ outcome: "allow_public" });
  });

  it("keeps secret-protected probes and bounded client telemetry reachable", () => {
    expect(decideBetaRoute("/api/health/live", "allowlist", true)).toEqual({ outcome: "allow_public" });
    expect(decideBetaRoute("/api/health/metrics", "allowlist", true)).toEqual({ outcome: "allow_public" });
    expect(decideBetaRoute("/api/telemetry/client", "allowlist", true)).toEqual({ outcome: "allow_public" });
  });

  it("requires cohort grants for governed beta pages and APIs", () => {
    expect(decideBetaRoute("/dashboard", "allowlist", true)).toEqual({
      outcome: "allow_governed",
      requiresGrant: true,
    });
    expect(
      decideBetaRoute("/api/evidence/verification-requests", "allowlist", true),
    ).toEqual({ outcome: "allow_governed", requiresGrant: true });
    expect(decideBetaRoute("/scholar-athlete-os", "allowlist", true)).toEqual({
      outcome: "allow_governed",
      requiresGrant: true,
    });
    expect(decideBetaRoute("/api/athlete/nil", "allowlist", true)).toEqual({
      outcome: "allow_governed",
      requiresGrant: true,
    });
    expect(decideBetaRoute("/api/settings/ai-consent", "allowlist", true)).toEqual({
      outcome: "allow_governed",
      requiresGrant: true,
    });
    expect(decideBetaRoute("/admin/nil-compliance", "allowlist", true)).toEqual({
      outcome: "allow_governed",
      requiresGrant: true,
    });
  });

  it("fails closed for routes outside the beta contract", () => {
    expect(decideBetaRoute("/studio/oracle", "allowlist", true)).toEqual({
      outcome: "deny",
      response: "page",
    });
    expect(decideBetaRoute("/api/ai/zai", "allowlist", true)).toEqual({
      outcome: "deny",
      response: "api",
    });
  });
});
