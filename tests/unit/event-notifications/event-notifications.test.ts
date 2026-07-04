import { describe, expect, it } from "vitest";
import {
  buildPlaybookEvent,
  convertEventToNotification,
  resolveDemoRecipients,
} from "@/lib/event-notifications";

describe("Persistent Event Notification Pipeline", () => {
  it("builds Playbook event", () => {
    const event = buildPlaybookEvent({
      type: "message.received",
      scholarId: "scholar-1",
      actorRole: "mentor",
      payload: { detail: "Coach sent a message." },
    });

    expect(event.type).toBe("message.received");
    expect(event.scholar_id).toBe("scholar-1");
  });

  it("converts event to notification", () => {
    const event = buildPlaybookEvent({
      type: "action.assigned",
      scholarId: "scholar-1",
      payload: {
        title: "Upload FAFSA docs",
        detail: "Family action assigned.",
      },
    });

    const notification = convertEventToNotification({
      eventId: "00000000-0000-0000-0000-000000000001",
      event,
      recipientUserId: "family-user",
    });

    expect(notification?.type).toBe("shared_action");
    expect(notification?.user_id).toBe("family-user");
  });

  it("resolves demo recipients", () => {
    expect(resolveDemoRecipients({ scholarId: "scholar-1" })).toContain("scholar-1");
  });
});
