import { describe, expect, it } from "vitest";
import { mapOnboardingToProfilePayload } from "@/lib/onboarding/supabaseMapping";

describe("onboarding finalization boundary", () => {
  it("keeps ordinary autosaves explicitly incomplete", () => {
    const payload = mapOnboardingToProfilePayload({
      userId: "user-1",
      role: "educator",
      data: { full_name: "Test Educator" },
      stepIndex: 2,
      complete: false,
    });
    expect(payload.onboarding_completed).toBe(false);
    expect(payload.onboarding_completed_at).toBeNull();
  });

  it("does not allow the client mapper to certify final completion", () => {
    const payload = mapOnboardingToProfilePayload({
      userId: "user-1",
      role: "educator",
      data: { full_name: "Test Educator", community_safety_agreed: true },
      stepIndex: 5,
      complete: true,
    });
    expect("onboarding_completed" in payload).toBe(false);
    expect("onboarding_completed_at" in payload).toBe(false);
  });
});
