import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const networkRoute = readFileSync("app/api/network/messages/route.ts", "utf8");
const inbox = readFileSync("components/messages/InboxV2.tsx", "utf8");
const spec = readFileSync("docs/ENGINEERING/MESSAGING_CONVERSATION_SEARCH_SPEC.md", "utf8");

describe("Conversation Search", () => {
  it("keeps search derived from canonical Messaging records", () => {
    expect(spec).toContain("`pbos_conversations` remains the canonical conversation record");
    expect(spec).toContain("`pbos_messages` remains the canonical message record");
    expect(spec).toContain("search creates no duplicate records");
  });

  it("lists all authorized Network conversations through existing RLS", () => {
    expect(networkRoute).toContain("export async function GET()");
    expect(networkRoute).toContain('.from("pbos_conversations")');
    expect(networkRoute).toContain('.eq("conversation_kind", "network")');
    expect(networkRoute).toContain("loadConversation(supabase, user.id");
  });

  it("searches complete authorized inbox labels and message bodies", () => {
    expect(inbox).toContain("fetchNetworkConversations()");
    expect(inbox).toContain('id="conversation-search"');
    expect(inbox).toContain("Search conversations");
    expect(inbox).toContain("conversationLabel(conversation)");
    expect(inbox).toContain("message.body.toLocaleLowerCase().includes(normalizedSearch)");
    expect(inbox).toContain("No authorized conversations match");
  });

  it("keeps search bounded and does not create a search datastore", () => {
    expect(inbox).toContain("maxLength={120}");
    expect(spec).toContain("No SECURITY DEFINER search surface is required");
    expect(spec).toContain("No message body text is emitted to analytics or logs");
  });
});
