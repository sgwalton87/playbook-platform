import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { requirePlaybookRole } from "@/lib/roles/registry";

const migration = fs.readFileSync(
  path.join(process.cwd(), "supabase/migrations/202608160020_profile_role_alias_hardening.sql"),
  "utf8"
);

describe("ambiguous role aliases fail closed", () => {
  it.each(["admin", "partner"])("does not reinterpret %s as a public Playbook role", (role) => {
    expect(() => requirePlaybookRole(role)).toThrow("Unsupported Playbook role");
  });

  it("keeps exact unambiguous administrator and partner paths available", () => {
    expect(requirePlaybookRole("district")).toBe("district");
    expect(requirePlaybookRole("school_admin")).toBe("district");
    expect(requirePlaybookRole("employer")).toBe("employer");
    expect(requirePlaybookRole("community-partner")).toBe("other");
  });

  it("removes generic admin and partner aliases from the database normalizer", () => {
    expect(migration).not.toContain("when 'admin' then 'district'");
    expect(migration).not.toContain("when 'partner' then");
    expect(migration).toContain("when 'school_admin' then 'district'");
    expect(migration).toContain("when 'community-partner' then 'other'");
  });
});
