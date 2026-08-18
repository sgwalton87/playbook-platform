import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608180095_messaging_direct_message_authority.sql", "utf8");
const networkRoute = readFileSync("app/api/network/messages/route.ts", "utf8");
const supportRoute = readFileSync("app/api/support-network/messages/route.ts", "utf8");
const inbox = readFileSync("components/messages/InboxV2.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_DIRECT_MESSAGES_SPEC.md", "utf8");

describe("Direct Messages authority", () => {
  it("keeps one canonical shared Messaging service", () => {
    expect(spec).toContain("`pbos_messages` is the canonical message record");
    expect(spec).toContain("Network and support experiences consume the same shared Messaging service");
    expect(networkRoute).toContain('from("pbos_messages")');
    expect(supportRoute).toContain('from("pbos_messages")');
  });

  it("removes generic message UPDATE authority", () => {
    expect(migration).toContain('drop policy if exists "Governed participants update messages"');
    expect(migration).toContain("revoke all on table public.pbos_messages from public, anon, authenticated");
    expect(migration).toContain("grant select, insert on table public.pbos_messages to authenticated");
    expect(migration).not.toContain("grant update on table public.pbos_messages to authenticated");
  });

  it("routes delivery finalization through sender-bound authority", () => {
    expect(migration).toContain("finalize_governed_message_delivery");
    expect(migration).toContain("target.sender_id <> actor_id");
    expect(migration).toContain("delivery_state = 'DELIVERED'");
    expect(networkRoute).toContain('rpc("finalize_governed_message_delivery"');
    expect(supportRoute).toContain('rpc("finalize_governed_message_delivery"');
    expect(networkRoute).not.toContain('.update({ delivery_state: "DELIVERED", provenance })');
    expect(supportRoute).not.toContain('.update({ delivery_state: "DELIVERED", provenance })');
  });

  it("routes reporting through participant-bound authority", () => {
    expect(migration).toContain("report_governed_message");
    expect(migration).toContain("moderation_state = 'REPORTED'");
    expect(networkRoute).toContain('rpc("report_governed_message"');
    expect(supportRoute).toContain('rpc("report_governed_message"');
    expect(networkRoute).not.toContain('.update({ reported_at: now, moderation_state: "REPORTED" })');
    expect(supportRoute).not.toContain('.update({ reported_at: now, moderation_state: "REPORTED" })');
  });

  it("preserves the existing shared inbox experience", () => {
    expect(inbox).toContain("Governed Messaging");
    expect(inbox).toContain("Network");
    expect(inbox).toContain("Mark read");
    expect(inbox).toContain("Add private attachment");
    expect(inbox).toContain('act("REPORT", message.id)');
  });
});
