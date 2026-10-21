import { describe, expect, it } from "vitest";
import { hydrateProfileFromOnboarding, reconcileProfileSave } from "@/lib/onboarding/profileHydration";

describe("recovery: profile editor hydration from onboarding", () => {
  it("prefers newly saved signup values over stale legacy profile fields", () => {
    const result = hydrateProfileFromOnboarding<Record<string, unknown>>({
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

describe("profile editor save reconciliation", () => {
  it("updates overlapping signup values while preserving answers that have no editor field", () => {
    const saved = reconcileProfileSave(
      { primary_sport: "Basketball", activities: ["Volunteering"], invite_supporters: ["mentor"], nil_interest: ["media"], gpa: "3.4" },
      { sport: "Soccer", unweighted_gpa: "3.8", college_list_2: "Stanford", full_name: "Test Scholar" }
    );
    expect(saved.primary_sport).toBe("Soccer");
    expect(saved.gpa).toBe("3.8");
    expect(saved.unweighted_gpa).toBe("3.8");
    expect(saved.top_schools).toEqual(["Stanford"]);
    expect(saved.activities).toEqual(["Volunteering"]);
    expect(saved.invite_supporters).toEqual(["mentor"]);
    expect(saved.nil_interest).toEqual(["media"]);
  });

  it("never copies profile authority or private attributes without an explicit mapping", () => {
    const saved = reconcileProfileSave(
      { onboarding_completed: true, community_safety_agreed: true },
      { role: "admin", verification_status: "approved", school: "School" }
    );
    expect(saved).not.toHaveProperty("role");
    expect(saved).not.toHaveProperty("verification_status");
    expect(saved.onboarding_completed).toBe(true);
    expect(saved.school).toBe("School");
  });

  it("shows a newly edited value when the reconciled profile reloads", () => {
    const original = { sport: "Basketball", onboarding_data: { primary_sport: "Basketball" } };
    const updates = { sport: "Track" };
    const afterSave = { ...original, ...updates, onboarding_data: reconcileProfileSave(original.onboarding_data, updates) };
    expect(hydrateProfileFromOnboarding(afterSave).sport).toBe("Track");
  });
});

describe("private background compatibility", () => {
  it("hydrates race from the private draft without requiring a profiles table column", () => {
    const visible = hydrateProfileFromOnboarding({ onboarding_data: { race: "Prefer not to say" } });
    expect((visible as Record<string, unknown>).race).toBe("Prefer not to say");
  });
});
