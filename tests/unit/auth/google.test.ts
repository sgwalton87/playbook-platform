import { describe, expect, it } from "vitest";
import {
  buildGoogleCallbackUrl,
  getGoogleRequestedRole,
  GOOGLE_LOGIN_ERROR_MESSAGE,
} from "@/lib/auth/google";

describe("Google authentication contract", () => {
  it("builds a same-origin callback with a canonical public role", () => {
    expect(buildGoogleCallbackUrl("https://playbook.example", "parent")).toBe(
      "https://playbook.example/auth/callback?provider=google&role=family"
    );
  });

  it("accepts role handoff only for a new Google identity", () => {
    expect(getGoogleRequestedRole("google", "scholar-athlete", "google", false)).toBe(
      "scholar-athlete"
    );
    expect(getGoogleRequestedRole("google", "family", "google", true)).toBeNull();
    expect(getGoogleRequestedRole("google", "family", "email", false)).toBeNull();
  });

  it("uses a non-enumerating provider failure message", () => {
    expect(GOOGLE_LOGIN_ERROR_MESSAGE).not.toMatch(/supabase|account exists|user/i);
  });
});
