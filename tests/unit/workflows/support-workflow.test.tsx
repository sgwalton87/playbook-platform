import { describe, expect, it } from "vitest";
import { getCompletedWorkflowCount, getSupportWorkflow } from "@/lib/workflows";
import SupportWorkflowTracker from "@/components/workflows/SupportWorkflowTracker";

describe("Support Workflow Tracker", () => {
  it("returns workflow steps", () => {
    expect(getSupportWorkflow().steps.length).toBe(7);
  });

  it("counts completed steps", () => {
    expect(getCompletedWorkflowCount()).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(SupportWorkflowTracker).toBeTruthy();
  });
});
