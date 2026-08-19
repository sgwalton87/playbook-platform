import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PLAYBOOK_OPERATING_SYSTEMS } from "@/lib/role-os/canonicalOperatingSystems";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

const phase15RoleSystems = [
  "SCHOLAR",
  "SCHOLAR_ATHLETE",
  "PARENT_GUARDIAN",
  "TEACHER_EDUCATOR",
  "HIGH_SCHOOL_COUNSELOR",
  "MENTOR",
  "HIGH_SCHOOL_COACH",
  "COLLEGE_COACH_RECRUITER",
  "COLLEGE_ADMISSIONS",
  "BRAND_PARTNER",
  "EMPLOYER",
  "FOUNDER",
  "ATHLETES_ABROAD",
] as const;

describe("Phase 15 platform QA contract", () => {
  it("retains every canonical role journey required by final QA", () => {
    const ids = new Set(PLAYBOOK_OPERATING_SYSTEMS.map((system) => system.id));
    for (const id of phase15RoleSystems) expect(ids.has(id)).toBe(true);
  });

  it("has executable desktop tablet mobile and accessibility browser QA", () => {
    const config = read("playwright.config.ts");
    const spec = read("tests/acceptance/phase15-public-platform.spec.ts");
    expect(config).toContain('name: "chromium"');
    expect(config).toContain('name: "tablet"');
    expect(config).toContain('name: "mobile"');
    expect(spec).toContain("AxeBuilder");
    expect(spec).toContain("serious");
    expect(spec).toContain("critical");
  });

  it("keeps privileged role acceptance out of untrusted pull-request execution", () => {
    const workflow = read(".github/workflows/platform-qa.yml");
    expect(workflow).toContain("push:");
    expect(workflow).toContain("github.ref == 'refs/heads/main'");
    expect(workflow).toContain("github.event_name == 'push'");
    expect(workflow).toContain("github.event_name == 'workflow_dispatch'");
    expect(workflow).toContain("SUPABASE_SERVICE_ROLE_KEY");
    expect(workflow).toContain("Run governed Scholar journey");
    expect(workflow).toContain("Run governed Scholar-Athlete journey");
    expect(workflow).toContain("PBOS_ACCEPTANCE_ATHLETE_EMAIL");
  });

  it("makes public browser QA a pull-request gate", () => {
    const workflow = read(".github/workflows/platform-qa.yml");
    expect(workflow).toContain("pull_request:");
    expect(workflow).toContain("phase15-public-platform.spec.ts");
  });
});
