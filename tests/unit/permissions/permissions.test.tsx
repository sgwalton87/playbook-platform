import { describe, expect, it } from "vitest";
import {
  canRelationship,
  getPermissionsForRelationship,
  getRelationshipGraph,
} from "@/lib/permissions";
import PermissionsGraph from "@/components/permissions/PermissionsGraph";

describe("Role OS Permissions", () => {
  it("keeps unproven external relationships at zero data authority", () => {
    expect(getPermissionsForRelationship("educator")).toEqual([]);
    expect(getPermissionsForRelationship("counselor")).toEqual([]);
    expect(getPermissionsForRelationship("college_recruiter")).toEqual([]);
    expect(getPermissionsForRelationship("college_admissions")).toEqual([]);
    expect(getPermissionsForRelationship("community_partner")).toEqual([]);
  });

  it("checks permission access", () => {
    expect(canRelationship("parent_guardian", "verify_evidence")).toBe(false);
    expect(canRelationship("mentor", "support_tasks")).toBe(true);
    expect(canRelationship("educator", "verify_evidence")).toBe(false);
  });

  it("returns the exact relationship graph", () => {
    const graph = getRelationshipGraph();
    expect(graph.length).toBe(12);
    expect(graph.some((entry) => entry.relationship === "college_recruiter")).toBe(true);
    expect(graph.some((entry) => entry.relationship === "college_admissions")).toBe(true);
    expect(graph.some((entry) => entry.relationship === "community_partner")).toBe(true);
  });

  it("component is defined", () => {
    expect(PermissionsGraph).toBeTruthy();
  });
});
