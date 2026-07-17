import { describe, expect, it } from "vitest";
import {
  calculateProfileCompleteness,
  createProfileDefaults,
  mapOnboardingToProfile,
  validateProfileIdentity,
} from "@/lib/profile";

describe("Canonical profile persistence", () => {
  it("maps onboarding identity into canonical fields", () => {
    const patch = mapOnboardingToProfile({
      userId: "user-1",
      email: "scholar@example.com",
      role: "scholar",
      form: {
        full_name: "Jordan Miles",
        username: "@JordanMiles",
        avatar_url: "https://example.com/avatar.jpg",
        school: "Oakland Technical High School",
        gpa: "3.6",
        activities: [
          {
            category: "Leadership",
            activity: "Student Government",
          },
        ],
      },
    });

    expect(patch.first_name).toBe("Jordan");
    expect(patch.last_name).toBe("Miles");
    expect(patch.username).toBe("jordanmiles");
    expect(patch.profile_mode).toBe("scholar");
    expect(
      (patch.onboarding_data?.activities as unknown[])
        .length
    ).toBe(1);
  });

  it("validates required identity fields", () => {
    const result = validateProfileIdentity({
      id: "user-1",
      role: "scholar",
      profile_mode: "scholar",
      full_name: "",
      username: "",
    });

    expect(result.valid).toBe(false);
    expect(result.errors.full_name).toBeTruthy();
    expect(result.errors.username).toBeTruthy();
  });

  it("calculates profile completeness", () => {
    const profile = createProfileDefaults(
      "user-1",
      "scholar@example.com",
      "scholar"
    );

    profile.full_name = "Jordan Miles";
    profile.username = "jordanmiles";
    profile.school = "Oakland Tech";
    profile.onboarding_data = {
      activities: [{ activity: "Basketball" }],
    };

    const completeness =
      calculateProfileCompleteness(profile);

    expect(completeness.percent).toBeGreaterThan(0);
    expect(completeness.completed).toBe(4);
    expect(
      completeness.missing.some(
        (item) => item.key === "avatar_url"
      )
    ).toBe(true);
  });
});
