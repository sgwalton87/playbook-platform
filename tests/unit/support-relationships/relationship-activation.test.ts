import { describe, expect, it } from "vitest";
import {
  buildAcceptedInvitationRelationship,
  invitationEmailMatchesUser,
} from "@/lib/support-relationships";

describe("Relationship Activation", () => {
  it("validates invitee email", () => {
    expect(invitationEmailMatchesUser("Coach@Example.com", "coach@example.com")).toBe(true);
    expect(invitationEmailMatchesUser("coach@example.com", "other@example.com")).toBe(false);
  });

  it("builds relationship from accepted invitation", () => {
    const relationship = buildAcceptedInvitationRelationship({
      supporterId: "supporter-1",
      invitation: {
        id: "invite-1",
        scholar_id: "scholar-1",
        invitee_email: "coach@example.com",
        invitee_name: "Coach",
        relationship: "mentor",
      },
    });

    expect(relationship.supporter_id).toBe("supporter-1");
    expect(relationship.relationship).toBe("mentor");
    expect(relationship.permissions).toContain("support_tasks");
  });
});
