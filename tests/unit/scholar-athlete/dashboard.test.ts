import { describe, expect, it } from "vitest";
import {
  calculateAthleteProfileReadiness,
  getNILNextStage,
  type AthleteProfileProjection,
} from "@/lib/scholar-athlete/dashboard";

const profile: AthleteProfileProjection = {
  id: "profile", scholarId: "scholar", sport: "Basketball", secondarySport: null,
  position: "Guard", secondaryPosition: null, graduationYear: 2028,
  athleteLevel: "high_school", governingPath: "ncaa_d1", recruitingStatus: "exploring",
  highlightUrl: "https://example.test/highlight", bio: "Student leader and guard.", location: "California",
  teams: ["Varsity"], leagues: [], awards: ["Captain"], leadershipExperience: ["Captain"],
  visibility: "recruiting", verificationState: "pending", updatedAt: "2026-08-01T00:00:00.000Z",
};

describe("Scholar-Athlete dashboard projections", () => {
  it("calculates explainable profile readiness from declared fields", () => {
    expect(calculateAthleteProfileReadiness(profile)).toEqual({ score: 100, missing: [] });
    expect(calculateAthleteProfileReadiness(null)).toEqual({ score: 0, missing: ["athlete profile"] });
  });

  it("keeps the NIL lifecycle deterministic", () => {
    expect(getNILNextStage("lead")).toBe("conversation");
    expect(getNILNextStage("review")).toBe("signed");
    expect(getNILNextStage("completed")).toBeNull();
    expect(getNILNextStage("declined")).toBeNull();
  });
});
