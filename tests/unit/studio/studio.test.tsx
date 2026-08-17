import { describe, expect, it } from "vitest";
import { getStudioStatus } from "@/lib/studio/studioStatus";
import StudioDashboard from "@/components/studio/StudioDashboard";

describe("Playbook Studio", () => {
  it("does not assert operational health without an observable source", () => {
    const status = getStudioStatus();
    expect(status.version).toBe("Not connected");
    expect(status.build).toBe("Not connected");
    expect(status.tests).toBe("Not connected");
    expect(status.sentinel).toBe("Not connected");
    expect(status.eventBus).toBe("Not connected");
  });

  it("dashboard component is defined", () => {
    expect(StudioDashboard).toBeTruthy();
  });
});
