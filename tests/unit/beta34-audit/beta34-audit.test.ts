import { describe, expect, it } from "vitest";
import {
  getBeta34AuditChecklist,
  getBeta34AuditRoutes,
  getBeta34AuditStatus,
} from "@/lib/beta34-audit";

describe("Beta 3.4 Completion Audit", () => {
  it("returns audit routes", () => {
    expect(getBeta34AuditRoutes()).toContain("/dashboard");
  });

  it("returns audit checklist", () => {
    expect(getBeta34AuditChecklist()).toContain("Demo Mode supports founder case study");
  });

  it("returns audit status", () => {
    expect(getBeta34AuditStatus().percent).toBe(100);
  });
});
