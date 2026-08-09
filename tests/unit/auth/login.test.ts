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

  it("uses auth metadata when a new account does not have a profile row yet", () => {
    expect(getLoginDestination(null, "parent")).toBe(
      "/start?first=1&role=family"
    );
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

  it("does not disclose provider-specific credential errors", () => {
    expect(getLoginErrorMessage()).not.toMatch(/user|account exists|supabase/i);
  });
});
