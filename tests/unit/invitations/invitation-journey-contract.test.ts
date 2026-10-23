import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const source = (path: string) => readFileSync(resolve(process.cwd(), path), "utf8");

describe("Governed invitation journey", () => {
  it("offers explicit relationship types without silently reassigning account roles", () => {
    const ui = source("components/invitations/InvitationCenter.tsx");
    for (const relationship of ["parent_guardian", "mentor", "educator", "counselor", "coach", "college_recruiter", "college_admissions", "district_admin", "community_partner", "brand_partner", "employer_partner"]) {
      expect(ui).toContain('value: "' + relationship + '"');
    }
    expect(ui).toContain('setRelationship');
    expect(ui).toContain('withdrawInvitation');
  });
  it("requires the invitee's durable matching role and never changes it", () => {
    const api = source("app/api/invitations/accept/route.ts");
    expect(api).toContain('requirePlaybookRole(');
    expect(api).toContain('actual !== expected');
    expect(api).not.toContain('.update({ role:');
  });
  it("only shows active canonical relationships in ecosystem, not demo data", () => {
    const map = source("components/support-network/SupportNetworkMap.tsx");
    expect(map).toContain('/api/support-relationships');
    expect(map).toContain('item.status === "active"');
    expect(map).toContain('person.avatar_url');
    expect(map).not.toContain('getSupportNetwork()');
  });
  it("withdraws only the owner pending request via governed RPC", () => {
    const api = source("app/api/invitations/manage/route.ts");
    expect(api).toContain('withdraw_own_support_invitation');
    expect(api).toContain('requireUser()');
  });
});
