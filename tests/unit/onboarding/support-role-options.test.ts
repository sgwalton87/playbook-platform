import { describe, expect, it } from "vitest";
import {
  getSupportRoleOption,
  getSupportRoleOptions,
  SUPPORT_ROLE_OPTIONS,
} from "@/lib/onboarding";
import { roleForSupportInvitation } from "@/lib/invitations";

describe("Starting Five role selection", () => {
  it("puts Parent / Guardian first and Other last", () => {
    expect(SUPPORT_ROLE_OPTIONS[0]).toEqual(
      expect.objectContaining({ role: "family", label: "Parent / Guardian" }),
    );
    expect(SUPPORT_ROLE_OPTIONS.at(-1)).toEqual(
      expect.objectContaining({ role: "other", label: "Other" }),
    );
  });

  it("excludes the learner’s own role while preserving likely support roles", () => {
    const roles = getSupportRoleOptions("scholar-athlete").map((option) => option.role);

    expect(roles).not.toContain("scholar-athlete");
    expect(roles.slice(0, 5)).toEqual([
      "family",
      "coach",
      "counselor",
      "educator",
      "mentor",
    ]);
    expect(roles).toContain("other");
  });

  it("maps every selectable role into its correct invitation relationship", () => {
    for (const option of SUPPORT_ROLE_OPTIONS) {
      expect(getSupportRoleOption(option.role)?.relationship).toBe(option.relationship);
      expect(roleForSupportInvitation(option.relationship, option.role)).toBe(option.role);
    }
  });
});
