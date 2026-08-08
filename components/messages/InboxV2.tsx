"use client";

import { FormEvent, useEffect, useState } from "react";
import { PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";

type Message = { id: string; sender_id: string; body: string; delivery_state: string; moderation_state: string; created_at: string };
type Conversation = { id: string; status: string; unreadCount: number; messages: Message[];
  relationship?: { id?: string; supporter_email?: string; relationship?: string }; participant?: { muted_at?: string | null; blocked_at?: string | null } };
type ConversationResponse = { conversations?: Conversation[]; error?: string };

async function fetchConversations(): Promise<ConversationResponse> {
  const response = await fetch("/api/support-network/messages", { cache: "no-store" });
  const result = await response.json() as ConversationResponse;
  if (!response.ok) throw new Error(result.error ?? "Inbox could not be loaded.");
  return result;
}

export default function InboxV2() {
  const [conversations, setConversations] = useState<Conversation[]>([]); const [activeId, setActiveId] = useState("");
  const [body, setBody] = useState(""); const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("Loading governed conversations…"); const [error, setError] = useState("");
  const active = conversations.find(item => item.id === activeId) ?? conversations[0];

  useEffect(() => { let active = true; void fetchConversations().then(result => { if (!active) return;
      setConversations(result.conversations ?? []); setActiveId(current => current || result.conversations?.[0]?.id || "");
      setStatus(result.conversations?.length ? "Governed messages are current." : "No support conversations yet.");
    }).catch(cause => { if (active) { setError(cause instanceof Error ? cause.message : "Inbox could not be loaded."); setStatus(""); } })
      .finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, []);

  async function reload() { setLoading(true); setError(""); try { const result = await fetchConversations();
    setConversations(result.conversations ?? []); setActiveId(current => current || result.conversations?.[0]?.id || "");
    setStatus(result.conversations?.length ? "Governed messages are current." : "No support conversations yet.");
  } catch (cause) { setError(cause instanceof Error ? cause.message : "Inbox could not be loaded."); setStatus(""); }
  finally { setLoading(false); } }

  async function send(event: FormEvent) { event.preventDefault(); if (!active || !body.trim()) return; setSending(true); setError("");
    try { const response = await fetch("/api/support-network/messages", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ relationshipId: active.relationship?.id, conversationId: active.id, body, requestId: crypto.randomUUID() }) });
      const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error ?? "Message failed.");
      setBody(""); setStatus("Message delivered with PBOS provenance."); await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Message failed."); } finally { setSending(false); }
  }
  async function act(action: string, messageId?: string) { if (!active) return; setError("");
    const response = await fetch("/api/support-network/messages", { method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action, conversationId: active.id, messageId }) });
    const result = await response.json() as { error?: string }; if (!response.ok) { setError(result.error ?? "Action failed."); return; }
    setStatus(action === "READ" ? "Conversation marked read." : "Conversation safety setting updated."); await reload();
  }

  return <PlaybookPage><PlaybookHero eyebrow="Governed Messaging" title="Your governed support conversations"
    subtitle="Durable messages, unread state, mute, block, reporting, and PBOS provenance stay inside authorized support relationships." />
    <p role="status" aria-live="polite" style={{ color: "#0F172A" }}>{loading ? "Loading…" : status}</p>{error && <p role="alert">{error} <button onClick={() => void reload()}>Retry</button></p>}
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, color: "#0F172A" }}>
      <aside aria-label="Conversations">{conversations.map(conversation => <button key={conversation.id} onClick={() => setActiveId(conversation.id)}
        aria-pressed={conversation.id === active?.id} style={{ display: "block", width: "100%", padding: 14, marginBottom: 8, textAlign: "left" }}>
        <strong>{conversation.relationship?.relationship ?? "Support"}</strong> · {conversation.relationship?.supporter_email ?? "Scholar"}
        {conversation.unreadCount > 0 && <PlaybookPill>{conversation.unreadCount} unread</PlaybookPill>}</button>)}</aside>
      <article style={{ color: "#0F172A" }}>{!loading && !active && <p style={{ color: "#0F172A" }}>No authorized conversation exists yet. Start from an active support relationship.</p>}
        {active && <><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => void act("READ")}>Mark read</button>
          <button onClick={() => void act(active.participant?.muted_at ? "UNMUTE" : "MUTE")}>{active.participant?.muted_at ? "Unmute" : "Mute"}</button>
          <button onClick={() => void act(active.participant?.blocked_at ? "UNBLOCK" : "BLOCK")}>{active.participant?.blocked_at ? "Unblock" : "Block"}</button></div>
          <form onSubmit={send}><label htmlFor="message-body" style={{ color: "#0F172A" }}>Message</label><textarea id="message-body" value={body}
            onChange={event => setBody(event.target.value)} disabled={sending || Boolean(active.participant?.blocked_at)} maxLength={2000} required />
            <button disabled={sending || Boolean(active.participant?.blocked_at)}>{sending ? "Sending…" : "Send message"}</button></form>
          <div aria-label="Message history">{active.messages.map(message => <article key={message.id} style={{ padding: 12, borderBottom: "1px solid #E2E8F0", color: "#0F172A" }}>
            <p style={{ color: "#0F172A" }}>{message.body}</p><small style={{ color: "#0F172A" }}>{message.delivery_state} · {new Date(message.created_at).toLocaleString()}</small>
            <button onClick={() => void act("REPORT", message.id)}>Report</button></article>)}</div></>}
      </article></section></PlaybookPage>;
}
