import { describe, expect, it } from "vitest";
import {
  buildNotification,
  getDemoNotifications,
  getUnreadCount,
  markNotificationRead,
  sortNotifications,
} from "@/lib/notifications-v2";
import NotificationCenter from "@/components/notifications-v2/NotificationCenter";

describe("Notifications v2", () => {
  it("builds notification", () => {
    const notification = buildNotification({
      userId: "user-1",
      type: "message",
      title: "New message",
      body: "Hello",
      href: "/messages",
    });

    expect(notification.read).toBe(false);
  });

  it("counts unread notifications", () => {
    expect(getUnreadCount(getDemoNotifications())).toBeGreaterThan(0);
  });

  it("marks notification read", () => {
    const notification = getDemoNotifications()[0];
    expect(markNotificationRead(notification).read).toBe(true);
  });

  it("sorts notifications", () => {
    expect(sortNotifications(getDemoNotifications()).length).toBeGreaterThan(0);
  });

  it("component is defined", () => {
    expect(NotificationCenter).toBeTruthy();
  });
});
