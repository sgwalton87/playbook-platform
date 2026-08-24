import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PLAYBOOK_OPERATING_SYSTEMS } from "@/lib/role-os/canonicalOperatingSystems";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const phase15RoleSystems = ["SCHOLAR","SCHOLAR_ATHLETE","PARENT_GUARDIAN","TEACHER_EDUCATOR","HIGH_SCHOOL_COUNSELOR","MENTOR","HIGH_SCHOOL_COACH","COLLEGE_COACH_RECRUITER","COLLEGE_ADMISSIONS","BRAND_PARTNER","EMPLOYER","FOUNDER","ATHLETES_ABROAD"] as const;

describe("Phase 15 platform QA contract", () => {
  it("retains every canonical role journey required by final QA", () => { const ids=new Set(PLAYBOOK_OPERATING_SYSTEMS.map(system=>system.id)); for(const id of phase15RoleSystems) expect(ids.has(id)).toBe(true); });
  it("has executable desktop tablet mobile and accessibility browser QA", () => { const config=read("playwright.config.ts"); const spec=read("tests/acceptance/phase15-public-platform.spec.ts"); expect(config).toContain('name: "chromium"'); expect(config).toContain('name: "tablet"'); expect(config).toContain('name: "mobile"'); expect(spec).toContain("AxeBuilder"); expect(spec).toContain("serious"); expect(spec).toContain("critical"); });
  it("keeps privileged role acceptance on main push with a minimal GitHub secret boundary", () => {
    const workflow=read(".github/workflows/platform-qa.yml");
    expect(workflow).toContain("push:");
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain("github.event_name == 'push'");
    expect(workflow).toContain("github.event_name == 'workflow_dispatch'");
    expect(workflow).toContain("SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}");
    expect(workflow).toContain("https://oexgxnybeixwadgtdtzp.supabase.co");
    expect(workflow).not.toContain("deployment_status:");
    expect(workflow).not.toContain("PBOS_CONNECTOR_SECRET_BASE64: ${{ secrets.");
    expect(workflow).not.toContain("PBOS_API_URL: ${{ secrets.");
    expect(workflow).not.toContain("PBOS_ACCEPTANCE_EMAIL");
    expect(workflow).not.toContain("PBOS_ACCEPTANCE_PASSWORD");
  });
  it("waits for the exact production SHA through the readable production alias before trusted role acceptance", () => {
    const workflow=read(".github/workflows/platform-qa.yml");
    const trusted=workflow.split("  scholar-e2e:")[1] || "";
    const revisionRoute=read("app/api/deployment/route.ts");
    expect(trusted).toContain("https://the-playbook-five.vercel.app");
    expect(trusted).not.toContain("https://the-playbook-git-main-pbos-genesis.vercel.app");
    expect(trusted).toContain("Wait for exact production revision");
    expect(trusted).toContain("/api/deployment");
    expect(trusted).toContain('DEPLOYED_SHA" = "$PBOS_ACCEPTANCE_COMMIT');
    expect(trusted).toContain("stage:production-revision");
    expect(trusted).not.toContain("npm start > /tmp/playbook-next.log");
    expect(trusted).not.toContain("PLAYWRIGHT_BASE_URL: http://127.0.0.1:3000");
    expect(revisionRoute).toContain("VERCEL_GIT_COMMIT_SHA");
    expect(revisionRoute).toContain('"Cache-Control": "no-store, max-age=0"');
    expect(revisionRoute).not.toContain("PBOS_");
    expect(revisionRoute).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });
  it("runs Scholar Scholar-Athlete and Family as trusted governed journeys", () => { const workflow=read(".github/workflows/platform-qa.yml"); expect(workflow).toContain("Run governed Scholar journey"); expect(workflow).toContain("Run governed Scholar-Athlete journey"); expect(workflow).toContain("Run governed Family journey"); expect(workflow).toContain("family-consent.spec.ts"); expect(workflow).toContain("stage:family"); expect(workflow).toContain("Publish Family failure"); });
  it("generates ephemeral role identities inside trusted acceptance specs", () => { const scholar=read("tests/acceptance/pbos-scholar.spec.ts"); const athlete=read("tests/acceptance/pbos-scholar-athlete.spec.ts"); const family=read("tests/acceptance/family-consent.spec.ts"); for (const spec of [scholar, athlete, family]) { expect(spec).toContain("randomUUID"); expect(spec).toContain("randomBytes"); expect(spec).toContain("deleteUser"); } });
  it("publishes machine-readable staged trusted role QA status on the exact production commit", () => { const workflow=read(".github/workflows/platform-qa.yml"); expect(workflow).toContain("statuses: write"); expect(workflow).toContain("issues: write"); expect(workflow).toContain("playbook/phase15-role-e2e"); expect(workflow).toContain("PBOS_ACCEPTANCE_COMMIT"); expect(workflow).toContain("stage:configuration"); expect(workflow).toContain("stage:production-revision"); expect(workflow).toContain("stage:scholar"); expect(workflow).toContain("stage:scholar-athlete"); expect(workflow).toContain("stage:family"); expect(workflow).toContain("scholar-failure-summary.json"); expect(workflow).toContain("gh issue comment 234"); });
  it("keeps public browser QA as a pull-request gate", () => { const workflow=read(".github/workflows/platform-qa.yml"); expect(workflow).toContain("pull_request:"); expect(workflow).toContain("phase15-public-platform.spec.ts"); });
});
