import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("authorization and evidence RLS migration", () => {
  const migration = readFileSync("supabase/migrations/202608010001_authorization_evidence_lifecycle.sql", "utf8");
  it("matches application evidence permissions to active relationships", () => {
    expect(migration).toContain("sr.permissions ? 'view_evidence'");
    expect(migration).toContain("sr.permissions ? 'verify_evidence'");
    expect(migration).toContain("sr.status = 'active'");
  });
  it("only marks onboarding complete after dependent records are written", () => {
    expect(migration.indexOf("insert into public.playbook_records")).toBeLessThan(migration.indexOf("onboarding_completed=true"));
  });
});
