import { describe, expect, it } from "vitest";
import {
  canRelationship,
  getPermissionsForRelationship,
  getRelationshipGraph,
} from "@/lib/permissions";
import PermissionsGraph from "@/components/permissions/PermissionsGraph";

describe("Role OS Permissions", () => {
  it("keeps unproven educator relationships at zero data authority", () => {
    expect(getPermissionsForRelationship("educator")).toEqual([]);
  });

  it("checks permission access", () => {
    expect(canRelationship("parent_guardian", "verify_evidence")).toBe(false);
    expect(canRelationship("mentor", "support_tasks")).toBe(true);
    expect(canRelationship("educator", "verify_evidence")).toBe(false);
  });

  it("returns relationship graph", () => {
    expect(getRelationshipGraph().length).toBe(8);
    expect(getRelationshipGraph().some((entry) => entry.relationship === "coach")).toBe(true);
  });

  it("component is defined", () => {
    expect(PermissionsGraph).toBeTruthy();
  });
});
