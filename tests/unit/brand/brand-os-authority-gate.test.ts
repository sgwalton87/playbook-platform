import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const page = fs.readFileSync(
  path.join(process.cwd(), "app/brand-partner-os/page.tsx"),
  "utf8"
);
const gate = fs.readFileSync(
  path.join(process.cwd(), "components/brand/BrandPartnerVerificationGate.tsx"),
  "utf8"
);
const api = fs.readFileSync(
  path.join(process.cwd(), "app/api/brand-verification/route.ts"),
  "utf8"
);

describe("Brand Partner OS authority gate", () => {
  it("never renders the operational Brand workspace outside the verification gate", () => {
    expect(page).toContain("<BrandPartnerVerificationGate>");
    expect(page).toContain("<BrandPartnerWorkspace />");
    expect(page.indexOf("<BrandPartnerVerificationGate>")).toBeLessThan(
      page.indexOf("<BrandPartnerWorkspace />")
    );
  });

  it("requires organization, campaign, and compliance approval before children render", () => {
    expect(gate).toContain("brandAuthorityReady");
    expect(gate).toContain("verificationStatus: request.status");
    expect(gate).toContain("hasApprovedCampaignScope: request.campaign_scope_approved");
    expect(gate).toContain("hasApprovedComplianceScope: request.compliance_scope_approved");
    expect(gate).toContain("return <>{children}</>");
  });

  it("keeps applicant submission fail-closed", () => {
    expect(api).toContain('!== "brand-partner"');
    expect(api).toContain("onboarding_completed");
    expect(api).toContain("campaign_scope_approved: false");
    expect(api).toContain("compliance_scope_approved: false");
    expect(api).toContain('status: "pending"');
  });
});
