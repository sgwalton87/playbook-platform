import { describe, expect, it } from "vitest";
import { createInitialOnboardingData } from "@/lib/onboarding/engine";
import { mapOnboardingToProfilePayload } from "@/lib/onboarding/supabaseMapping";

describe("capture identity once across onboarding and profile", () => {
  it("derives display name from first and last name on original onboarding save", () => {
    const payload = mapOnboardingToProfilePayload({
      userId: "synthetic-account", role: "family",
      data: {
        first_name: "Test", last_name: "Guardian", username: "test-guardian",
        bio: "Helping a scholar", community_safety_agreed: true,
        relationship_to_scholar: "Parent"
      }, stepIndex: 1, complete: false,
    });
    expect(payload).toMatchObject({
      first_name: "Test", last_name: "Guardian", full_name: "Test Guardian",
      public_profile_complete: true,
      onboarding_data: { first_name: "Test", last_name: "Guardian", relationship_to_scholar: "Parent" },
    });
  });
  it("hydrates an existing account without asking to enter names again", () => {
    const data = createInitialOnboardingData({
      full_name: "Existing Guardian", first_name: "Existing", last_name: "Guardian",
      date_of_birth: "1985-05-12", gender: "Prefer not to say"
    });
    expect(data).toMatchObject({
      first_name: "Existing", last_name: "Guardian",
      date_of_birth: "1985-05-12", gender: "Prefer not to say"
    });
  });
});
