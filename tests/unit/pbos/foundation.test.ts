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

  it("denies cross-owner authority before a boundary is issued", () => {
    expect(() => authorizePlaybookFoundation({
      userId: "athlete-1",
      ownerId: "athlete-2",
      role: "SCHOLAR_ATHLETE",
      approvalId: "approval-athlete",
    })).toThrow("Access denied");
  });
});
