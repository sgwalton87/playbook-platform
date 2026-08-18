import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608180096_messaging_group_messages_authority.sql", "utf8");
const route = readFileSync("app/api/groups/messages/route.ts", "utf8");
const inbox = readFileSync("components/messages/InboxV2.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_GROUP_MESSAGES_SPEC.md", "utf8");

describe("Group Messages authority", () => {
  it("adopts the canonical group baseline without creating a parallel message store", () => {
    expect(migration).toContain("create table if not exists public.groups");
    expect(migration).toContain("create table if not exists public.group_members");
    expect(spec).toContain("The legacy `messages` table is not a Group Messages authority");
    expect(route).toContain('from("pbos_messages")');
    expect(route).not.toContain('from("messages")');
  });

  it("adds one stable PBOS conversation per canonical group", () => {
    expect(migration).toContain("group_id uuid references public.groups(id)");
    expect(migration).toContain("pbos_conversations_group_key");
    expect(migration).toContain("conversation_kind='group'");
    expect(migration).toContain("ensure_group_conversation");
    expect(route).toContain('rpc("ensure_group_conversation"');
  });

  it("uses current group membership as authority rather than participant history", () => {
    expect(migration).toContain("from public.group_members gm");
    expect(migration).toContain("gm.group_id=c.group_id and gm.profile_id=p_user_id");
    expect(spec).toContain("Removing group membership shall revoke");
    expect(spec).toContain("Authorization always derives from `group_members`");
  });

  it("extends immutable messages and private attachments to the group context", () => {
    expect(migration).toContain("c.conversation_kind in ('network','group')");
    expect(migration).toContain('drop policy if exists "Current participants upload message attachments"');
    expect(route).toContain('rpc("finalize_governed_message_delivery"');
    expect(route).toContain('rpc("report_governed_message"');
    expect(route).toContain('from("pbos_message_attachments").update({ message_id: message.id })');
  });

  it("surfaces group conversations through the one shared inbox", () => {
    expect(inbox).toContain('fetch("/api/groups/messages"');
    expect(inbox).toContain('searchParams.get("group")');
    expect(inbox).toContain('conversation_kind === "group"');
    expect(inbox).toContain("Support, connected-peer, and group messages share one governed service");
  });
});
