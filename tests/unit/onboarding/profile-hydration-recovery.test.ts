import { describe, expect, it } from "vitest";
import { hydrateProfileFromOnboarding } from "@/lib/onboarding/profileHydration";

describe("recovery: profile editor hydration from onboarding", () => {
  it("prefers newly saved signup values over stale legacy profile fields", () => {
    const result = hydrateProfileFromOnboarding({
      first_name: "Legacy", last_name: "Athlete",
      school: "Old school", sport: "Old sport", travel_team: "Old club",
      highlight_reel_url: "https://example.org/old",
      onboarding_data: {
        full_name: "New Scholar", school: "New school", primary_sport: "Basketball",
        current_team: "New club", highlight_link: "https://example.org/new",
        graduation_year: "2027", gpa: "3.7", school_district: "New district",
        top_schools: ["Princeton", "Stanford"],
      },
    });
    expect(result.first_name).toBe("New");
    expect(result.last_name).toBe("Scholar");
    expect(result.school).toBe("New school");
    expect(result.sport).toBe("Basketball");
    expect(result.travel_team).toBe("New club");
    expect(result.highlight_reel_url).toBe("https://example.org/new");
    expect(result.grad_year).toBe("2027");
    expect(result.unweighted_gpa).toBe("3.7");
    expect(result.school_district).toBe("New district");
    expect(result.college_list_2).toBe("Princeton");
  });

  it("preserves historical fields where newer onboarding did not provide values", () => {
    const original = { bio: "Previously saved", city: "Vallejo", onboarding_data: { bio: "", school: "" } };
    const result = hydrateProfileFromOnboarding(original);
    expect(result.bio).toBe("Previously saved");
    expect(result.city).toBe("Vallejo");
    expect(result).not.toBe(original);
  });

  it("never overwrites authority-bearing identity or permission fields", () => {
    const result = hydrateProfileFromOnboarding({
      role: "scholar-athlete", verification_status: "pending", onboarding_completed: true,
      onboarding_data: { role: "admin", verification_status: "approved", onboarding_completed: false },
    });
    expect(result.role).toBe("scholar-athlete");
    expect(result.verification_status).toBe("pending");
    expect(result.onboarding_completed).toBe(true);
  });

  it("returns unchanged profile when no valid onboarding snapshot exists", () => {
    const profile = { school: "Historical school", onboarding_data: null };
    expect(hydrateProfileFromOnboarding(profile)).toBe(profile);
  });
});
