import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608180099_messaging_message_notifications.sql", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_MESSAGE_NOTIFICATIONS_SPEC.md", "utf8");
const notificationRoute = readFileSync("app/api/notifications/route.ts", "utf8");
const networkRoute = readFileSync("app/api/network/messages/route.ts", "utf8");
const groupRoute = readFileSync("app/api/groups/messages/route.ts", "utf8");
const supportRoute = readFileSync("app/api/support-network/messages/route.ts", "utf8");

describe("Messaging Message Notifications authority", () => {
  it("reuses the canonical notification outbox instead of creating a parallel notification store", () => {
    expect(spec).toContain("`pbos_notification_outbox` remains the canonical reliable delivery queue");
    expect(migration).toContain("private.enqueue_notification_event");
    expect(migration).not.toContain("create table");
    expect(migration).not.toContain("public.notifications");
  });

  it("produces notifications only after governed delivery finalization", () => {
    expect(migration).toContain("after update of delivery_state");
    expect(migration).toContain("new.delivery_state='DELIVERED'");
    expect(networkRoute).toContain('rpc("finalize_governed_message_delivery"');
    expect(groupRoute).toContain('rpc("finalize_governed_message_delivery"');
    expect(supportRoute).toContain('rpc("finalize_governed_message_delivery"');
  });

  it("derives recipients from current support, Network, and group authority", () => {
    expect(migration).toContain("public.support_relationships");
    expect(migration).toContain("public.user_connections");
    expect(migration).toContain("public.group_members");
    expect(migration).toContain("gm.profile_id<>new.sender_id");
  });

  it("does not leak message body text into the notification payload", () => {
    expect(migration).toContain("You have a new message in Playbook.");
    expect(migration).not.toContain("new.body");
  });

  it("keeps preferences and final delivery in the existing canonical Notifications service", () => {
    expect(notificationRoute).toContain('from("pbos_notification_preferences")');
    expect(notificationRoute).toContain('from("pbos_notification_outbox")');
    expect(notificationRoute).toContain('rpc("finalize_notification_delivery"');
    expect(notificationRoute).toContain('preference.data?.mode === "muted"');
  });
});
