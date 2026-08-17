import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

describe("Network Messaging integration", () => {
  it("extends the canonical messaging service instead of creating a parallel Network inbox", () => {
    const migration = read("supabase/migrations/202608170085_network_messaging_integration.sql");
    const api = read("app/api/network/messages/route.ts");
    const inbox = read("components/messages/InboxV2.tsx");
    expect(migration).toContain("conversation_kind");
    expect(migration).toContain("network_peer_a_id");
    expect(migration).toContain("network_peer_b_id");
    expect(migration).toContain("public.pbos_conversations");
    expect(api).toContain('from("pbos_messages")');
    expect(inbox).toContain('fetchSupportConversations');
    expect(inbox).toContain('openNetworkConversation');
    expect(migration + api + inbox).not.toContain("network_messages");
  });

  it("keeps peer conversation creation behind current connection authority", () => {
    const migration = read("supabase/migrations/202608170085_network_messaging_integration.sql");
    expect(migration).toContain("public.ensure_network_conversation");
    expect(migration).toContain("private.ensure_network_conversation");
    expect(migration).toContain("public.user_connections");
    expect(migration).toContain("An active Network connection is required.");
    expect(migration).toContain("pbos_conversations_network_pair_key");
    expect(migration).toContain("on conflict (conversation_id,user_id) do nothing");
  });

  it("routes only connected Network cards into the governed peer entry", () => {
    const network = read("app/connections/page.tsx");
    expect(network).toContain('href={`/messages?peer=${encodeURIComponent(person.id)}`}');
    expect(network).toContain("person.connected ? <>");
    expect(network).toContain(">Message</Link>");
  });

  it("preserves support and Network message context semantics", () => {
    const migration = read("supabase/migrations/202608170085_network_messaging_integration.sql");
    const api = read("app/api/network/messages/route.ts");
    expect(migration).toContain("conversation_kind='support'");
    expect(migration).toContain("conversation_kind='network'");
    expect(migration).toContain("pbos_messages.scholar_id is null");
    expect(api).toContain("scholar_id: null");
    expect(api).toContain('eventType: "NETWORK_MESSAGE_SENT"');
  });

  it("documents disconnect revocation and shared-service ownership before implementation", () => {
    const spec = read("docs/ENGINEERING/NETWORK_MESSAGING_INTEGRATION_SPEC.md");
    expect(spec).toContain("Disconnecting a Network relationship therefore revokes future message/conversation access");
    expect(spec).toContain("A parallel `network_messages` table or second inbox is prohibited");
  });
});
