import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");
const exists = (file: string) => fs.existsSync(path.join(process.cwd(), file));

describe("Phase 9 Academic canonical convergence", () => {
  it("exposes all 12 canonical Academic capabilities from one hub", () => {
    const hub = read("app/academic/page.tsx");
    for (const capability of [
      "Transcript Upload",
      "Transcript Parsing",
      "A-G Tracker",
      "FAFSA Tracker",
      "Scholarships",
      "College Search",
      "Dream Schools",
      "Top Schools",
      "Application Deadlines",
      "Application Tracker",
      "Academic Readiness",
      "Compass Recommendations",
    ]) {
      expect(hub).toContain(capability);
    }
    expect(hub).toContain("Shared services");
    expect(hub).toContain("Scholar Record first");
  });

  it("keeps transcript upload, parsing, confirmation, and A-G in one governed journey", () => {
    const transcript = read("app/transcript/page.tsx");
    const upload = read("components/transcript/TranscriptUploadCard.tsx");
    expect(transcript).toContain("TranscriptUploadCard");
    expect(transcript).toContain("AG_REQUIREMENTS");
    expect(upload).toContain('/api/parse-transcript');
    expect(upload).toContain('/api/confirm-transcript');
    expect(upload).toContain("Scholar review required");
    expect(exists("app/api/parse-transcript/route.ts")).toBe(true);
    expect(exists("app/api/confirm-transcript/route.ts")).toBe(true);
  });

  it("keeps FAFSA on its dedicated privacy-bounded tracker", () => {
    const fafsa = read("app/fafsa/page.tsx");
    expect(fafsa).toContain('from("fafsa_tracker")');
    expect(fafsa).toContain("Privacy boundary");
    expect(fafsa).toContain("router.replace(\"/login\")");
  });

  it("uses the governed opportunity system for scholarships", () => {
    const scholarships = read("app/scholarships/page.tsx");
    expect(scholarships).toContain("scholarship");
    expect(scholarships).not.toContain('from("scholarship_list")');
  });

  it("keeps College Search, Dream Schools, and Top Schools on college_list", () => {
    const collegeSearch = read("app/college-search/page.tsx");
    const priorityManager = read("components/academic/CollegePriorityManager.tsx");
    expect(collegeSearch).toContain('from("college_list")');
    expect(priorityManager).toContain('from("college_list")');
    expect(priorityManager).toContain('type PriorityFlag = "is_dream" | "is_top"');
    expect(priorityManager).not.toContain('from("dream_schools")');
    expect(priorityManager).not.toContain('from("top_schools")');
    expect(exists("app/dream-schools/page.tsx")).toBe(true);
    expect(exists("app/top-schools/page.tsx")).toBe(true);
  });

  it("fulfills application deadlines and application tracking through one governed workspace", () => {
    const workspace = read("components/application-workspace/ApplicationWorkspaceDashboard.tsx");
    expect(workspace).toContain("deadline");
    expect(workspace).toContain('status: "building" | "ready" | "submitted"');
    expect(workspace).toContain("Application checklist");
    expect(workspace).toContain("Mark application submitted");
    expect(workspace).toContain('/api/application-workspaces');
  });

  it("keeps Academic Readiness explainable and preserves user decision authority", () => {
    const readiness = read("app/academic-readiness/page.tsx");
    expect(readiness).toContain('from("ag_progress")');
    expect(readiness).toContain('from("application_workspaces")');
    expect(readiness).toContain("Why Playbook is recommending this");
    expect(readiness).toContain("Playbook recommends. You decide.");
    expect(readiness).toContain("decision_state");
  });

  it("keeps Compass as derived guidance rather than canonical academic data", () => {
    const compass = read("app/compass/page.tsx");
    const recommendationEngine = read("lib/compass/RecommendationEngine.ts");
    expect(compass).toContain("Compass");
    expect(recommendationEngine.length).toBeGreaterThan(0);
    expect(compass).not.toContain('from("canonical_compass_record")');
  });

  it("routes the Academic hub only to canonical experiences", () => {
    const hub = read("app/academic/page.tsx");
    for (const route of [
      "/transcript",
      "/fafsa",
      "/scholarships",
      "/college-search",
      "/dream-schools",
      "/top-schools",
      "/application-workspaces",
      "/academic-readiness",
      "/compass",
    ]) {
      expect(hub).toContain(`href: \"${route}\"`);
    }
  });
});
