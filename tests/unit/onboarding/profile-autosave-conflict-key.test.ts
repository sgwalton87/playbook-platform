import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const migration = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/202608240002_profile_safe_autosave_conflict_id_grant.sql"),
  "utf8"
);

describe("profile autosave conflict-key authority", () => {
  it("grants only the conflict-key update needed by owner-safe profile upserts", () => {
    expect(migration).toContain("grant update (id) on public.profiles to authenticated");
    expect(migration).not.toContain("grant update on public.profiles to authenticated");
    expect(migration).not.toContain("grant insert on public.profiles to authenticated");
  });
});
