import { describe, expect, it } from "vitest";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import { hydrateProfileFromOnboarding, reconcileProfileSave } from "@/lib/onboarding/profileHydration";

describe("canonical onboarding to editable profile parity", () => {
  it("reuses entered identity, academic goals and athlete measurements", () => {
    const record = hydrateProfileFromOnboarding({
      first_name: "Legacy", last_name: "Name", school: "Old School",
      onboarding_data: {
        first_name: "Test", last_name: "Scholar", date_of_birth: "2008-03-11",
        gender: "Prefer not to say", school: "New School", grade: "12",
        height: "5 ft 9 in", weight: "140 lb", intended_major: "Biology"
      }
    });
    expect(record).toMatchObject({
      first_name: "Test", last_name: "Scholar", date_of_birth: "2008-03-11",
      gender: "Prefer not to say", school: "New School", grade: "12",
      height: "5 ft 9 in", weight: "140 lb", intended_major: "Biology"
    });
    const saved = reconcileProfileSave(record.onboarding_data, {
      first_name: "Updated", last_name: "Scholar", height: "5 ft 10 in", grade: "12"
    });
    expect(saved).toMatchObject({ first_name: "Updated", last_name: "Scholar", height: "5 ft 10 in", grade: "12", intended_major: "Biology" });
  });

  it("does not erase college preferences when saving unrelated profile fields", () => {
    const prior = { top_schools: ["Stanford", "UCLA"], intended_major: "Biology" };
    const updated = reconcileProfileSave(prior, { bio: "Updated bio" });
    expect(updated.top_schools).toEqual(["Stanford", "UCLA"]);
    expect(updated.bio).toBe("Updated bio");
    const explicit = reconcileProfileSave(prior, { college_list_2: "Berkeley", college_list_3: null });
    expect(explicit.top_schools).toEqual(["Berkeley"]);
  });

  it("Family onboarding never asks for scholar athlete measurements", () => {
    const familyKeys = getOnboardingSteps("family").flatMap(step => step.fields.map(field => field.key));
    expect(familyKeys).toContain("relationship_to_scholar");
    expect(familyKeys).not.toContain("primary_sport");
    expect(familyKeys).not.toContain("height");
  });

  it("all roles include editable personal identity", () => {
    const identityKeys = getOnboardingSteps("family").find(step => step.id === "identity")?.fields.map(field => field.key);
    expect(identityKeys).toEqual(expect.arrayContaining(["first_name","last_name","date_of_birth","gender"]));
  });
});
