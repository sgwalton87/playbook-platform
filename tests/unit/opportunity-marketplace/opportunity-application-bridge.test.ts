import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const source = readFileSync(join(process.cwd(), "components/opportunity-marketplace/OpportunityMarketplace.tsx"), "utf8");

describe("opportunity application bridge", () => {
  it("routes matched opportunities into the canonical application workspace", () => {
    expect(source).toContain("/application-workspaces?");
    expect(source).toContain("opportunityId=");
    expect(source).toContain("opportunityName=");
    expect(source).toContain("opportunityType=");
    expect(source).toContain("Start application");
  });

  it("preserves save and dismiss decisions alongside the application action", () => {
    expect(source).toContain('decide(match, "SAVED")');
    expect(source).toContain('decide(match, "DISMISSED")');
  });
});
