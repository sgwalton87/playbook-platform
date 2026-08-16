import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/202608160016_support_relationship_rls_hardening.sql"),
  "utf8"
);
const preflight = fs.readFileSync(
  path.join(process.cwd(), "supabase/tests/relationship_authority_preflight.sql"),
  "utf8"
);

describe("support relationship RLS hardening", () => {
  it("removes the broad Scholar-created relationship bypass", () => {
    expect(migration).toContain('drop policy if exists "Scholars can create support relationships"');
    expect(migration).not.toContain('create policy "Scholars can create support relationships"');
    expect(preflight).toContain("Broad Scholar support_relationships INSERT policy is still present.");
  });

  it("consolidates participant read access with cached auth uid evaluation", () => {
    expect(migration).toContain('create policy "Relationship participants can view support relationships"');
    expect(migration).toContain("scholar_id = (select auth.uid())");
    expect(migration).toContain("supporter_id = (select auth.uid())");
  });

  it("requires every legitimate specialized relationship activation policy", () => {
    for (const policy of [
      "Family invitees can activate invited support relationships",
      "Validated mentors can activate invited support relationships",
      "Verified coaches can activate invited coach relationships",
      "Verified external supporters can activate zero-data relationships",
    ]) {
      expect(preflight).toContain(policy);
    }
  });
});
