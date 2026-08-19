import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const source = fs.readFileSync(path.join(process.cwd(), "lib/supabaseClient.ts"), "utf8");

describe("production Supabase browser configuration", () => {
  it("binds missing public env vars to the canonical Playbook OS project", () => {
    expect(source).toContain('const PLAYBOOK_SUPABASE_URL = "https://oexgxnybeixwadgtdtzp.supabase.co"');
    expect(source).toContain("PLAYBOOK_SUPABASE_PUBLISHABLE_KEY");
    expect(source).not.toContain('supabaseUrl || "https://placeholder.supabase.co"');
    expect(source).not.toContain('supabaseAnonKey || "placeholder-anon-key"');
  });

  it("fails closed if placeholder credentials are ever supplied explicitly", () => {
    expect(source).toContain('supabaseUrl.includes("placeholder.supabase.co")');
    expect(source).toContain('supabaseAnonKey === "placeholder-anon-key"');
    expect(source).toContain("placeholder credentials are prohibited");
  });
});
