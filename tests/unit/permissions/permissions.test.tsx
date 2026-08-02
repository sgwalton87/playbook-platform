import { describe, expect, it } from "vitest";
import {
  canRelationship,
  getPermissionsForRelationship,
  getRelationshipGraph,
} from "@/lib/permissions";
import PermissionsGraph from "@/components/permissions/PermissionsGraph";

describe("Role OS Permissions", () => {
  it("returns permissions for educator", () => {
    expect(getPermissionsForRelationship("educator")).toContain("verify_evidence");
  });

  it("checks permission access", () => {
    expect(canRelationship("parent_guardian", "verify_evidence")).toBe(false);
    expect(canRelationship("mentor", "support_tasks")).toBe(true);
    expect(canRelationship("mentor", "verify_evidence")).toBe(true);
    expect(canRelationship("district_admin", "verify_evidence")).toBe(true);
  });

  it("returns relationship graph", () => {
    expect(getRelationshipGraph().length).toBe(7);
  });

  it("component is defined", () => {
    expect(PermissionsGraph).toBeTruthy();
  });
});
