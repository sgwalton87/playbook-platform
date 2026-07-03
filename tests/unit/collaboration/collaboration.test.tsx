import { describe, expect, it } from "vitest";
import { getRoleAction, getSharedOpportunityPlan } from "@/lib/collaboration";
import CollaborationLayer from "@/components/collaboration/CollaborationLayer";

describe("Role OS Collaboration Layer", () => {
  it("returns one shared plan with seven role actions", () => {
    expect(getSharedOpportunityPlan().roleActions.length).toBe(7);
  });

  it("returns mentor-specific action", () => {
    expect(getRoleAction("mentor")?.title).toContain("Practice");
  });

  it("component is defined", () => {
    expect(CollaborationLayer).toBeTruthy();
  });
});
