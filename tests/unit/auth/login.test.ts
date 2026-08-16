import { describe, expect, it } from "vitest";
import { getLoginDestination, getLoginErrorMessage } from "@/lib/auth/login";

describe("login authority routing", () => {
  it("routes an onboarded role to its canonical operating system", () => {
    expect(getLoginDestination({
      onboarding_completed: true,
      profile_mode: "family",
      role: "family",
    })).toBe("/family-os");
  });

  it("routes an incomplete account through canonical onboarding", () => {
    expect(getLoginDestination(null, "scholar-athlete")).toBe(
      "/start?first=1&role=scholar-athlete"
    );
  });

  it("uses auth metadata only when a new account does not have a profile row yet", () => {
    expect(getLoginDestination(null, "parent")).toBe(
      "/start?first=1&role=family"
    );
  });

  it("preserves the durable profile role while onboarding is incomplete", () => {
    expect(getLoginDestination({
      onboarding_completed: false,
      profile_mode: "scholar-athlete",
      role: "scholar-athlete",
    }, "family")).toBe("/start?first=1&role=scholar-athlete");
  });

  it("uses the profile role instead of untrusted metadata for an onboarded account", () => {
    expect(
      getLoginDestination(
        {
          onboarding_completed: true,
          profile_mode: "mentor",
          role: "mentor",
        },
        "district"
      )
    ).toBe("/mentor-os");
  });

  it("fails closed when neither profile nor metadata contains a canonical role", () => {
    expect(() => getLoginDestination(null, null)).toThrow("role is required");
    expect(() => getLoginDestination(null, "not-a-role")).toThrow("Unsupported Playbook role");
  });

  it("does not disclose provider-specific credential errors", () => {
    expect(getLoginErrorMessage()).not.toMatch(/user|account exists|supabase/i);
  });
});
