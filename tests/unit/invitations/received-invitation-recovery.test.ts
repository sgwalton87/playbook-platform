import { describe,it,expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
const file=(p:string)=>readFileSync(resolve(process.cwd(),p),"utf8");
describe("Parent/Guardian invitation recovery",()=>{
 it("Family Step 2 opens the actionable inbox rather than routing back to Family OS",()=>{
  const source=file("components/guided/RoleJourneyDashboard.tsx");
  expect(source).toContain('"/invitations/received","Review invitations"');
  expect(source).not.toContain('"/family-os","Review access"');
 });
 it("only loads pending invitations for the signed-in invitee email",()=>{
  const api=file("app/api/invitations/received/route.ts");
  expect(api).toContain("requireUser()");
  expect(api).toContain('user.email.trim().toLowerCase()');
  expect(api).toContain('.eq("status","pending")');
  expect(api).toContain('i.invitee_email.trim().toLowerCase()===email');
 });
 it("reuses the governed invitation acceptance route and never bypasses it",()=>{
  const page=file("app/invitations/received/page.tsx");
  expect(page).toContain('/invite/');
  const accept=file("app/api/invitations/accept/route.ts");
  expect(accept).toContain("claim_support_invitation");
  expect(accept).toContain("requirePlaybookRole");
 });
});
