import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const PROFILE_UPSERT_SOURCES = [
  "app/start/page.tsx",
  "app/auth/callback/page.tsx",
];

describe("profiles schema contract", () => {
  it("does not upsert auth email into profiles because the migration does not define profiles.email", () => {
    const onboardingMigration = readFileSync(
      "supabase/migrations/202607070001_profile_onboarding_flow.sql",
      "utf8"
    );

    expect(onboardingMigration).not.toMatch(/add column if not exists email\b/i);

    for (const sourcePath of PROFILE_UPSERT_SOURCES) {
      const source = readFileSync(sourcePath, "utf8");
      expect(source).not.toMatch(/\n\s*email:\s*(user|data\.user)\.email/);
    }
  });
});
