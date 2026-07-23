import { describe, expect, it } from "vitest";
import PermissionGate from "@/components/permissions/PermissionGate";
import { mapRoleToRelationship } from "@/lib/permissions";
import { PUBLIC_ONBOARDING_ROLES } from "@/lib/roles/registry";

describe("PermissionGate", () => {
  it("component is defined", () => {
    expect(PermissionGate).toBeTruthy();
  });

  it("maps role to relationship", () => {
    expect(mapRoleToRelationship("family")).toBe("parent_guardian");
    expect(mapRoleToRelationship("employer")).toBe("employer_partner");
  });

  it("maps every public onboarding role into a permission relationship", () => {
    for (const role of PUBLIC_ONBOARDING_ROLES) {
      expect(mapRoleToRelationship(role)).toBeTruthy();
    }
    expect(mapRoleToRelationship("coach")).toBe("educator");
    expect(mapRoleToRelationship("college-admissions")).toBe("university_partner");
    expect(mapRoleToRelationship("athlete-abroad")).toBe("scholar");
  });
});
