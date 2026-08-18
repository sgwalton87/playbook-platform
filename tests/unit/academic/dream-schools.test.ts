import fs from "node:fs";
import path from "node:path";
import { describe,expect,it } from "vitest";
const read=(file:string)=>fs.readFileSync(path.join(process.cwd(),file),"utf8");
describe("Dream Schools convergence",()=>{
 it("uses college_list as the planning authority",()=>{const page=read("app/dream-schools/page.tsx");expect(page).toContain('from("college_list")');expect(page).not.toContain('from("dream_schools")');expect(page).toContain('college_type:"dream"');});
 it("migrates legacy profile preferences without deleting them",()=>{const sql=read("supabase/migrations/20260818213000_dream_school_convergence.sql");expect(sql).toContain("dream_school_name");expect(sql).toContain("dream_school_id");expect(sql).toContain("insert into public.college_list");expect(sql).not.toContain("drop column");});
 it("keeps College Search and Application Workspace in the journey",()=>{const page=read("app/dream-schools/page.tsx");expect(page).toContain('href="/college-search"');expect(page).toContain("Application Workspace");});
});
