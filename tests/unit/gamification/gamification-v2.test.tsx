import { describe, expect, it } from "vitest";
import { awardCoins, getCoinBalance, getCoinValue } from "@/lib/gamification";
import GamificationCenter from "@/components/gamification/GamificationCenter";

describe("Gamification v2", () => {
  it("awards coins for completed course", () => {
    expect(getCoinValue("course.completed")).toBe(100);
  });

  it("builds coin award", () => {
    expect(awardCoins({ scholarId: "scholar-1", action: "goal.completed" }).coins).toBe(150);
  });

  it("calculates balance", () => {
    expect(getCoinBalance()).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(GamificationCenter).toBeTruthy();
  });
});
