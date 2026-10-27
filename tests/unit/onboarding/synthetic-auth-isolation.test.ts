// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { assertLocalSyntheticAuthTarget } from "@/tests/acceptance/helpers/assertLocalSyntheticAuthTarget.mjs";

const local = {
  PBOS_ALLOW_SYNTHETIC_AUTH_WRITE: "YES",
  PLAYWRIGHT_BASE_URL: "http://127.0.0.1:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:55421",
};

describe("synthetic authentication isolation", () => {
  it("accepts explicitly approved localhost targets", () => {
    expect(() => assertLocalSyntheticAuthTarget(local)).not.toThrow();
  });
  it.each([
    { PBOS_ALLOW_SYNTHETIC_AUTH_WRITE: undefined },
    { PBOS_ALLOW_SYNTHETIC_AUTH_WRITE: "NO" },
    { PLAYWRIGHT_BASE_URL: "https://app.playbookseriesinc.org" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://oexgxnybeixwadgtdtzp.supabase.co" },
    { NEXT_PUBLIC_SUPABASE_URL: "https://another-project.supabase.co" },
    { PLAYWRIGHT_BASE_URL: "https://localhost.attacker.invalid" },
    { NEXT_PUBLIC_SUPABASE_URL: "http://localhost@remote.invalid" },
    { NEXT_PUBLIC_SUPABASE_URL: "ftp://localhost" },
    { NEXT_PUBLIC_SUPABASE_URL: "not-a-url" },
    { NEXT_PUBLIC_SUPABASE_URL: undefined },
    { NEXT_PUBLIC_SUPABASE_URL: "http://credential:secret@localhost:55421" },
  ])("rejects unsafe or unapproved configuration without echoing credentials: %j", override => {
    expect(() => assertLocalSyntheticAuthTarget({ ...local, ...override })).toThrow("Synthetic auth writes require explicit approval and localhost application/database targets.");
  });
  it("guards every acceptance administrative client before construction", () => {
    const specs = readdirSync("tests/acceptance").filter(name => name.endsWith(".spec.ts"));
    let guarded = 0;
    for (const name of specs) {
      const source = readFileSync(`tests/acceptance/${name}`, "utf8");
      for (const declaration of source.matchAll(/const admin = createClient\(/g)) {
        expect(source.slice(0, declaration.index).trimEnd(), name).toMatch(/assertLocalSyntheticAuthTarget\(\);$/);
        guarded++;
      }
    }
    expect(guarded).toBeGreaterThan(20);
  });
  it.each([false, true])("executes the workflow preflight and rejects production even with the write flag: production=%s", production => {
    const workflow = readFileSync(".github/workflows/platform-qa.yml", "utf8");
    const section = workflow.slice(workflow.indexOf("- name: Require trusted acceptance configuration"));
    const inline = section.match(/node <<'NODE'\n([\s\S]*?)\n\s*NODE/);
    expect(inline).not.toBeNull();
    const target = "https://oexgxnybeixwadgtdtzp.supabase.co";
    const result = spawnSync(process.execPath, ["-e", inline![1]], {
      env: { ...local, NEXT_PUBLIC_SUPABASE_URL: production ? target : local.NEXT_PUBLIC_SUPABASE_URL },
      encoding: "utf8",
    });
    expect(result.status).toBe(production ? 1 : 0);
    expect(result.stderr).not.toContain(target);
  });
  it("blocks the old production-targeted main workflow during configuration, before checkout or account creation", () => {
    const workflow = readFileSync(".github/workflows/platform-qa.yml", "utf8");
    const section = workflow.slice(workflow.indexOf("- name: Require trusted acceptance configuration"));
    expect(section.indexOf("explicitly approved localhost")).toBeGreaterThan(0);
    expect(section.indexOf("explicitly approved localhost")).toBeLessThan(section.indexOf("- name: Check out acceptance revision"));
    expect(section).toContain("PBOS_ALLOW_SYNTHETIC_AUTH_WRITE !== 'YES'");
    expect(section).toContain("['localhost', '127.0.0.1'].includes(target.hostname)");
  });
});
