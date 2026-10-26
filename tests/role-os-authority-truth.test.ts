import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildAthleteNextActions } from "@/lib/scholar-athlete";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("role OS authority and truth audit", () => {
  it("gates Scholar, Scholar-Athlete, and Athlete Abroad by canonical role", () => {
    expect(read("app/dashboard/page.tsx")).toContain('CanonicalRoleAuthorityGate role="scholar"');
    expect(read("app/scholar-athlete-os/page.tsx")).toContain('CanonicalRoleAuthorityGate role="scholar-athlete"');
    const athleteAbroad = read("app/athlete-abroad-os/layout.tsx");
    const identity = athleteAbroad.indexOf('CanonicalRoleIdentityBoundary role="athlete-abroad"');
    const readiness = athleteAbroad.indexOf("<AthleteAbroadReadinessGate>");
    expect(identity).toBeGreaterThan(-1);
    expect(readiness).toBeGreaterThan(identity);
    expect(read("app/athlete-abroad-os/page.tsx")).not.toContain("<CanonicalRoleAuthorityGate");
    const approval = read("components/athlete-abroad/AthleteAbroadReadinessGate.tsx");
    expect(approval).toContain('review.review_status === "approved" && review.jurisdiction_scope_status === "approved"');
  });

  it("uses canonical recruiting visits instead of deriving visits from target stage", () => {
    const dashboard = read("components/scholar-athlete/ScholarAthleteDashboard.tsx");
    expect(dashboard).toContain('from("recruiting_visits").select("id")');
    expect(dashboard).toContain('label="Recruiting visits"');
    expect(dashboard).not.toContain('label="Campus visits" value={`${recruiting.visits} recorded`}');
  });

  it("does not invent financial plan incompletion or unavailable metrics", () => {
    const dashboard = read("components/scholar-athlete/ScholarAthleteDashboard.tsx");
    const intelligence = read("lib/scholar-athlete/athleteIntelligence.ts");
    expect(dashboard).toContain("financialPlanComplete: null");
    expect(dashboard).toContain('return "Unavailable"');
    expect(intelligence).toContain("financialPlanComplete: boolean | null");
    expect(intelligence).toContain("input.financialPlanComplete === false");
  });

  it("keeps unknown eligibility and financial readiness non-consequential", () => {
    expect(buildAthleteNextActions({
      eligibilityStatus: null,
      recruitingTargets: 1,
      activeDeals: 1,
      financialPlanComplete: null,
    })).toEqual([]);
  });
});
