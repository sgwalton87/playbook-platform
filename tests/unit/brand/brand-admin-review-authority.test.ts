import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const migration = fs.readFileSync(path.join(process.cwd(),"supabase/migrations/202610230001_brand_partner_executive_review.sql"),"utf8");
const route = fs.readFileSync(path.join(process.cwd(),"app/api/admin/brand-partners/route.ts"),"utf8");
const page = fs.readFileSync(path.join(process.cwd(),"app/admin/brand-partners/page.tsx"),"utf8");
describe("governed founder review", () => {
  it("requires active reviewer grant for queue and scoped decisions", () => {
    expect(migration).toContain("brand_partner_reviewer_grants");
    expect(migration).toContain("g.reviewer_id = auth.uid()");
    expect(migration).toContain("g.review_scope = p_scope");
    expect(migration).toContain("g.active");
    expect(migration).toContain("Self-approval prohibited");
  });
  it("records immutable review audit events and denies client grant writes", () => {
    expect(migration).toContain("brand_partner_review_audit");
    expect(migration).toContain("insert into public.brand_partner_review_audit");
    expect(migration).toContain("revoke all on public.brand_partner_reviewer_grants from anon, authenticated");
    expect(migration).toContain("revoke all on public.brand_partner_review_audit from anon, authenticated");
  });
  it("requires authenticated decision rationale and uses gated database review", () => {
    expect(route).toContain('requireUser()');
    expect(route).toContain('user.email_confirmed_at');
    expect(route).toContain('payload.reason.trim().length < 8');
    expect(route).toContain('supabase.rpc("decide_brand_partner_review"');
    expect(page).toContain('Brand Partner review queue');
    expect(page).toContain('Decision rationale');
  });
});
