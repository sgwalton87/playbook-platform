import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const read=(file:string)=>fs.readFileSync(path.join(process.cwd(),file),"utf8");

describe("Phase 8 Courses 1-9",()=>{
 it("provides canonical library search without a parallel index",()=>{const page=read("app/courses/page.tsx");expect(page).toContain('aria-label="Search courses"');expect(page).toContain('aria-label="Filter by pillar"');expect(page).toContain("visiblePublished");expect(page).toContain('/api/learning/courses');});
 it("keeps published course detail and required modules fail closed",()=>{const route=read("app/api/learning/courses/[slug]/route.ts");expect(route).toContain('.eq("status", "published")');expect(route).toContain("filter((module) => module.required)");});
 it("keeps completion and rewards behind canonical server authority",()=>{const route=read("app/api/learning/courses/[slug]/route.ts");const page=read("app/courses/[slug]/page.tsx");expect(route).toContain('rpc("complete_learning_module"');expect(page).not.toContain("addReward(");expect(page).toContain("Course complete.");});
 it("surfaces credential badge and reward destinations",()=>{const library=read("app/courses/page.tsx");const detail=read("app/courses/[slug]/page.tsx");expect(library).toContain('href="/certificates"');expect(library).toContain('href="/badges"');expect(library).toContain('href="/store"');expect(detail).toContain("Open credential vault");});
 it("documents the legacy convergence boundary instead of blessing duplicate authorities",()=>{const audit=read("docs/ENGINEERING/COURSES_PHASE8_1_9_AUDIT.md");expect(audit).toContain("Legacy Course Convergence");expect(audit).toContain("must not be counted as canonical functionality");expect(audit).toContain("End-to-End Course Certification");});
});