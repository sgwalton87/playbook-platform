import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
const component=readFileSync("components/invitations/InvitationCenter.tsx","utf8");const route=readFileSync("app/api/invitations/send/route.ts","utf8");
describe("invitation center wiring",()=>{
 it("loads persisted invitations without demo fallbacks",()=>{expect(component).toContain('fetch("/api/invitations/send"');expect(component).not.toContain("getDemoInvitations");});
 it("does not allow inviters to locally accept their own invitation",()=>expect(component).not.toContain("updateInvitationStatus"));
 it("derives Scholar identity and name on the server",()=>{expect(route).toContain("scholarId: user.id");expect(route).toContain("profile?.full_name");expect(route).not.toContain('body.scholarName || "Scholar"');});
});
