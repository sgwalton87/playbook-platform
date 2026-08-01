import { describe, expect, it } from "vitest";
import { getRoleDashboard } from "./roleDashboards";

describe("role dashboards", () => {
  it("includes evidence preview data for learner dashboards", () => {
    const dashboard = getRoleDashboard("learner");

    expect(dashboard.evidencePreview).toBeDefined();
    expect(dashboard.evidencePreview?.[0].label).toBe("Academic readiness");
    expect(dashboard.evidencePreview?.[0].status).toBe("ready");
  });
});
