import { describe, expect, it } from "vitest";
import {
  getArchitectureNodes,
  getDocumentationModules,
  getReleaseChecks,
  getSDKModules,
  getSystemMapLayers,
  getThemes,
} from "@/lib/studio/operations";

describe("Studio Operations", () => {
  it("returns architecture nodes", () => expect(getArchitectureNodes().length).toBeGreaterThan(0));
  it("returns docs", () => expect(getDocumentationModules().length).toBeGreaterThan(0));
  it("returns release checks", () => expect(getReleaseChecks().every(c => c.status === "green")).toBe(true));
  it("returns sdk modules", () => expect(getSDKModules()).toContain("Academic"));
  it("returns themes", () => expect(getThemes().length).toBeGreaterThan(0));
  it("returns system map layers", () => expect(getSystemMapLayers()).toContain("Playbook Studio"));
});
