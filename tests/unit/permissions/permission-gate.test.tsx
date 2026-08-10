import { describe, expect, it } from "vitest";
import PermissionGate from "@/components/permissions/PermissionGate";
import { mapRoleToRelationship } from "@/lib/permissions";

describe("PermissionGate", () => {
  it("component is defined", () => {
    expect(PermissionGate).toBeTruthy();
  });

  it("maps role to relationship", () => {
    expect(mapRoleToRelationship("family")).toBe("parent_guardian");
    expect(mapRoleToRelationship("employer")).toBe("employer_partner");
    expect(mapRoleToRelationship("transition-youth")).toBe("scholar");
    expect(() => mapRoleToRelationship("counselor")).toThrow("Role authority is not configured");
    expect(() => mapRoleToRelationship("coach")).toThrow("Role authority is not configured");
    expect(() => mapRoleToRelationship("recruiter")).toThrow("Role authority is not configured");
    expect(() => mapRoleToRelationship("admissions")).toThrow("Role authority is not configured");
    expect(() => mapRoleToRelationship("community")).toThrow("Role authority is not configured");
  });
});
