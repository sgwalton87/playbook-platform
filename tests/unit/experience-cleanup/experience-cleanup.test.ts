import { describe, expect, it } from "vitest";
import {
  getExperienceMode,
  getExperienceModeLabel,
  getRoleHomeRoute,
} from "@/lib/experience-cleanup";

describe("Unified Experience Cleanup", () => {
  it("labels foundation pages", () => {
    expect(getExperienceMode("/economy")).toBe("foundation");
    expect(getExperienceModeLabel("foundation")).toBe("Foundation Preview");
  });

  it("labels demo and studio pages", () => {
    expect(getExperienceMode("/demo/founder-case-study")).toBe("demo");
    expect(getExperienceMode("/studio")).toBe("studio");
  });

  it("routes founder and scholar roles", () => {
    expect(getRoleHomeRoute("founder")).toBe("/studio");
    expect(getRoleHomeRoute("scholar_athlete")).toBe("/scholar-athlete-os");
    expect(getRoleHomeRoute("family")).toBe("/family-os");
  });
});
