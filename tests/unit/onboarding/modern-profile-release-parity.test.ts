import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import { getRoleEditableFields } from "@/lib/onboarding/editableFields";

const entry = readFileSync("app/profile/page.tsx", "utf8");
const editor = readFileSync("components/profile/RoleProfileEditor.tsx", "utf8");
const advanced = readFileSync("app/profile/advanced/page.tsx", "utf8");

describe("modern profile release parity", () => {
  it("routes all role profiles through the canonical onboarding-derived editor", () => {
    expect(entry).toContain('export { default } from "./role/page"');
    expect(editor).toContain("getOnboardingSteps(role)");
    expect(editor).not.toContain('router.replace("/profile")');
  });

  it.each(PUBLIC_ONBOARDING_ROLES)("has role-specific editable onboarding fields for %s", role => {
    const steps = getOnboardingSteps(role);
    const fieldKeys = new Set(getRoleEditableFields(steps).map(field => field.key));
    expect(fieldKeys.size).toBeGreaterThan(0);
    expect(fieldKeys.has("first_name")).toBe(true);
    expect(fieldKeys.has("last_name")).toBe(true);
  });

  it("preserves advanced Scholar functions and role-safe access", () => {
    expect(advanced).toContain('requirePlaybookRole');
    expect(advanced).toContain('supabase.storage.from("avatars")');
    expect(advanced).toContain('reconcileProfileSave');
    expect(editor).toContain('"/profile/advanced"');
    expect(editor).toContain('"/profile/athlete"');
    expect(editor).toContain('role === "scholar" || role === "scholar-athlete"');
  });

  it("syncs only known non-authority legacy fields alongside private onboarding answers", () => {
    expect(editor).toContain('primary_sport: "sport"');
    expect(editor).toContain('school_district: "school_district"');
    expect(editor).toContain('date_of_birth: "date_of_birth"');
    expect(editor).toContain("...compatibleUpdates");
    expect(editor).toContain("onboarding_data: updatedAnswers");
    expect(editor).not.toContain("verification_status:");
    expect(editor).not.toContain("onboarding_completed:");
  });

  it("uses the same approved autocomplete sources as onboarding", () => {
    expect(editor).toContain("ALL_COLLEGE_OPTIONS.map");
    expect(editor).toContain("CAREER_OPTIONS.map");
    expect(editor).toContain("CALIFORNIA_DISTRICTS.map");
    expect(editor).toContain('field.type === "college" || field.type === "career" || field.type === "district"');
  });

  it("does not flatten structured activities or discard historical text entries", () => {
    const component = readFileSync("components/profile/ActivityProfileField.tsx", "utf8");
    expect(editor).toContain('field.type === "activity-list"');
    expect(editor).toContain("<ActivityProfileField");
    expect(component).toContain("entry.activity");
    expect(component).toContain('typeof entry === "string"');
    expect(component).toContain("onChange(entries.map");
    expect(component).toContain("entry.description");
    expect(component).toContain("entry.supervisor");
  });

  it("preserves indexed college and contact lists without auto invitations", () => {
    expect(editor).toContain('field.type === "college-list" || field.type === "invite-list"');
    expect(editor).toContain('field.type === "college-list" ? 10 : 5');
    expect(editor).toContain('field.type === "invite-list" ? "email" : "text"');
    expect(editor).toContain("Saving this list never sends an invitation or creates access.");
    expect(editor).not.toContain("sendInvitation(");
  });

  it("normalizes empty college and contact slots before persistence", () => {
    expect(editor).toContain('field.type !== "college-list" && field.type !== "invite-list"');
    expect(editor).toContain('entry.trim().length > 0');
    expect(editor).toContain('entry => typeof entry === "string" ? entry.trim() : ""');
  });

  it("blocks stale modern and advanced editor saves before replacing private answers", () => {
    expect(editor).toContain('stableProfileSnapshot(latest.onboarding_data)');
    expect(editor).toContain('stableProfileSnapshot(profile.onboarding_data)');
    expect(editor).toContain("Your profile was updated elsewhere.");
    expect(advanced).toContain('stableProfileSnapshot(latest.onboarding_data)');
    expect(advanced).toContain("Your profile was updated elsewhere.");
  });

  it("keeps the advanced editor usable above mobile navigation", () => {
    expect(advanced).toContain('className="playbook-advanced-profile"');
    expect(advanced).toContain('env(safe-area-inset-bottom)');
    expect(advanced).toContain('grid-template-columns:minmax(0,1fr)!important');
    expect(advanced).toContain('min-width:0;max-width:100%');
  });

  it("keeps typed inputs and confirmed owner-scoped save", () => {
    expect(editor).toContain('field.type === "sport-position"');
    expect(editor).toContain('type="date"');
    expect(editor).toContain('.eq("id", profile.id).select("id").maybeSingle()');
    expect(editor).toContain("if (error || !data)");
    expect(editor).not.toContain("verification_status:");
  });
});
