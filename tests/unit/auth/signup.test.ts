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

  it("fails closed instead of substituting Scholar for an unknown or missing role", () => {
    expect(() => buildSignupMetadata("not-a-role")).toThrow("Unsupported Playbook role");
    expect(() => buildSignupMetadata("")).toThrow("role is required");
    expect(() => buildSignupMetadata(null)).toThrow("role is required");
  });

  it("does not expose provider or account-enumeration details", () => {
    expect(getSignupErrorMessage()).not.toMatch(/supabase|already registered|user exists/i);
  });
});
