import { describe, expect, it } from "vitest";
import { getPermissionsForRelationship } from "@/lib/permissions";

describe("relationship default-deny policy", () => {
  it.each([
    "educator",
    "counselor",
    "coach",
    "district_admin",
    "college_recruiter",
    "college_admissions",
    "community_partner",
    "university_partner",
    "employer_partner",
  ] as const)("keeps %s at zero data permissions until independent authority activates", (relationship) => {
    expect(getPermissionsForRelationship(relationship)).toEqual([]);
  });

  it("preserves the already-governed Family least-privilege permissions", () => {
    expect(getPermissionsForRelationship("parent_guardian")).toEqual([
      "view_progress",
      "view_deadlines",
      "support_tasks",
    ]);
  });

  it("preserves the already-governed Mentor least-privilege permissions", () => {
    expect(getPermissionsForRelationship("mentor")).toEqual([
      "view_progress",
      "recommend_actions",
      "support_tasks",
    ]);
  });
});
