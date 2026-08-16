import { describe, expect, it } from "vitest";
import { buildSupportRelationship } from "@/lib/support-relationships";

describe("Support Relationships", () => {
  it("builds only durable relationship fields with least-privilege permissions", () => {
    const relationship = buildSupportRelationship({
      scholarId: "scholar-1",
      supporterEmail: "family@example.com",
      supporterName: "Parent / Guardian",
      relationship: "parent_guardian",
      sourceInvitationId: "invite-1",
    });

    expect(relationship.permissions).toEqual(["view_progress", "view_deadlines", "support_tasks"]);
    expect(relationship).toMatchObject({
      scholar_id: "scholar-1",
      supporter_email: "family@example.com",
      supporter_name: "Parent / Guardian",
      relationship: "parent_guardian",
      source_invitation_id: "invite-1",
      status: "active",
    });
    expect("destination" in relationship).toBe(false);
  });
});
