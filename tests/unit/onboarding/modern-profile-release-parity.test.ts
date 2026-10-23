import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import { getRoleEditableFields } from "@/lib/onboarding/editableFields";

const entry = readFileSync("app/profile/page.tsx", "utf8");
const editor = readFileSync("app/profile/role/page.tsx", "utf8");
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
    expect(editor).toContain('router.push("/profile/advanced")');
    expect(editor).toContain('role === "scholar" || role === "scholar-athlete"');
  });

  it("keeps typed inputs and confirmed owner-scoped save", () => {
    expect(editor).toContain('field.type === "sport-position"');
    expect(editor).toContain('type="date"');
    expect(editor).toContain('.eq("id", profile.id).select("id").maybeSingle()');
    expect(editor).toContain("if (error || !data)");
    expect(editor).not.toContain("verification_status:");
  });
});
