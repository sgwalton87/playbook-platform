import { describe, expect, it } from "vitest";
import {
  getRecruitingPipelineSummary,
  rankRecruitingTargets,
  type RecruitingTarget,
} from "./recruitingEngine";

const target = (id: string, stage: RecruitingTarget["stage"]): RecruitingTarget => ({
  id,
  schoolName: `School ${id}`,
  stage,
});

describe("recruiting pipeline intelligence", () => {
  it("ranks the most advanced active relationship first without inventing activity", () => {
    const ranked = rankRecruitingTargets([
      target("research", "researching"),
      target("offer", "offer"),
      target("visit", "visit"),
      target("closed", "closed"),
    ]);

    expect(ranked.map((item) => item.stage)).toEqual([
      "offer",
      "visit",
      "researching",
      "closed",
    ]);
  });

  it("reports only recorded recruiting milestones", () => {
    const summary = getRecruitingPipelineSummary([
      target("one", "conversation"),
      target("two", "visit"),
      target("three", "offer"),
      target("four", "committed"),
    ]);

    expect(summary).toEqual({
      total: 4,
      conversations: 1,
      visits: 1,
      offers: 1,
      committed: 1,
    });
  });

  it("returns zeroes for an empty verified record", () => {
    expect(getRecruitingPipelineSummary([])).toEqual({
      total: 0,
      conversations: 0,
      visits: 0,
      offers: 0,
      committed: 0,
    });
  });
});
