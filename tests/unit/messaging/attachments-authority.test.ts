import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync("supabase/migrations/202608180097_messaging_attachments_grant_hardening.sql", "utf8");
const api = readFileSync("app/api/support-network/messages/attachments/route.ts", "utf8");
const inbox = readFileSync("components/messages/InboxV2.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_ATTACHMENTS_SPEC.md", "utf8");

describe("Messaging Attachments authority", () => {
  it("removes anonymous metadata authority and limits authenticated update", () => {
    expect(migration).toContain("revoke all on table public.pbos_message_attachments from public, anon, authenticated");
    expect(migration).toContain("grant select, insert, delete on table public.pbos_message_attachments to authenticated");
    expect(migration).toContain("grant update (message_id) on table public.pbos_message_attachments to authenticated");
  });

  it("keeps private upload constraints aligned across API and UI", () => {
    expect(api).toContain("const MAX_BYTES = 10 * 1024 * 1024");
    expect(api).toContain('"application/pdf"');
    expect(api).toContain('"image/jpeg"');
    expect(api).toContain('"image/png"');
    expect(api).toContain('"image/webp"');
    expect(api).toContain('"text/plain"');
    expect(api).toContain("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    expect(inbox).toContain("staged.length >= 5");
    expect(inbox).toContain("10 MB max · 5 files");
  });

  it("keeps downloads private and staged deletion scoped", () => {
    expect(api).toContain("createSignedUrl(attachment.data.storage_path, 60)");
    expect(api).toContain("Sent attachments cannot be removed from message history.");
    expect(api).toContain('.eq("uploader_id", user.id)');
    expect(spec).toContain("Sent attachments remain immutable message history");
  });

  it("keeps one shared attachment service for every Messaging context", () => {
    expect(spec).toContain("Support, Network, and group experiences reuse the same attachment API and storage boundary");
    expect(spec).toContain("`pbos_message_attachments` is the canonical attachment metadata record");
    expect(inbox).toContain('/api/support-network/messages/attachments');
  });
});
