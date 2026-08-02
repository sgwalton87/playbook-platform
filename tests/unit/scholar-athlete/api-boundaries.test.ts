import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const files = [
  "app/api/athlete/profile/route.ts",
  "app/api/athlete/recruiting/route.ts",
  "app/api/athlete/nil/route.ts",
  "app/api/athlete/nil-profile/route.ts",
  "app/api/athlete/discovery/route.ts",
  "app/api/admin/nil-compliance/route.ts",
];

describe("Athlete API boundaries", () => {
  it("does not use administrative clients or accept client ownership", () => {
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toContain("createAdminSupabaseClient");
      expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
    }
  });

  it("requires role authorization and idempotency on consequence commands", () => {
    expect(readFileSync("lib/scholar-athlete/api.ts", "utf8")).toContain('allowedRoles: ["scholar-athlete"]');
    expect(readFileSync("lib/scholar-athlete/api.ts", "utf8")).toContain("Cross-origin athlete commands are not allowed.");
    expect(readFileSync("app/api/athlete/recruiting/route.ts", "utf8")).toContain("requireIdempotencyKey");
    expect(readFileSync("app/api/athlete/nil/route.ts", "utf8")).toContain("requireIdempotencyKey");
  });
});
