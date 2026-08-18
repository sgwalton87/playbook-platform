import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608180100_messaging_block_user_authority.sql", "utf8");
const preflight = readFileSync("supabase/tests/messaging_block_user_preflight.sql", "utf8");
const trustRoute = readFileSync("app/api/trust/block/route.ts", "utf8");
const inbox = readFileSync("components/messages/InboxV2.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_BLOCK_USER_SPEC.md", "utf8");
const workflow = readFileSync(".github/workflows/database-certification.yml", "utf8");

describe("Messaging Block User authority", () => {
  it("keeps user_blocks as the canonical shared Trust record", () => {
    expect(spec).toContain("`user_blocks` is the single canonical user-to-user block record");
    expect(spec).toContain("`pbos_conversation_participants.blocked_at` is not a user-block authority");
    expect(migration).toContain("create or replace function public.set_user_block");
    expect(migration).toContain("create or replace function public.get_governed_conversation_block_states");
    expect(migration).not.toContain("create table public.messaging_user_blocks");
  });

  it("removes broad client mutation and anonymous Block User grants", () => {
    expect(migration).toContain("revoke all on table public.user_blocks from public,anon,authenticated");
    expect(migration).toContain("grant select on table public.user_blocks to authenticated");
    expect(migration).not.toContain("grant insert on table public.user_blocks to authenticated");
    expect(migration).toContain("grant update(last_read_at,muted_at) on table public.pbos_conversation_participants to authenticated");
    expect(migration).not.toContain("grant update(blocked_at)");
  });

  it("enforces the bilateral one-to-one Messaging barrier at database boundaries", () => {
    expect(migration).toContain("private.user_block_exists");
    expect(migration).toContain("private.pbos_conversation_has_active_user_block");
    expect(migration).toContain("not private.pbos_conversation_has_active_user_block(conversation_id,(select auth.uid()))");
    expect(migration).toContain("Messaging is unavailable between these users.");
    expect(migration).toContain("Current participants upload message attachments");
    expect(migration).toContain("finalize_governed_message_delivery");
    expect(preflight).toContain("Block erased canonical message history");
    expect(preflight).toContain("Group message survives a peer block");
  });

  it("routes visible Block User actions through the shared Trust API", () => {
    expect(trustRoute).toContain('rpc("set_user_block"');
    expect(trustRoute).toContain('rpc("get_governed_conversation_block_states"');
    expect(trustRoute).not.toContain('.from("user_blocks")');
    expect(inbox).toContain('fetch("/api/trust/block"');
    expect(inbox).toContain("active.conversation_kind !== \"group\"");
    expect(inbox).toContain("Block user");
    expect(inbox).toContain("Unblock user");
    expect(inbox).toContain("messagingBlocked");
    expect(inbox).not.toContain("active.participant?.blocked_at");
  });

  it("registers the behavioral proof in full Database Certification", () => {
    expect(workflow).toContain("Certify Messaging Block User authority");
    expect(workflow).toContain("supabase/tests/messaging_block_user_preflight.sql");
  });
});
