import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  createSupportInvitation,
  destinationForRelationship,
  getDemoInvitations,
  updateInvitationStatus,
} from "@/lib/invitations";
import InvitationCenter from "@/components/invitations/InvitationCenter";
import { requirePlaybookRole } from "@/lib/roles/registry";

describe("Role Invitations", () => {
  it("preserves governed Mentor permissions and destination", () => {
    const invite = createSupportInvitation({
      inviteeName: "Mentor",
      inviteeEmail: "mentor@example.com",
      relationship: "mentor",
    });

    expect(invite.status).toBe("pending");
    expect(invite.permissions.length).toBeGreaterThan(0);
    expect(invite.destination).toBe("/mentor-os");
  });

  it("updates invitation status", () => {
    const invite = createSupportInvitation({
      inviteeName: "Parent",
      inviteeEmail: "parent@example.com",
      relationship: "parent_guardian",
    });

    expect(updateInvitationStatus(invite, "accepted").status).toBe("accepted");
  });

  it.each([
    ["counselor", "/counselor-os"],
    ["college_recruiter", "/recruiting-os"],
    ["college_admissions", "/admissions-os"],
    ["community_partner", "/community-partner-os"],
  ] as const)("routes %s to its exact OS with zero data permissions", (relationship, destination) => {
    const invite = createSupportInvitation({
      inviteeName: "Supporter",
      inviteeEmail: `${relationship}@example.com`,
      relationship,
    });
    expect(invite.destination).toBe(destination);
    expect(invite.permissions).toEqual([]);
  });

  it("keeps legacy university identity compatibility-only", () => {
    expect(destinationForRelationship("university_partner")).toBe("/university-os");
  });

  it("returns demo invitations", () => {
    expect(getDemoInvitations().length).toBeGreaterThan(0);
  });

  it("normalizes stored Scholar-Athlete identities before invitation authorization", () => {
    const permitted = new Set(["scholar", "scholar-athlete", "transition-youth"]);
    expect(permitted.has(requirePlaybookRole("scholar_athlete"))).toBe(true);
    expect(permitted.has(requirePlaybookRole("scholar-athlete"))).toBe(true);
    expect(permitted.has(requirePlaybookRole("family"))).toBe(false);
    expect(() => requirePlaybookRole("unknown_role")).toThrow("Unsupported Playbook role");
  });

  it("uses strict canonical roles on both invitation authorization boundaries", () => {
    const ui = readFileSync(resolve(process.cwd(), "components/invitations/InvitationCenter.tsx"), "utf8");
    const api = readFileSync(resolve(process.cwd(), "app/api/invitations/send/route.ts"), "utf8");
    expect(ui).toContain('fetch("/api/invitations/manage"');
    const manageApi = readFileSync(resolve(process.cwd(), "app/api/invitations/manage/route.ts"), "utf8");
    expect(manageApi).toContain("requirePlaybookRole(");
    expect(api).toContain("requirePlaybookRole(");
    expect(ui).not.toContain("normalizePlaybookRole(");
    expect(api).not.toContain("normalizePlaybookRole(");
  });

  it("component is defined", () => {
    expect(InvitationCenter).toBeTruthy();
  });
});
