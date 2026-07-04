import { describe, expect, it } from "vitest";
import {
  automateNotificationFromEvent,
  automateNotificationsFromEvents,
} from "@/lib/intelligence-automation";

describe("Notifications + Intelligence Automation", () => {
  it("creates message notification from event", () => {
    const notification = automateNotificationFromEvent({
      type: "message.received",
      userId: "user-1",
      scholarId: "scholar-1",
      detail: "Coach sent a message.",
    });

    expect(notification?.type).toBe("message");
  });

  it("creates blocker notification from Compass event", () => {
    const notification = automateNotificationFromEvent({
      type: "network.blocker_detected",
      userId: "user-1",
      scholarId: "scholar-1",
      detail: "FAFSA action is incomplete.",
    });

    expect(notification?.priority).toBe("high");
  });

  it("creates notifications from multiple events", () => {
    const notifications = automateNotificationsFromEvents([
      {
        type: "invitation.accepted",
        userId: "user-1",
        scholarId: "scholar-1",
      },
      {
        type: "action.assigned",
        userId: "user-2",
        scholarId: "scholar-1",
      },
    ]);

    expect(notifications).toHaveLength(2);
  });
});
