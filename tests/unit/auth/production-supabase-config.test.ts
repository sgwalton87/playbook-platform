import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const config = read("lib/supabase/publicConfig.ts");
const browser = read("lib/supabaseClient.ts");
const server = read("lib/supabase/server.ts");

describe("production Supabase public configuration", () => {
  it("binds missing public env vars to the canonical Playbook OS project", () => {
    expect(config).toContain('const PLAYBOOK_SUPABASE_URL = "https://oexgxnybeixwadgtdtzp.supabase.co"');
    expect(config).toContain("PLAYBOOK_SUPABASE_PUBLISHABLE_KEY");
    expect(config).toContain("configuredUrl || PLAYBOOK_SUPABASE_URL");
    expect(config).toContain("configuredKey || PLAYBOOK_SUPABASE_PUBLISHABLE_KEY");
    expect(config).not.toContain('|| "https://placeholder.supabase.co"');
    expect(config).not.toContain('|| "placeholder-anon-key"');
  });

  it("fails closed if placeholder credentials are ever supplied explicitly", () => {
    expect(config).toContain('url.includes("placeholder.supabase.co")');
    expect(config).toContain('publishableKey === "placeholder-anon-key"');
    expect(config).toContain("placeholder credentials are prohibited");
  });

  it("uses the same canonical public configuration for browser and server auth clients", () => {
    expect(browser).toContain('getPlaybookPublicSupabaseConfig');
    expect(server).toContain('getPlaybookPublicSupabaseConfig');
    expect(server).not.toContain('process.env.NEXT_PUBLIC_SUPABASE_URL!');
    expect(server).not.toContain('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!');
  });
});
