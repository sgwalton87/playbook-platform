import { describe, expect, it } from "vitest";
import fs from "node:fs";
import {
  getConnectedJourneyChecks,
  getManualQaPathway,
  summarizeConnectedJourney,
} from "@/lib/connected-journey";

describe("Connected Journey QA", () => {
  it("defines the connected scholar pathway", () => {
    const pathway = getManualQaPathway();

    expect(pathway).toContain("/dashboard");
    expect(pathway).toContain("/transcript");
    expect(pathway).toContain("/start");
    expect(pathway).toContain("/feed");
    expect(pathway).toContain("/albums");
    expect(pathway).toContain("/community-events");
  });

  it("summarizes QA status", () => {
    expect(summarizeConnectedJourney().pass).toBeGreaterThan(0);
  });

  it("has QA studio route", () => {
    expect(fs.existsSync("app/studio/connected-journey-qa/page.tsx")).toBe(true);
  });

  it("has branding logo component", () => {
    expect(fs.existsSync("components/brand/PlaybookLogo.tsx")).toBe(true);
  });

  it("contains checks across platform layers", () => {
    const layers = new Set(getConnectedJourneyChecks().map((check) => check.layer));

    expect(layers.has("academic")).toBe(true);
    expect(layers.has("social")).toBe(true);
    expect(layers.has("support")).toBe(true);
    expect(layers.has("economy")).toBe(true);
    expect(layers.has("trust")).toBe(true);
  });
});
