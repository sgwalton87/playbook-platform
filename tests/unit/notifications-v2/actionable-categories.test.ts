import { describe, expect, it } from "vitest";
import { notificationHrefForType } from "@/lib/notifications-v2/notificationEngine";
import { automateNotificationFromEvent } from "@/lib/intelligence-automation";

describe("actionable notification categories", () => {
  it.each([
    ["verification", "/evidence"],
    ["intervention", "/action-routing"],
    ["opportunity", "/opportunities"],
    ["milestone", "/portfolio"],
  ] as const)("routes %s events to %s", (type, href) => {
    expect(notificationHrefForType(type)).toBe(href);
  });

  it.each([
    ["verification.requested", "verification"],
    ["intervention.assigned", "intervention"],
    ["opportunity.match_ready", "opportunity"],
    ["milestone.confirmed", "milestone"],
  ] as const)("converts persisted %s events into %s notifications", (eventType, notificationType) => {
    expect(automateNotificationFromEvent({ type: eventType, userId: "u1", scholarId: "s1" })?.type).toBe(notificationType);
  });
});
