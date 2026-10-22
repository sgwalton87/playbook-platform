import { describe, expect, it } from "vitest";
import { PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";
import { getOnboardingSteps } from "@/lib/onboarding/engine";
import { formatListAnswers, getRoleEditableFields, isListEditableField, parseListAnswers } from "@/lib/onboarding/editableFields";

describe("15 canonical role editor field parity", () => {
  it.each(PUBLIC_ONBOARDING_ROLES)("retains every non-authority onboarding field for %s", role => {
    const steps = getOnboardingSteps(role);
    const expected = steps.flatMap(step => step.fields)
      .filter(field => field.type !== "safety-agreement").map(field => field.key);
    const actual = getRoleEditableFields(steps).map(field => field.key);
    expect(actual).toEqual(expected);
  });

  it("keeps multi-entry planning fields as arrays without initiating invitations", () => {
    const fields = getRoleEditableFields(getOnboardingSteps("family"));
    const planned = fields.find(field => field.key === "invite_supporters");
    if (planned) expect(isListEditableField(planned)).toBe(true);
    expect(parseListAnswers("one@example.org\ntwo@example.org\n")).toEqual(["one@example.org", "two@example.org"]);
    expect(formatListAnswers(["one@example.org", "two@example.org"])).toBe("one@example.org\ntwo@example.org");
  });

  it("does not offer consent reacceptance from the profile editor", () => {
    const fields = getRoleEditableFields(getOnboardingSteps("brand-partner"));
    expect(fields.some(field => field.type === "safety-agreement")).toBe(false);
  });
  it("preserves unique step identity even when sections share a phase label", () => {
    const fields = getRoleEditableFields([
      { id: "first", phase: "Shared", title: "First", body: "", fields: [{ key: "alpha", label: "Alpha" }] },
      { id: "second", phase: "Shared", title: "Second", body: "", fields: [{ key: "beta", label: "Beta" }] },
    ]);
    expect(fields.filter(field => field.stepId === "first").map(field => field.key)).toEqual(["alpha"]);
    expect(fields.filter(field => field.stepId === "second").map(field => field.key)).toEqual(["beta"]);
  });
});
