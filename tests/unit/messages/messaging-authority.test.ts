import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608160044_messaging_revocation_attachment_authority.sql", "utf8");
const cleanupMigration = readFileSync("supabase/migrations/202608160046_messaging_attachment_orphan_cleanup.sql", "utf8");
const messagesRoute = readFileSync("app/api/support-network/messages/route.ts", "utf8");
const attachmentRoute = readFileSync("app/api/support-network/messages/attachments/route.ts", "utf8");
const inbox = readFileSync("components/messages/InboxV2.tsx", "utf8");

describe("governed messaging authority convergence", () => {
  it("rechecks active support authority at participant and message RLS boundaries", () => {
    expect(migration).toContain("private.pbos_user_has_active_conversation_access");
    expect(migration).toContain('policy "Participants update their state"');
    expect(migration).toContain('policy "Governed participants view messages"');
    expect(migration).toContain('policy "Governed participants send messages"');
    expect(migration).toContain("r.status = 'active'");
  });

  it("requires active relationship authority before API state mutations", () => {
    expect(messagesRoute).toContain("const relationships = await relationshipsFor(supabase, user)");
    expect(messagesRoute).toContain('.eq("status", "ACTIVE").in("relationship_id", relationshipIds)');
    expect(messagesRoute).toContain('"An active support relationship is required."');
  });

  it("keeps attachments private and bounded", () => {
    expect(migration).toContain("'pbos-message-attachments'");
    expect(migration).toContain("false,\n  10485760");
    expect(migration).toContain("pbos_message_attachment_path_scope");
    expect(attachmentRoute).toContain("const MAX_BYTES = 10 * 1024 * 1024");
    expect(attachmentRoute).toContain("createSignedUrl(attachment.data.storage_path, 60)");
    expect(attachmentRoute).not.toContain("getPublicUrl");
  });

  it("only allows staged attachment deletion and supports orphan cleanup", () => {
    expect(cleanupMigration).toContain("a.message_id is null");
    expect(cleanupMigration).toContain("not exists (select 1 from public.pbos_message_attachments");
    expect(attachmentRoute).toContain('if (attachment.data.message_id) return NextResponse.json({ error: "Sent attachments cannot be removed from message history." }');
  });

  it("binds attachments before PBOS publishes message delivery", () => {
    const bindIndex = messagesRoute.indexOf('update({ message_id: stagedMessage.id })');
    const publishIndex = messagesRoute.indexOf('client.send("PUBLISH_LIFECYCLE_EVENT"');
    expect(bindIndex).toBeGreaterThan(-1);
    expect(publishIndex).toBeGreaterThan(bindIndex);
    expect(messagesRoute).toContain("attachmentIds,");
  });

  it("surfaces staged and delivered attachments in the governed Inbox", () => {
    expect(inbox).toContain("Add private attachment");
    expect(inbox).toContain("Staged attachments");
    expect(inbox).toContain("Message attachments");
    expect(inbox).toContain("attachmentIds: staged.map");
    expect(inbox).toContain("openAttachment");
  });
});
