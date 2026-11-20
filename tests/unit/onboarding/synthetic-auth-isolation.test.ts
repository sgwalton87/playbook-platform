// @vitest-environment node
import { readFileSync, readdirSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assertTrustedRunner, runDisposableLifecycle } from "@/scripts/qa/run-trusted-scholar.mjs";
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
  const disposable = {
    ...local,
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    PBOS_QA_MAIL_URL: "http://127.0.0.1:54324",
    PBOS_ACCEPTANCE_COMMIT: "a".repeat(40),
    GITHUB_ACTIONS: "true",
    RUNNER_ENVIRONMENT: "github-hosted",
    GITHUB_EVENT_NAME: "workflow_dispatch",
    RUNNER_TEMP: "/tmp/runner",
  };

  it("only provisions the explicitly opted-in dispatch from a disposable runner", () => {
    const workflow = readFileSync(".github/workflows/platform-qa.yml", "utf8");
    const trusted = workflow.slice(workflow.indexOf("  scholar-e2e:"));
    expect(workflow).toMatch(/trusted_local_scholar:[\s\S]*?default: false/);
    expect(trusted).toContain("github.event_name == 'workflow_dispatch' && inputs.trusted_local_scholar == true");
    expect(trusted).toContain("persist-credentials: false");
    expect(trusted).toContain("node scripts/qa/run-trusted-scholar.mjs");
    expect(trusted).not.toMatch(/secrets\.|https:\/\/[^\s]+supabase|https:\/\/[^\s]+vercel/);
    expect(() => assertTrustedRunner(disposable)).not.toThrow();
  });

  it.each([
    { PBOS_ALLOW_SYNTHETIC_AUTH_WRITE: undefined },
    { NEXT_PUBLIC_SUPABASE_URL: "https://hosted.example" },
    { PLAYWRIGHT_BASE_URL: "https://hosted.example" },
    { NEXT_PUBLIC_SUPABASE_URL: "http://name:credential@127.0.0.1:54321" },
    { PBOS_QA_MAIL_URL: "https://hosted.example" },
    { PBOS_QA_MAIL_URL: "http://name@127.0.0.1:54324" },
    { RUNNER_ENVIRONMENT: "self-hosted" },
    { GITHUB_EVENT_NAME: "pull_request" },
    { PBOS_ACCEPTANCE_COMMIT: "main" },
  ])("denies unsafe runner configuration %j", override => {
    expect(() => assertTrustedRunner({ ...disposable, ...override })).toThrow();
  });

  it.each(["none", "start", "run"])("tears down after the %s path", async failure => {
    const phases: string[] = [];
    const lifecycle = runDisposableLifecycle({
      start: async () => { phases.push("start"); if (failure === "start") throw new Error("start"); },
      run: async () => { phases.push("run"); if (failure === "run") throw new Error("run"); },
      stop: async () => { phases.push("stop"); },
    });
    if (failure === "none") await expect(lifecycle).resolves.toBeUndefined();
    else await expect(lifecycle).rejects.toThrow(failure);
    expect(phases).toEqual(failure === "start" ? ["start", "stop"] : ["start", "run", "stop"]);
  });
});
