import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const exists = (file: string) => fs.existsSync(path.join(process.cwd(), file));

describe("Phase 12 Brand Partner Marketplace canonical convergence", () => {
  it("keeps Organization Profile and Campaign Builder behind verified Brand Partner authority", () => {
    const organization = read("app/brand-partner-os/organization/page.tsx");
    const campaigns = read("app/brand-partner-os/campaigns/page.tsx");
    expect(organization).toContain("BrandPartnerVerificationGate");
    expect(organization).toContain('rpc("ensure_brand_partner_organization"');
    expect(organization).toContain("Verification evidence stays preserved separately");
    expect(campaigns).toContain("BrandPartnerVerificationGate");
    expect(campaigns).toContain('rpc("create_brand_campaign_draft"');
    expect(campaigns).toContain("Campaign types cannot exceed approved verification evidence");
  });

  it("uses one canonical opportunity catalog for all six Marketplace listing types", () => {
    const manager = read("app/brand-partner-os/opportunities/page.tsx");
    const migration = read("supabase/migrations/202608160076_marketplace_opportunity_catalog.sql");
    for (const type of ["internship", "job", "sponsorship", "nil", "scholarship", "mentorship"]) {
      expect(manager).toContain(`"${type}"`);
      expect(migration).toContain(`'${type}'`);
    }
    expect(migration).toContain("marketplace_opportunities");
    expect(migration).not.toContain("create table public.marketplace_jobs");
    expect(migration).not.toContain("create table public.marketplace_scholarships");
  });

  it("keeps compliance/publication review as independent human operator authority", () => {
    const review = read("app/admin/opportunities/page.tsx");
    const migration = read("supabase/migrations/202608160076_marketplace_opportunity_catalog.sql");
    expect(review).toContain('rpc("review_marketplace_opportunity"');
    expect(review).toContain("Human review is the publication boundary");
    expect(review).toContain("Publication is not selection, compliance approval, or NIL contract approval");
    expect(migration).toContain("current_user_is_platform_operator");
  });

  it("adds explicit revocable Scholar consent before applicant visibility", () => {
    const migration = read("supabase/migrations/20260818234500_marketplace_applicant_consent_tracking.sql");
    const workspace = read("components/application-workspace/ApplicationWorkspaceDashboard.tsx");
    expect(migration).toContain("marketplace_application_shares");
    expect(migration).toContain("w.status='submitted'");
    expect(migration).toContain("consent_status='active'");
    expect(migration).toContain("consent_status='revoked'");
    expect(workspace).toContain('rpc(share ? "share_marketplace_application" : "revoke_marketplace_application_share"');
    expect(workspace).toContain("Submission does not grant access by itself");
  });

  it("limits the Brand Partner applicant view to a narrow consented projection", () => {
    const migration = read("supabase/migrations/20260818234500_marketplace_applicant_consent_tracking.sql");
    const applicants = read("app/brand-partner-os/applicants/page.tsx");
    expect(applicants).toContain('rpc("get_marketplace_applicants"');
    expect(applicants).toContain("private Application Workspace documents and the broader Scholar Record remain outside Brand Partner authority");
    expect(migration).toContain("s.consent_status='active'");
    expect(migration).not.toContain("application_workspace_documents d");
  });

  it("tracks human-recorded opportunity outcomes without turning them into automatic decisions", () => {
    const migration = read("supabase/migrations/20260818234500_marketplace_applicant_consent_tracking.sql");
    const applicants = read("app/brand-partner-os/applicants/page.tsx");
    for (const status of ["under_review", "selected", "not_selected"]) expect(migration).toContain(`'${status}'`);
    expect(applicants).toContain('rpc("set_marketplace_applicant_outcome"');
    expect(applicants).toContain("human-recorded outcome");
  });

  it("inherits Rewards from the shared reward economy instead of granting partner mint authority", () => {
    const os = read("app/brand-partner-os/page.tsx");
    const rewards = read("app/reward-economy/page.tsx");
    expect(os).toContain('href: "/reward-economy"');
    expect(os).toContain("Brand Partners never mint XP, coins, badges, or certificates directly");
    expect(rewards.length).toBeGreaterThan(50);
  });

  it("supports every canonical Marketplace application type through the shared Application Workspace", () => {
    const journey = read("lib/pbos/application-workspace-journey.ts");
    expect(journey).toContain('"sponsorship"');
    expect(journey).toContain('"mentorship"');
    const dashboard = read("components/application-workspace/ApplicationWorkspaceDashboard.tsx");
    expect(dashboard).toContain('<option value="sponsorship">Sponsorship</option>');
    expect(dashboard).toContain('<option value="mentorship">Mentorship</option>');
  });

  it("exposes the complete Phase 12 operational route set", () => {
    for (const file of [
      "app/brand-partner-os/page.tsx",
      "app/brand-partner-os/organization/page.tsx",
      "app/brand-partner-os/campaigns/page.tsx",
      "app/brand-partner-os/opportunities/page.tsx",
      "app/brand-partner-os/applicants/page.tsx",
      "app/admin/opportunities/page.tsx",
      "app/opportunities/page.tsx",
      "app/application-workspaces/page.tsx",
      "app/reward-economy/page.tsx",
    ]) expect(exists(file)).toBe(true);
  });
});