import {
  describe,
  expect,
  it,
} from "vitest";

import {
  applyInvitationStatus,
  buildInvitationEmail,
  buildInvitationRecord,
  generateInviteToken,
} from "@/lib/invitations/server";

describe(
  "Invitation Delivery + Acceptance Flow",
  () => {
    it("generates secure invite token", () => {
      expect(
        generateInviteToken().length
      ).toBe(64);
    });

    it("builds invitation record", () => {
      const record =
        buildInvitationRecord({
          scholarId:
            "00000000-0000-0000-0000-000000000001",
          scholarName: "Maya",
          inviteeName: "Coach Taylor",
          inviteeEmail:
            "coach@example.com",
          relationship: "mentor",
        });

      expect(record.token).toBeTruthy();

      expect(record.destination).toBe(
        "/mentor-os"
      );
    });

    it("builds invitation email", () => {
      const email =
        buildInvitationEmail({
          inviteeName: "Coach",
          scholarName: "Maya",
          relationship: "mentor",
          token: "abc",
          origin:
            "https://playbook.test",
        });

      expect(email.url).toContain(
        "/invite/abc"
      );

      expect(email.subject).toContain(
        "Maya"
      );
    });

    it("applies accepted status", () => {
      const update =
        applyInvitationStatus(
          "accepted"
        );

      expect(update.status).toBe(
        "accepted"
      );

      expect(
        update.accepted_at
      ).toBeTruthy();
    });
  }
);
