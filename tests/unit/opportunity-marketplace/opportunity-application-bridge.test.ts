import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "components/opportunity-marketplace/OpportunityMarketplace.tsx"), "utf8");

describe("opportunity application bridge", () => {
  it("routes only canonical published Marketplace listings into Application Workspace", () => {
    expect(source).toContain("function applicationHref(opportunity: PublishedOpportunity)");
    expect(source).toContain("new URLSearchParams({");
    expect(source).toContain("opportunityId: opportunity.id");
    expect(source).toContain("opportunityName: opportunity.title");
    expect(source).toContain("opportunityType: workspaceType(opportunity.opportunity_type)");
    expect(source).toContain('query.set("deadline", opportunity.deadline)');
    expect(source).toContain("/application-workspaces?");
    expect(source).toContain("Start Application Workspace");
  });

  it("keeps PBOS readiness guidance advisory while preserving save and dismiss decisions", () => {
    expect(source).toContain("Not a real listing.");
    expect(source).toContain("Derived guidance");
    expect(source).toContain('decide(match,"SAVED")');
    expect(source).toContain('decide(match,"DISMISSED")');

    const guidanceSection = source.slice(source.indexOf('aria-labelledby="readiness-guidance-heading"'));
    expect(guidanceSection).not.toContain("applicationHref(match)");
    expect(guidanceSection).not.toContain("Start Application Workspace →</Link>");
  });
});
