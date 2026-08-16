import { describe, expect, it } from "vitest";
import { authorizePlaybookFoundation } from "../../../lib/pbos/foundation";

describe("Playbook foundation authority boundaries", () => {
  it("keeps Scholar authority scoped to canonical Scholar Record tables", () => {
    const authority = authorizePlaybookFoundation({
      userId: "scholar-1",
      ownerId: "scholar-1",
      role: "SCHOLAR",
      approvalId: "approval-scholar",
    });
    expect(authority.dataBoundary.policy).toBe("OWNER_SCOPED_RLS");
    expect(authority.dataBoundary.tables).toEqual([
      "scholar_profiles",
      "scholar_goals",
      "scholar_milestones",
    ]);
  });

  it("extends only the owner-scoped athlete record for Scholar-Athletes", () => {
    const authority = authorizePlaybookFoundation({
      userId: "athlete-1",
      ownerId: "athlete-1",
      role: "SCHOLAR_ATHLETE",
      approvalId: "approval-athlete",
    });
    expect(authority.dataBoundary.policy).toBe("OWNER_SCOPED_RLS");
    expect(authority.dataBoundary.tables).toEqual([
      "scholar_profiles",
      "scholar_goals",
      "scholar_milestones",
      "athlete_profiles",
    ]);
  });

  it("keeps Transition-Aged Youth on the canonical owner-scoped Scholar Record boundary", () => {
    const authority = authorizePlaybookFoundation({
      userId: "tay-1",
      ownerId: "tay-1",
      role: "TRANSITION_YOUTH",
      approvalId: "approval-tay",
    });
    expect(authority.dataBoundary.policy).toBe("OWNER_SCOPED_RLS");
    expect(authority.dataBoundary.ownerId).toBe("tay-1");
    expect(authority.dataBoundary.tables).toEqual([
      "scholar_profiles",
      "scholar_goals",
      "scholar_milestones",
    ]);
    expect(authority.dataBoundary.tables).not.toContain("athlete_profiles");
  });

  it("denies cross-owner authority before a boundary is issued", () => {
    expect(() => authorizePlaybookFoundation({
      userId: "athlete-1",
      ownerId: "athlete-2",
      role: "SCHOLAR_ATHLETE",
      approvalId: "approval-athlete",
    })).toThrow("Access denied");
    expect(() => authorizePlaybookFoundation({
      userId: "tay-1",
      ownerId: "tay-2",
      role: "TRANSITION_YOUTH",
      approvalId: "approval-tay",
    })).toThrow("Access denied");
  });
});
