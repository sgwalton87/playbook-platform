import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const read=(file:string)=>fs.readFileSync(path.join(process.cwd(),file),"utf8");

describe("College Search authority",()=>{
 it("reuses the canonical colleges and college_list tables",()=>{const page=read("app/college-search/page.tsx");expect(page).toContain('from("colleges")');expect(page).toContain('from("college_list")');expect(page).not.toContain('from("college_search")');});
 it("keeps personal college lists owner scoped and anonymous access closed",()=>{const sql=read("supabase/migrations/20260818201500_college_search_authority.sql");expect(sql).toContain("Scholars read own college list");expect(sql).toContain("auth.uid()) = user_id");expect(sql).toContain("revoke all on public.college_list from anon");});
 it("keeps the reference catalog read-only to clients",()=>{const sql=read("supabase/migrations/20260818201500_college_search_authority.sql");expect(sql).toContain("revoke insert, update, delete, truncate, references, trigger on public.colleges from anon, authenticated");expect(sql).toContain("grant select on public.colleges to anon, authenticated");});
 it("supports truthful empty state, manual fallback, and Application Workspace handoff",()=>{const page=read("app/college-search/page.tsx");expect(page).toContain("The governed catalog is not populated yet");expect(page).toContain("Add a school that is not in the catalog yet");expect(page).toContain("Open Application Workspace");});
});
