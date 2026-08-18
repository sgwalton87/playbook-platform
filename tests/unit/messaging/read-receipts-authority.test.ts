import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608180098_messaging_read_receipts_authority.sql", "utf8");
const route = readFileSync("app/api/messages/read-receipts/route.ts", "utf8");
const inbox = readFileSync("components/messages/InboxV2.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_READ_RECEIPTS_SPEC.md", "utf8");

describe("Messaging Read Receipts authority", () => {
  it("keeps participant last_read_at as the canonical source instead of creating a receipt table", () => {
    expect(spec).toContain("`pbos_conversation_participants.last_read_at` remains the canonical read-position record");
    expect(migration).toContain("mark_governed_conversation_read");
    expect(migration).toContain("get_governed_message_read_receipts");
    expect(migration).not.toContain("create table public.pbos_message_read_receipts");
  });

  it("exposes only aggregate receipt counts through one shared Messaging endpoint", () => {
    expect(route).toContain('rpc("get_governed_message_read_receipts"');
    expect(route).toContain('rpc("mark_governed_conversation_read"');
    expect(route).toContain("currentUserId");
    expect(route).toContain("read_count");
    expect(route).not.toContain("reader_id");
    expect(route).not.toContain("user_id");
  });

  it("does not widen participant row visibility", () => {
    expect(spec).toContain("Participant-table SELECT remains self-only");
    expect(migration).not.toContain('drop policy if exists "Participants view their state"');
    expect(migration).not.toContain("grant select on table public.pbos_conversation_participants");
  });

  it("shows receipts only for the current user's sent messages", () => {
    expect(inbox).toContain("/api/messages/read-receipts");
    expect(inbox).toContain("currentUserId");
    expect(inbox).toContain("Seen by");
    expect(inbox).toContain("Seen");
    expect(inbox).toContain('message.sender_id === currentUserId');
  });

  it("keeps read acknowledgement an explicit user action", () => {
    expect(inbox).toContain("Mark read");
    expect(inbox).toContain('method: "POST"');
    expect(spec).toContain("explicit user action");
  });
});
