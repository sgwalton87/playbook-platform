import { describe, expect, it } from "vitest";
import { buildSignupMetadata, getSignupErrorMessage } from "@/lib/auth/signup";

describe("signup authority metadata", () => {
  it("stores one canonical role consistently at the auth boundary", () => {
    expect(buildSignupMetadata("parent")).toEqual({
      role: "family",
      profile_mode: "family",
      requested_role: "family",
      verification_status: "email_pending",
    });
  });

  it("falls back to the least surprising public scholar role", () => {
    expect(buildSignupMetadata("not-a-role").role).toBe("scholar");
  });

  it("does not expose provider or account-enumeration details", () => {
    expect(getSignupErrorMessage()).not.toMatch(/supabase|already registered|user exists/i);
  });
});
