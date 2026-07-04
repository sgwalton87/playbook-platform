import { describe, expect, it } from "vitest";
import {
  createSupportInvitation,
  destinationForRelationship,
  getDemoInvitations,
  updateInvitationStatus,
} from "@/lib/invitations";
import InvitationCenter from "@/components/invitations/InvitationCenter";

describe("Role Invitations", () => {
  it("creates invitation with permissions and destination", () => {
    const invite = createSupportInvitation({
      inviteeName: "Coach Taylor",
      inviteeEmail: "coach@example.com",
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

  it("routes university partner correctly", () => {
    expect(destinationForRelationship("university_partner")).toBe("/university-os");
  });

  it("returns demo invitations", () => {
    expect(getDemoInvitations().length).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(InvitationCenter).toBeTruthy();
  });
});
