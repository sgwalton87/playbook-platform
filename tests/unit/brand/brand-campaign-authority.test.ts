import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const route = fs.readFileSync(path.join(process.cwd(), "app/api/brand-partners/campaigns/route.ts"), "utf8");
const migration = fs.readFileSync(path.join(process.cwd(), "supabase/migrations/202608160023_brand_campaign_authority_hardening.sql"), "utf8");

describe("Brand campaign authority", () => {
  it("never uses service-role access in the user-facing campaign route", () => {
    expect(route).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(route).not.toContain("createClient(");
    expect(route).toContain("requireUser");
    expect(route).toContain('role !== "brand-partner"');
  });

  it("requires all governed Brand approval conditions", () => {
    expect(route).toContain('verification.data.status !== "approved"');
    expect(route).toContain("campaign_scope_approved");
    expect(route).toContain("compliance_scope_approved");
    expect(migration).toContain("verification.status = 'approved'");
    expect(migration).toContain("verification.campaign_scope_approved is true");
    expect(migration).toContain("verification.compliance_scope_approved is true");
  });

  it("does not let Brands self-assert partner or Scholar targeting identifiers", () => {
    for (const field of ["partnerId", "scholarId", "athleteProfileId", "nilDealId", "productId"]) {
      expect(route).toContain(`\"${field}\"`);
    }
    expect(route).toContain("brand_user_id: user.id");
    expect(route).toContain("verification_request_id: authority.verification.id");
  });

  it("keeps scholar-linked NIL campaigns fail-closed", () => {
    expect(migration).toContain("revoke all on public.nil_store_campaigns from authenticated");
    expect(route).toContain('from("brand_campaign_drafts")');
    expect(route).not.toContain('from("nil_store_campaigns")');
  });
});
