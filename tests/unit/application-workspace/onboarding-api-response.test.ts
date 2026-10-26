import {describe,it,expect} from "vitest";
import {readFileSync} from "node:fs";
describe("Application workspace onboarding error clarity",()=>{
 it("returns an onboarding-specific next step without granting workspace access",()=>{
  const s=readFileSync("app/api/application-workspaces/route.ts","utf8");
  expect(s).toContain('requireLearnerAuthority(supabase, user.id, { requireOnboarding: true })');
  expect(s).toContain('action: "complete_onboarding"');
  expect(s).toContain('next: "/start"');
  expect(s).toContain('status = message === "Complete learner onboarding before using this capability." ? 403 : 500');
 });
});
