import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { stableProfileSnapshot } from "@/lib/onboarding/stableSnapshot";
const read=(path:string)=>readFileSync(resolve(process.cwd(),path),"utf8");

describe("Durable owner profile and invitation contracts",()=>{
 it("ignores object key order but preserves array order and values",()=>{
   expect(stableProfileSnapshot({bio:"Yes",activities:[{hours:"2",title:"Sports"}]}))
     .toBe(stableProfileSnapshot({activities:[{title:"Sports",hours:"2"}],bio:"Yes"}));
   expect(stableProfileSnapshot({activities:["A","B"]})).not.toBe(stableProfileSnapshot({activities:["B","A"]}));
   expect(stableProfileSnapshot({bio:"hello"})).not.toBe(stableProfileSnapshot({bio:""}));
 });
 it("both editors only confirm save after owner-scoped readback",()=>{
  for(const path of ["components/profile/RoleProfileEditor.tsx","app/profile/advanced/page.tsx"]){
   const source=read(path);
   expect(source).toContain('stableProfileSnapshot(persisted.onboarding_data)');
   expect(source).toContain('stableProfileSnapshot(latest.onboarding_data)');
   expect(source).toContain('select("onboarding_data');
  }
 });
 it("Athlete fields appear only in the modern dedicated module",()=>{
  const main=read("components/profile/RoleProfileEditor.tsx");
  const route=read("app/profile/athlete/page.tsx");
  expect(main).toContain('athlete-profile');
  expect(main).toContain('athlete-recruiting');
  expect(main).toContain('mode === "athlete"');
  expect(route).toContain('mode="athlete"');
 });
 it("invite code cannot bypass exact-email matching and governed claim",()=>{
  const code=read("app/api/invitations/code/route.ts");
  expect(code).toContain("requireUser()");
  expect(code).toContain('.eq("status","pending")');
  expect(code).toContain('data.invitee_email.trim().toLowerCase()');
  expect(read("app/api/invitations/accept/route.ts")).toContain('claim_support_invitation');
 });
 it("recipient and scholar have distinct branded and escaped emails",()=>{
  const email=read("lib/email/invitationEmail.ts");
  const sending=read("app/api/invitations/send/route.ts");
  expect(email).toContain('buildScholarInvitationReceipt');
  expect(email).toContain('buildSupportInvitationEmail');
  expect(email).toContain('const safe =');
  expect(sending).toContain('scholarReceiptStatus');
  expect(sending).toContain('invite_code: record.inviteCode');
 });
});
