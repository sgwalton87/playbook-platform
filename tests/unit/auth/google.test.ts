import { describe, expect, it } from "vitest";
import {
  buildGoogleCallbackUrl,
  getGoogleRequestedRole,
  GOOGLE_LOGIN_ERROR_MESSAGE,
} from "@/lib/auth/google";

describe("Google authentication contract", () => {
  it("builds a same-origin signup callback with the explicitly selected canonical role", () => {
    expect(buildGoogleCallbackUrl("https://playbook.example", "parent", "signup")).toBe(
      "https://playbook.example/auth/callback?provider=google&role=family"
    );
    expect(buildGoogleCallbackUrl("https://playbook.example", "scholar", "signup")).toBe(
      "https://playbook.example/auth/callback?provider=google&role=scholar"
    );
  });

  it("builds returning-user Google login without a requested role", () => {
    const callback = new URL(
      buildGoogleCallbackUrl("https://playbook.example", "scholar", "login")
    );
    expect(callback.searchParams.get("provider")).toBe("google");
    expect(callback.searchParams.has("role")).toBe(false);
  });

  it("accepts role handoff only for a new Google identity", () => {
    expect(getGoogleRequestedRole("google", "scholar-athlete", "google", false)).toBe(
      "scholar-athlete"
    );
    expect(getGoogleRequestedRole("google", "family", "google", true)).toBeNull();
    expect(getGoogleRequestedRole("google", "family", "email", false)).toBeNull();
    expect(getGoogleRequestedRole("google", null, "google", false)).toBeNull();
  });

  it("fails closed for an unknown signup role", () => {
    expect(() => buildGoogleCallbackUrl(
      "https://playbook.example",
      "not-a-role",
      "signup"
    )).toThrow("Unsupported Playbook role");
    expect(() => getGoogleRequestedRole(
      "google",
      "not-a-role",
      "google",
      false
    )).toThrow("Unsupported Playbook role");
  });

  it("uses a non-enumerating provider failure message", () => {
    expect(GOOGLE_LOGIN_ERROR_MESSAGE).not.toMatch(/supabase|account exists|user/i);
  });
});
