import { describe, it, expect } from "vitest";
import { mapOnboardingToProfilePayload } from "@/lib/onboarding/supabaseMapping";
import { reconcileProfileSave } from "@/lib/onboarding/profileHydration";

describe("private scholar onboarding fields", () => {
  it("retains demographic selections and major on the canonical record", () => {
    const saved = mapOnboardingToProfilePayload({
      userId: "synthetic", role: "scholar",
      data: {
        first_name: "Test", last_name: "Scholar",
        race_ethnicity: ["Multiracial", "Black/African American"],
        intended_major: "Biology", grade: "11",
      },
      stepIndex: 2, complete: false,
    });
    expect((saved.onboarding_data as Record<string, unknown>).race_ethnicity).toEqual([
      "Multiracial", "Black/African American"
    ]);
    expect((saved.onboarding_data as Record<string, unknown>).intended_major).toBe("Biology");
    expect("race_ethnicity" in saved).toBe(false);
    const edited = reconcileProfileSave(saved.onboarding_data, {
      intended_major: "Chemistry", grade: "12"
    });
    expect(edited.race_ethnicity).toEqual([
      "Multiracial", "Black/African American"
    ]);
    expect(edited.intended_major).toBe("Chemistry");
  });
});
