import { describe, expect, it } from "vitest";
import {
  createSupportInvitation,
  destinationForRelationship,
  getDemoInvitations,
  updateInvitationStatus,
} from "@/lib/invitations";
import InvitationCenter from "@/components/invitations/InvitationCenter";

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

  it("component is defined", () => {
    expect(InvitationCenter).toBeTruthy();
  });
});
