import { describe, expect, it } from "vitest";
import { AUDIT_CONTROL_CHECKS } from "@/pbos/audit-control/manifest";
import { runAuditControl } from "@/pbos/audit-control/run";

describe("PBOS Audit Control", () => {
  it("keeps check identifiers unique", () => {
    const ids = AUDIT_CONTROL_CHECKS.map((check) => check.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers architecture, database, routing, security, and observability", () => {
    const categories = new Set(AUDIT_CONTROL_CHECKS.map((check) => check.category));
    expect(categories).toEqual(new Set(["architecture", "database", "routing", "security", "observability"]));
  });

  it("passes every current audit invariant", () => {
    const report = runAuditControl();
    expect(report.failed, JSON.stringify(report.results.filter((result) => !result.ok), null, 2)).toBe(0);
    expect(report.ok).toBe(true);
  });
});
