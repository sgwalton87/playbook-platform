import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("FAFSA tracker authority", () => {
  it("keeps the tracker owner scoped and excludes anonymous access", () => {
    const sql = read("supabase/migrations/20260818194500_fafsa_tracker_authority.sql");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("auth.uid()) = user_id");
    expect(sql).toContain("revoke all on public.fafsa_tracker from anon");
  });

  it("tracks milestones rather than storing sensitive federal-aid credentials", () => {
    const sql = read("supabase/migrations/20260818194500_fafsa_tracker_authority.sql");
    const page = read("app/fafsa/page.tsx");
    expect(sql).not.toMatch(/social_security|ssn|password|bank_account|tax_return/i);
    expect(page).toContain("Do not enter SSNs");
    expect(page).toContain("StudentAid.gov");
  });

  it("provides a governed learner route without replacing Academic Readiness", () => {
    const fafsa = read("app/fafsa/page.tsx");
    const readiness = read("app/academic-readiness/page.tsx");
    expect(fafsa).toContain('href="/academic-readiness"');
    expect(fafsa).toContain('from("fafsa_tracker")');
    expect(readiness).toContain("Compass-ready recommendation");
    expect(readiness).toContain("snapshot.primaryRecommendation.actionRoute");
  });
});
