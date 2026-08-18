import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const read = (file: string) => fs.readFileSync(path.join(process.cwd(), file), "utf8");

describe("Dream and Top Schools convergence", () => {
  it("keeps college_list as the only planning authority", () => {
    const manager = read("components/academic/CollegePriorityManager.tsx");
    expect(manager).toContain('from("college_list")');
    expect(manager).not.toContain('from("dream_schools")');
    expect(manager).not.toContain('from("top_schools")');
  });

  it("separates provenance from independent Dream and Top priorities", () => {
    const sql = read("supabase/migrations/20260818234000_college_priority_flags.sql");
    expect(sql).toContain("is_dream boolean not null default false");
    expect(sql).toContain("is_top boolean not null default false");
    expect(sql).toContain("where college_type = 'dream'");
    expect(sql).toContain("is_dream = true");
  });

  it("preserves legacy Dream preference convergence without deleting compatibility fields", () => {
    const legacySql = read("supabase/migrations/20260818231500_dream_school_convergence.sql");
    expect(legacySql).toContain("dream_school_name");
    expect(legacySql).toContain("dream_school_id");
    expect(legacySql).toContain("insert into public.college_list");
    expect(legacySql).not.toContain("drop column");
  });

  it("allows Dream and Top priority to coexist on one saved-school record", () => {
    const manager = read("components/academic/CollegePriorityManager.tsx");
    const dreamPage = read("app/dream-schools/page.tsx");
    const topPage = read("app/top-schools/page.tsx");
    expect(manager).toContain('type PriorityFlag = "is_dream" | "is_top"');
    expect(manager).toContain("school.is_dream");
    expect(manager).toContain("school.is_top");
    expect(dreamPage).toContain('flag="is_dream"');
    expect(topPage).toContain('flag="is_top"');
  });

  it("keeps College Search and Application Workspace in the priority journey", () => {
    const manager = read("components/academic/CollegePriorityManager.tsx");
    expect(manager).toContain('href="/college-search"');
    expect(manager).toContain("/application-workspaces?");
  });

  it("uses stable router-aware loading instead of stale navigation effects", () => {
    const manager = read("components/academic/CollegePriorityManager.tsx");
    expect(manager).toContain("useCallback");
    expect(manager).toContain("[load]");
    expect(manager).not.toContain("window.location.href");
  });
});
