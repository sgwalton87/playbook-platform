import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
const read=(file:string)=>fs.readFileSync(path.join(process.cwd(),file),"utf8");
describe("Scholarship discovery",()=>{
 it("reuses the canonical Marketplace catalog",()=>{const page=read("app/scholarships/page.tsx");expect(page).toContain('/api/marketplace/opportunities');expect(page).toContain('item.opportunity_type==="scholarship"');expect(page).not.toContain('.from("scholarships")');});
 it("bridges real scholarships into the shared Application Workspace",()=>{const page=read("app/scholarships/page.tsx");expect(page).toContain('opportunityType:"scholarship"');expect(page).toContain('/application-workspaces?');expect(page).toContain("Start Application Workspace");});
 it("keeps advisory intelligence distinct from real listings",()=>{const page=read("app/scholarships/page.tsx");expect(page).toContain("human publication review");expect(page).toContain("does not turn AI suggestions into fake scholarship listings");});
});
