import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const read=(file:string)=>fs.readFileSync(path.join(process.cwd(),file),"utf8");
const exists=(file:string)=>fs.existsSync(path.join(process.cwd(),file));

describe("Phase 8 Courses 1-9",()=>{
  it("provides canonical library search without a parallel index",()=>{
    const page=read("app/courses/page.tsx");
    expect(page).toContain('aria-label="Search courses"');
    expect(page).toContain('aria-label="Filter by pillar"');
    expect(page).toContain("visiblePublished");
    expect(page).toContain('/api/learning/courses');
  });

  it("keeps published course detail and required modules fail closed",()=>{
    const route=read("app/api/learning/courses/[slug]/route.ts");
    expect(route).toContain('.eq("status", "published")');
    expect(route).toContain("filter((module) => module.required)");
  });

  it("preserves Leadership-quality objectives activities checkpoints and interactions on canonical Learning",()=>{
    const migration=read("supabase/migrations/202608180102_courses_rich_curriculum_convergence.sql");
    const detail=read("app/courses/[slug]/page.tsx");
    expect(migration).toContain("learning_objectives");
    expect(migration).toContain("activity");
    expect(migration).toContain("knowledge_checkpoint");
    expect(migration).toContain("interactions");
    expect(migration).toContain("15-week-leadership-program");
    expect(detail).toContain("Learning objectives");
    expect(detail).toContain("Interactive practice");
    expect(detail).toContain("Knowledge checkpoint");
  });

  it("keeps checkpoint answers private and completion server-gated",()=>{
    const migration=read("supabase/migrations/202608180102_courses_rich_curriculum_convergence.sql");
    const route=read("app/api/learning/courses/[slug]/route.ts");
    expect(migration).toContain("private.learning_module_checkpoint_answers");
    expect(migration).toContain("m.knowledge_checkpoint - 'correct_index'");
    expect(migration).toContain("r.checkpoint_passed=true");
    expect(migration).toContain("alter table public.learning_module_responses enable row level security");
    expect(migration).toContain("revoke all on table public.learning_module_responses from public,anon,authenticated");
    expect(migration).toContain("language sql\nsecurity invoker");
    expect(route).toContain('rpc("submit_learning_module_work"');
    expect(route).toContain('rpc("complete_learning_module"');
  });

  it("keeps completion rewards credentials and badges behind canonical server authority",()=>{
    const page=read("app/courses/[slug]/page.tsx");
    expect(page).not.toContain("addReward(");
    expect(page).toContain("Course complete.");
    expect(page).toContain("Open credential vault");
    const library=read("app/courses/page.tsx");
    expect(library).toContain('href="/certificates"');
    expect(library).toContain('href="/badges"');
    expect(library).toContain('href="/store"');
  });

  it("retires the four route-specific course page authorities",()=>{
    expect(exists("app/courses/15-week-leadership-program/page.tsx")).toBe(false);
    expect(exists("app/courses/civic-engagement-for-young-leaders/page.tsx")).toBe(false);
    expect(exists("app/courses/community-safety-no-bullying/page.tsx")).toBe(false);
    expect(exists("app/courses/athletes-abroad-global-hub/page.tsx")).toBe(false);
    expect(exists("lib/courses/communitySafetyCourse.ts")).toBe(false);
    expect(exists("lib/courses/athletesAbroadGlobalHubCourse.ts")).toBe(false);
  });

  it("converges Community Safety and Athletes Abroad instead of discarding their authored content",()=>{
    const migration=read("supabase/migrations/202608180103_static_course_convergence.sql");
    expect(migration).toContain("Community Safety: No Bullying, Harassment, or Harm");
    expect(migration).toContain("Athletes Abroad Hub: The Global Home Court");
    expect(migration).toContain("Community Safety Check 1");
    expect(migration).toContain("Global Home Court Check 1");
  });

  it("retires legacy learner mutation and removes historical checkpoint answers",()=>{
    const migration=read("supabase/migrations/202608180104_legacy_course_authority_retirement.sql");
    expect(migration).toContain("knowledge_checkpoint - 'correct_index'");
    expect(migration).toContain("set is_available=false");
    expect(migration).toContain("revoke insert,update,delete on table public.course_progress from anon,authenticated");
    expect(migration).toContain("Canonical learner authority is learning_module_progress");
  });

  it("documents the end-to-end release gate",()=>{
    const audit=read("docs/ENGINEERING/COURSES_PHASE8_1_9_AUDIT.md");
    expect(audit).toContain("Legacy Course Convergence");
    expect(audit).toContain("End-to-End Course Certification");
    expect(audit).toContain("Do not mark Phase 8 green from route existence alone");
  });
});