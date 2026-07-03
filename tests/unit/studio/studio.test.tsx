import { describe, expect, it } from "vitest";
import { getStudioStatus } from "@/lib/studio/studioStatus";
import StudioDashboard from "@/components/studio/StudioDashboard";

describe("Playbook Studio", () => {
  it("returns studio status", () => {
    const status = getStudioStatus();
    expect(status.version).toContain("Playbook OS");
    expect(status.build).toBe("Green");
  });

  it("dashboard component is defined", () => {
    expect(StudioDashboard).toBeTruthy();
  });
});
