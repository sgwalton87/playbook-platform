import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ACCEPTANCE_WELCOME_MESSAGE,
  applyInvitationStatus,
  buildInvitationAcceptanceEffects,
  buildInvitationEmail,
  buildInvitationRecord,
  generateInviteToken,
} from "@/lib/invitations/server";
import {
  onboardingDestinationForInvitation,
  requiresInvitationRoleOnboarding,
  roleForSupportInvitation,
} from "@/lib/invitations";

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

    it("assigns precise Starting Five roles to their onboarding pathways", () => {
      expect(roleForSupportInvitation("parent_guardian")).toBe("family");
      expect(roleForSupportInvitation("educator", "coach")).toBe("coach");
      expect(roleForSupportInvitation("educator", "counselor")).toBe("counselor");
      expect(roleForSupportInvitation("mentor")).toBe("mentor");
      expect(roleForSupportInvitation("educator", "scholar")).toBe("educator");
    });

    it("routes invitees through role onboarding before network activation", () => {
      expect(onboardingDestinationForInvitation({
        token: "invite-token",
        relationship: "educator",
        invitedRole: "coach",
      })).toBe("/start?role=coach&first=1&invite=invite-token");

      expect(requiresInvitationRoleOnboarding({
        onboardingCompleted: false,
        profileRole: "coach",
        invitedRole: "coach",
      })).toBe(true);
      expect(requiresInvitationRoleOnboarding({
        onboardingCompleted: true,
        profileRole: "educator",
        invitedRole: "coach",
      })).toBe(true);
      expect(requiresInvitationRoleOnboarding({
        onboardingCompleted: true,
        profileRole: "coach",
        invitedRole: "coach",
      })).toBe(false);
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

    it("builds one idempotent relationship, welcome message, event, and inviter notification", () => {
      const invitation = {
        id: "00000000-0000-0000-0000-000000000010",
        scholar_id: "00000000-0000-0000-0000-000000000001",
        scholar_name: "Maya",
        invitee_name: "Coach Taylor",
        invitee_email: "coach@example.com",
        relationship: "educator",
      };

      const effects = buildInvitationAcceptanceEffects({
        invitation,
        supporterId: "00000000-0000-0000-0000-000000000020",
      });

      expect(effects.relationship.source_invitation_id).toBe(invitation.id);
      expect(effects.message.id).toBe(invitation.id);
      expect(effects.message.body).toBe(ACCEPTANCE_WELCOME_MESSAGE);
      expect(effects.event.id).toBe(invitation.id);
      expect(effects.notification.id).toBe(invitation.id);
      expect(effects.notification.user_id).toBe(invitation.scholar_id);
      expect(effects.notification.title).toContain("Coach Taylor");
      expect(effects.invitationUpdate.status).toBe("accepted");
    });
  }
);
