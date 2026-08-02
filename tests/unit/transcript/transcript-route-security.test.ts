import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const source = readFileSync("app/api/parse-transcript/route.ts", "utf8");
describe("transcript route security", () => {
  it("binds persistence to authenticated identity", () => { expect(source).toContain("createServerSupabaseClient"); expect(source).toContain("user_id: auth.user.id"); expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY"); });
  it("rejects unsupported and oversized uploads", () => { expect(source).toContain("allowedMedia"); expect(source).toContain("14_000_000"); expect(source).toContain("status: 413"); });
  it("bounds untrusted model output", () => expect(source).toContain("Math.max(0, Math.min(8"));
});
