import { describe, expect, it } from "vitest";
import PermissionGate from "@/components/permissions/PermissionGate";
import { mapRoleToRelationship } from "@/lib/permissions";

describe("PermissionGate", () => {
  it("component is defined", () => {
    expect(PermissionGate).toBeTruthy();
  });

  it("maps role to exact relationship identity", () => {
    expect(mapRoleToRelationship("family")).toBe("parent_guardian");
    expect(mapRoleToRelationship("educator")).toBe("educator");
    expect(mapRoleToRelationship("counselor")).toBe("counselor");
    expect(mapRoleToRelationship("coach")).toBe("coach");
    expect(mapRoleToRelationship("recruiter")).toBe("college_recruiter");
    expect(mapRoleToRelationship("admissions")).toBe("college_admissions");
    expect(mapRoleToRelationship("community")).toBe("community_partner");
    expect(mapRoleToRelationship("employer")).toBe("employer_partner");
    expect(mapRoleToRelationship("transition-youth")).toBe("scholar");
  });
});
