import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const exists = (file: string) => fs.existsSync(path.join(process.cwd(), file));

describe("Phase 10 Recruiting canonical convergence", () => {
  it("fulfills Athlete Profile and Film through one canonical athlete profile", () => {
    const profile = read("app/recruiting/profile/page.tsx");
    expect(profile).toContain('from("athlete_profiles")');
    expect(profile).toContain("highlight_url");
    expect(profile).toContain("sport");
    expect(profile).toContain("position");
  });

  it("fulfills Measurements and Statistics through the shared athletic evidence service", () => {
    const evidence = read("app/recruiting/evidence/page.tsx");
    expect(evidence).toContain('type EvidenceCategory = "measurement" | "statistic"');
    expect(evidence).toContain('from("athlete_evidence")');
    expect(evidence).toContain("verification_state");
    expect(evidence).toContain("source_type");
  });

  it("keeps Eligibility source-backed and evidence-aware", () => {
    const eligibility = read("app/recruiting/eligibility/page.tsx");
    expect(eligibility).toContain('from("athlete_eligibility_rulesets")');
    expect(eligibility).toContain("evaluateSourceBackedEligibilityReadiness");
    expect(eligibility).toContain("athlete_evidence");
    expect(eligibility).toContain("certification_authority");
  });

  it("fulfills Coach Connections and Recruiter Search through one verified recruiting directory", () => {
    const connections = read("app/recruiting/connections/page.tsx");
    expect(connections).toContain('from("support_directory_profiles")');
    expect(connections).toContain('["coach", "college_recruiter"]');
    expect(connections).toContain("Coach Connections + Recruiter Search");
    expect(connections).toContain("Verified identity is not data permission");
  });

  it("fulfills College Targets through the canonical recruiting pipeline", () => {
    const recruiting = read("app/recruiting/page.tsx");
    expect(recruiting).toContain('from("recruiting_targets")');
    expect(recruiting).toContain("Add a school or program");
    expect(recruiting).toContain("Your recruiting targets");
    expect(recruiting).toContain("updateStage");
  });

  it("keeps Visits attached to recruiting targets", () => {
    const visits = read("app/recruiting/visits/page.tsx");
    expect(visits).toContain('from("recruiting_visits")');
    expect(visits).toContain('from("recruiting_targets")');
    expect(visits).toContain("recruiting_target_id");
  });

  it("keeps Offers traceable to targets and evidence", () => {
    const offers = read("app/recruiting/offers/page.tsx");
    expect(offers).toContain('from("recruiting_offers")');
    expect(offers).toContain('from("athlete_evidence")');
    expect(offers).toContain("verification_state");
    expect(offers).toContain("supersedes_offer_id");
  });

  it("keeps Recruiting Timeline as living evidence of pipeline changes", () => {
    const timeline = read("app/recruiting/timeline/page.tsx");
    expect(timeline).toContain('from("recruiting_target_events")');
    expect(timeline).toContain("Living evidence");
    expect(timeline).toContain("stage_change");
  });

  it("fulfills NIL Readiness through the governed NIL deal lifecycle", () => {
    const nil = read("app/recruiting/nil/page.tsx");
    expect(nil).toContain('from("nil_deals")');
    expect(nil).toContain("evaluateNILDealReadiness");
    expect(nil).toContain("contract_status");
    expect(nil).toContain("disclosure_status");
    expect(nil).toContain("payment_status");
  });

  it("keeps advertised Recruiting aliases functional without duplicating implementations", () => {
    expect(exists("app/recruiting/targets/page.tsx")).toBe(true);
    expect(exists("app/recruiting/people/page.tsx")).toBe(true);
    expect(read("app/recruiting/targets/page.tsx")).toContain('redirect("/recruiting")');
    expect(read("app/recruiting/people/page.tsx")).toContain('redirect("/recruiting/connections")');
  });

  it("has a working route for every Phase 10 canonical experience", () => {
    for (const file of [
      "app/recruiting/page.tsx",
      "app/recruiting/profile/page.tsx",
      "app/recruiting/evidence/page.tsx",
      "app/recruiting/eligibility/page.tsx",
      "app/recruiting/connections/page.tsx",
      "app/recruiting/visits/page.tsx",
      "app/recruiting/offers/page.tsx",
      "app/recruiting/timeline/page.tsx",
      "app/recruiting/nil/page.tsx",
    ]) {
      expect(exists(file)).toBe(true);
    }
  });
});
