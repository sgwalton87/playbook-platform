"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";

type Peer = { id?: string; username?: string | null; full_name?: string | null; first_name?: string | null; last_name?: string | null };
type Conversation = {
  id: string;
  conversation_kind?: "support" | "network" | "group";
  relationship?: { id?: string; supporter_email?: string; relationship?: string };
  peer?: Peer | null;
  group?: { id: string; name: string } | null;
};
type ConversationResponse = { conversations?: Conversation[]; error?: string };

function peerName(peer?: Peer | null) {
  return peer?.full_name || [peer?.first_name, peer?.last_name].filter(Boolean).join(" ") || peer?.username || "Network connection";
}

function conversationLabel(conversation: Conversation) {
  if (conversation.conversation_kind === "network") return `Network · ${peerName(conversation.peer)}`;
  if (conversation.conversation_kind === "group") return `Group · ${conversation.group?.name ?? "Playbook group"}`;
  return `${conversation.relationship?.relationship ?? "Support"} · ${conversation.relationship?.supporter_email ?? "Scholar"}`;
}

async function loadKind(endpoint: string, kind: Conversation["conversation_kind"]) {
  const response = await fetch(endpoint, { cache: "no-store" });
  const result = await response.json() as ConversationResponse;
  if (!response.ok) throw new Error(result.error ?? "Conversations could not be loaded.");
  return (result.conversations ?? []).map(item => ({ ...item, conversation_kind: kind }));
}

function normalizeMeetingUrl(value: string) {
  const parsed = new URL(value.trim());
  if (parsed.protocol !== "https:") throw new Error("Meeting links must use HTTPS.");
  if (!parsed.hostname || parsed.username || parsed.password) throw new Error("Enter a valid HTTPS meeting link.");
  return parsed.toString();
}

export default function MeetingLinksPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [conversationId, setConversationId] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");
  const [label, setLabel] = useState("Join meeting");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("Loading authorized conversations…");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.all([
      loadKind("/api/support-network/messages", "support"),
      loadKind("/api/network/messages", "network"),
      loadKind("/api/groups/messages", "group"),
    ]).then(([support, network, groups]) => {
      if (!active) return;
      const combined = [...support, ...network, ...groups];
      setConversations(combined);
      setConversationId(combined[0]?.id ?? "");
      setStatus(combined.length ? "Choose a conversation and share a meeting link." : "No authorized conversations are available yet.");
    }).catch(cause => {
      if (active) setError(cause instanceof Error ? cause.message : "Conversations could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const selected = useMemo(() => conversations.find(item => item.id === conversationId), [conversations, conversationId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    setSending(true);
    setError("");
    try {
      const url = normalizeMeetingUrl(meetingUrl);
      const safeLabel = label.trim() || "Join meeting";
      const body = `${safeLabel}\n${url}`;
      const endpoint = selected.conversation_kind === "network"
        ? "/api/network/messages"
        : selected.conversation_kind === "group"
          ? "/api/groups/messages"
          : "/api/support-network/messages";
      const payload = selected.conversation_kind === "support"
        ? { relationshipId: selected.relationship?.id, conversationId: selected.id, body, requestId: crypto.randomUUID(), attachmentIds: [] }
        : { action: "SEND", conversationId: selected.id, body, requestId: crypto.randomUUID(), attachmentIds: [] };
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Meeting link could not be shared.");
      setMeetingUrl("");
      setStatus(`Meeting link shared in ${conversationLabel(selected)} through canonical Messaging.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Meeting link could not be shared.");
    } finally {
      setSending(false);
    }
  }

  return <PlaybookPage>
    <PlaybookHero
      eyebrow="Governed Messaging"
      title="Share a meeting link"
      subtitle="Send an HTTPS Zoom, Google Meet, Microsoft Teams, or other meeting URL through Playbook’s existing governed Messaging service. This does not create a duplicate calendar or meeting record."
    />
    <div style={{ maxWidth: 760, margin: "0 auto", color: "#0F172A" }}>
      <p role="status" aria-live="polite">{loading ? "Loading…" : status}</p>
      {error && <p role="alert" style={{ color: "#991B1B" }}>{error}</p>}
      <form onSubmit={submit} style={{ display: "grid", gap: 14, padding: 18, border: "1px solid #CBD5E1", borderRadius: 16, background: "#FFFFFF" }}>
        <label htmlFor="meeting-conversation"><strong>Conversation</strong></label>
        <select id="meeting-conversation" value={conversationId} onChange={event => setConversationId(event.target.value)} disabled={loading || sending || conversations.length === 0} required>
          {conversations.length === 0 && <option value="">No conversations available</option>}
          {conversations.map(conversation => <option key={conversation.id} value={conversation.id}>{conversationLabel(conversation)}</option>)}
        </select>
        <label htmlFor="meeting-label"><strong>Link label</strong></label>
        <input id="meeting-label" value={label} onChange={event => setLabel(event.target.value)} maxLength={120} disabled={sending} />
        <label htmlFor="meeting-url"><strong>Meeting URL</strong></label>
        <input id="meeting-url" type="url" inputMode="url" placeholder="https://…" value={meetingUrl} onChange={event => setMeetingUrl(event.target.value)} maxLength={2048} disabled={sending} required />
        <p style={{ margin: 0, color: "#475569" }}>Only HTTPS links are accepted. Normal conversation permissions, blocks, group membership, delivery provenance, notifications, and read receipts remain enforced by the existing Messaging service.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="submit" disabled={!selected || !meetingUrl.trim() || sending}>{sending ? "Sharing…" : "Share meeting link"}</button>
          <Link href="/messages">Back to messages</Link>
        </div>
      </form>
      {selected && <div style={{ marginTop: 16 }}><PlaybookPill>{conversationLabel(selected)}</PlaybookPill></div>}
    </div>
  </PlaybookPage>;
}
