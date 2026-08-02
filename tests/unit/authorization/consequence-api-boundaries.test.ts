import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
const routes = [
  ["app/api/albums/route.ts",2],["app/api/albums/photos/route.ts",1],["app/api/application-workspaces/route.ts",2],
  ["app/api/brand-partners/campaigns/route.ts",2],["app/api/community-events/route.ts",2],["app/api/guided-tour/progress/route.ts",1],
  ["app/api/mentor-directory/route.ts",2],["app/api/recommenders/request/route.ts",1],["app/api/rewards/balance/route.ts",1],
  ["app/api/rewards/emit/route.ts",1],["app/api/social/comments/route.ts",3],["app/api/store/redemptions/route.ts",1],
  ["app/api/support-network/summary/route.ts",1],
] as const;
describe("20 consequence-bearing API handlers",()=>{
  it("covers exactly twenty methods",()=>expect(routes.reduce((sum,[,count])=>sum+count,0)).toBe(20));
  it.each(routes)("removes service-role bypasses from %s",(file)=>{const source=readFileSync(file,"utf8");expect(source).not.toContain("SUPABASE_SERVICE_ROLE_KEY");expect(source).toContain("createServerSupabaseClient");});
  it("binds client-supplied identities to authenticated context",()=>{for(const [file] of routes){const source=readFileSync(file,"utf8");expect(source).not.toMatch(/user_id\s*:\s*body\.userId/);expect(source).not.toMatch(/created_by\s*:\s*body\.userId/);}});
});
