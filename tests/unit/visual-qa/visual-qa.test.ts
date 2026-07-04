import { describe, expect, it } from "vitest";
import {
  getResponsiveQaChecklist,
  getUnifiedExperienceRoutes,
  getVisualQaStatus,
} from "@/lib/visual-qa";

describe("Unified Experience Visual QA", () => {
  it("tracks route checklist", () => {
    expect(getUnifiedExperienceRoutes()).toContain("/messages");
    expect(getUnifiedExperienceRoutes()).toContain("/scholar-athlete-os");
  });

  it("tracks responsive checklist", () => {
    expect(getResponsiveQaChecklist().length).toBeGreaterThan(0);
  });

  it("returns QA status", () => {
    expect(getVisualQaStatus().percent).toBe(100);
  });
});
