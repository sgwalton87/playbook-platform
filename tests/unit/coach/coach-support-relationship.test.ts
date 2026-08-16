import { describe, expect, it } from "vitest";
import { createSupportInvitation, destinationForRelationship } from "@/lib/invitations";
import { canRelationship, getPermissionsForRelationship } from "@/lib/permissions";
import { mapRoleToRelationship } from "@/lib/permissions/roleRelationshipMap";

describe("Coach support relationship", () => {
  it("is a canonical relationship that routes to Coach OS", () => {
    expect(mapRoleToRelationship("coach")).toBe("coach");
    expect(destinationForRelationship("coach")).toBe("/coach-os");
  });

  it("grants zero Scholar-data permissions at relationship activation", () => {
    expect(getPermissionsForRelationship("coach")).toEqual([]);
    expect(canRelationship("coach", "view_progress")).toBe(false);
    expect(canRelationship("coach", "view_verified_record")).toBe(false);
    expect(canRelationship("coach", "verify_evidence")).toBe(false);
    expect(canRelationship("coach", "recommend_actions")).toBe(false);
  });

  it("creates a Scholar-originated Coach invitation with no data permissions", () => {
    const invitation = createSupportInvitation({
      scholarId: "scholar-1",
      scholarName: "Scholar",
      inviteeName: "Coach Taylor",
      inviteeEmail: "coach@example.com",
      relationship: "coach",
    });
    expect(invitation.relationship).toBe("coach");
    expect(invitation.permissions).toEqual([]);
    expect(invitation.destination).toBe("/coach-os");
  });
});
