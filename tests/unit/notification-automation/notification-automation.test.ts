import { describe, expect, it } from "vitest";
import {
  buildEscalation,
  buildNotificationDigest,
  getRoleAwareNotificationRule,
  resolveRecipientsFromRelationships,
  shouldDeliverNow,
} from "@/lib/notification-automation";

describe("Notification Automation", () => {
  it("resolves recipients from relationships", () => {
    const recipients = resolveRecipientsFromRelationships({
      scholarId: "scholar-1",
      relationships: [
        {
          scholar_id: "scholar-1",
          supporter_id: "family-1",
          supporter_email: "family@example.com",
          relationship: "family",
          status: "active",
        },
      ],
    });

    expect(recipients.length).toBe(2);
  });

  it("builds role-aware delivery rule", () => {
    const rule = getRoleAwareNotificationRule({
      role: "family",
      event: {
        type: "action.assigned",
        userId: "family-1",
        scholarId: "scholar-1",
        actorRole: "family",
      },
    });

    expect(rule.priority).toBe("high");
  });

  it("checks notification preferences", () => {
    expect(shouldDeliverNow({ type: "message" })).toBe(true);
    expect(shouldDeliverNow({ type: "mail_reply" })).toBe(false);
  });

  it("builds digest", () => {
    const digest = buildNotificationDigest({
      cadence: "daily",
      notifications: [
        { type: "message", read: false },
        { type: "shared_action", read: true },
      ],
    });

    expect(digest.totalUnread).toBe(1);
  });

  it("builds escalation", () => {
    const escalation = buildEscalation({
      blocker: { title: "Upload FAFSA docs", role: "family" },
      ageDays: 7,
    });

    expect(escalation.level).toBe("urgent");
  });
});
