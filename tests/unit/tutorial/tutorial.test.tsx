import { describe, expect, it } from "vitest";
import { getFirstLoginTutorial, getTutorialProgress } from "@/lib/tutorial";
import FirstLoginTour from "@/components/tutorial/FirstLoginTour";

describe("Tutorial", () => {
  it("returns first login steps", () => {
    expect(getFirstLoginTutorial().length).toBeGreaterThan(0);
  });

  it("tracks progress", () => {
    expect(getTutorialProgress(["home"])).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(FirstLoginTour).toBeTruthy();
  });
});
