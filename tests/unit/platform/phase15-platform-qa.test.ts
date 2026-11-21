import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PLAYBOOK_OPERATING_SYSTEMS } from "@/lib/role-os/canonicalOperatingSystems";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const phase15RoleSystems = ["SCHOLAR","SCHOLAR_ATHLETE","PARENT_GUARDIAN","TEACHER_EDUCATOR","HIGH_SCHOOL_COUNSELOR","MENTOR","HIGH_SCHOOL_COACH","COLLEGE_COACH_RECRUITER","COLLEGE_ADMISSIONS","BRAND_PARTNER","EMPLOYER","FOUNDER","ATHLETES_ABROAD"] as const;

describe("Phase 15 platform QA contract", () => {
  it("retains every canonical role journey required by final QA", () => { const ids=new Set(PLAYBOOK_OPERATING_SYSTEMS.map(system=>system.id)); for(const id of phase15RoleSystems) expect(ids.has(id)).toBe(true); });
  it("has executable desktop tablet mobile and accessibility browser QA", () => { const config=read("playwright.config.ts"); const spec=read("tests/acceptance/phase15-public-platform.spec.ts"); expect(config).toContain('name: "chromium"'); expect(config).toContain('name: "tablet"'); expect(config).toContain('name: "mobile"'); expect(spec).toContain("AxeBuilder"); expect(spec).toContain("serious"); expect(spec).toContain("critical"); });
  it("requires opt-in at dispatch and gives the suite no hosted credentials", () => {
    const workflow = read(".github/workflows/platform-qa.yml");
    const trusted = workflow.split("  scholar-e2e:")[1];
    expect(workflow).toContain("push:");
    expect(workflow).toMatch(/trusted_local_scholar:[\s\S]*?default: false/);
    expect(trusted).toContain("github.event_name == 'workflow_dispatch' && inputs.trusted_local_scholar == true");
    expect(trusted).not.toContain("secrets.");
    expect(trusted).not.toMatch(/https:\/\/[^\s]+(?:supabase|vercel)/);
    expect(workflow).not.toContain("deployment_status:");
  });

  it("asserts exact checkout and local application SHAs before running the browser", () => {
    const workflow = read(".github/workflows/platform-qa.yml");
    const trusted = workflow.split("  scholar-e2e:")[1];
    const runner = read("scripts/qa/run-trusted-scholar.mjs");
    const revisionRoute = read("app/api/deployment/route.ts");
    expect(trusted).toContain("ref: ${{ github.sha }}");
    expect(trusted).toContain("PLAYWRIGHT_BASE_URL: http://127.0.0.1:3000");
    expect(trusted).toContain("NEXT_PUBLIC_SUPABASE_URL: http://127.0.0.1:54321");
    expect(runner).toContain('["rev-parse", "HEAD"]');
    expect(runner).toContain('new URL("/api/deployment", env.PLAYWRIGHT_BASE_URL)');
    expect(runner).toContain(".commit === env.PBOS_ACCEPTANCE_COMMIT");
    expect(runner.indexOf("await assertLocalRevision(env)")).toBeLessThan(runner.indexOf('"--project=chromium"'));
    expect(revisionRoute).toContain("VERCEL_GIT_COMMIT_SHA");
    expect(revisionRoute).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(revisionRoute).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("runs the local Scholar browser journey with Mailpit and disposable teardown", () => {
    const workflow = read(".github/workflows/platform-qa.yml");
    const runner = read("scripts/qa/run-trusted-scholar.mjs");
    const spec = read("tests/acceptance/trusted-local-scholar.spec.ts");
    expect(workflow).toContain("Block external SMTP on the disposable runner");
    expect(workflow).toContain("PBOS_QA_MAIL_URL: http://127.0.0.1:54324");
    expect(runner).toContain("prepare-local-supabase-migrations.mjs");
    expect(runner).toContain('["stop", "--no-backup"]');
    expect(runner).toContain("trusted-local-scholar.spec.ts");
    expect(spec).toContain("/auth/v1/signup");
    expect(spec).toContain("/api/v1/messages");
    expect(spec).toContain("/auth/v1/verify");
  });
  it("generates ephemeral role identities inside trusted acceptance specs", () => { const scholar=read("tests/acceptance/pbos-scholar.spec.ts"); const athlete=read("tests/acceptance/pbos-scholar-athlete.spec.ts"); const family=read("tests/acceptance/family-consent.spec.ts"); for (const spec of [scholar, athlete, family]) { expect(spec).toContain("randomUUID"); expect(spec).toContain("randomBytes"); expect(spec).toContain("deleteUser"); } });
  it("uploads only allowlisted browser evidence linked to the same inventory revision", () => {
    const workflow = read(".github/workflows/platform-qa.yml");
    const runner = read("scripts/qa/run-trusted-scholar.mjs");
    expect(workflow).not.toMatch(/(?:statuses|issues): write/);
    expect(workflow).toContain("pbos-capability-ledger-${{ github.sha }}");
    expect(workflow).toContain("trusted-local-scholar-${{ github.sha }}");
    expect(workflow).toContain("artifacts/trusted-local-scholar/evidence.json");
    expect(workflow).not.toContain("artifacts/playwright");
    expect(runner).toContain("roleCertified: false");
    expect(runner).toContain("record:private-profile");
    expect(runner).toContain("roles:scholar-os");
  });

  it("keeps public browser QA as a pull-request gate", () => { const workflow=read(".github/workflows/platform-qa.yml"); expect(workflow).toContain("pull_request:"); expect(workflow).toContain("phase15-public-platform.spec.ts"); });
});
