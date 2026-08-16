import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "supabase/migrations/202608160014_support_relationship_revocation.sql"),
  "utf8"
);

describe("support relationship revocation contract", () => {
  it("preserves history instead of deleting the relationship", () => {
    expect(migration).toContain("set status = 'removed'");
    expect(migration).not.toMatch(/delete\s+from\s+public\.support_relationships/i);
  });

  it("immediately removes relationship permissions", () => {
    expect(migration).toContain("permissions = '[]'::jsonb");
  });

  it("allows only the Scholar or connected supporter to revoke", () => {
    expect(migration).toContain("actor_id <> relationship_row.scholar_id");
    expect(migration).toContain("relationship_row.supporter_id");
  });

  it("records termination audit metadata", () => {
    expect(migration).toContain("ended_at");
    expect(migration).toContain("ended_by");
    expect(migration).toContain("end_reason");
  });
});
