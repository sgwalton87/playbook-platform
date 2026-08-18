"use client";

import { ChangeEvent, FormEvent, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";

type Attachment = { id: string; original_name: string; mime_type: string; byte_size: number; message_id?: string | null };
type Message = { id: string; sender_id: string; body: string; delivery_state: string; moderation_state: string; created_at: string; attachments?: Attachment[] };
type Peer = { id?: string; username?: string | null; full_name?: string | null; first_name?: string | null; last_name?: string | null };
type Group = { id: string; name: string; description?: string | null; is_private?: boolean | null };
type Conversation = { id: string; status: string; conversation_kind?: "support" | "network" | "group"; unreadCount: number; messages: Message[];
  relationship?: { id?: string; supporter_email?: string; relationship?: string }; peer?: Peer | null; group?: Group | null;
  participant?: { muted_at?: string | null; blocked_at?: string | null } };
type ConversationResponse = { conversations?: Conversation[]; error?: string };

async function fetchSupportConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/support-network/messages", { cache: "no-store" });
  const result = await response.json() as ConversationResponse;
  if (!response.ok) throw new Error(result.error ?? "Inbox could not be loaded.");
  return (result.conversations ?? []).map(item => ({ ...item, conversation_kind: "support" }));
}

async function fetchGroupConversations(): Promise<Conversation[]> {
  const response = await fetch("/api/groups/messages", { cache: "no-store" });
  const result = await response.json() as ConversationResponse;
  if (!response.ok) throw new Error(result.error ?? "Group conversations could not be loaded.");
  return (result.conversations ?? []).map(item => ({ ...item, conversation_kind: "group" }));
}

async function openNetworkConversation(peerId: string): Promise<Conversation> {
  const response = await fetch("/api/network/messages", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "OPEN", peerId }) });
  const result = await response.json() as { conversation?: Conversation; error?: string };
  if (!response.ok || !result.conversation) throw new Error(result.error ?? "Network conversation could not be opened.");
  return { ...result.conversation, conversation_kind: "network" };
}

async function openGroupConversation(groupId: string): Promise<Conversation> {
  const response = await fetch("/api/groups/messages", { method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "OPEN", groupId }) });
  const result = await response.json() as { conversation?: Conversation; error?: string };
  if (!response.ok || !result.conversation) throw new Error(result.error ?? "Group conversation could not be opened.");
  return { ...result.conversation, conversation_kind: "group" };
}

function bytesLabel(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.ceil(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
function peerName(peer?: Peer | null) { return peer?.full_name || [peer?.first_name, peer?.last_name].filter(Boolean).join(" ") || peer?.username || "Network connection"; }

export default function InboxV2() {
  const searchParams = useSearchParams();
  const requestedPeerId = searchParams.get("peer") ?? "";
  const requestedGroupId = searchParams.get("group") ?? "";
  const [conversations, setConversations] = useState<Conversation[]>([]); const [activeId, setActiveId] = useState("");
  const [body, setBody] = useState(""); const [loading, setLoading] = useState(true); const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false); const [staged, setStaged] = useState<Attachment[]>([]);
  const [status, setStatus] = useState("Loading governed conversations…"); const [error, setError] = useState("");
  const active = conversations.find(item => item.id === activeId) ?? conversations[0];

  const load = useCallback(async () => {
    const [support, existingGroups] = await Promise.all([fetchSupportConversations(), fetchGroupConversations()]);
    let network: Conversation | null = null;
    let requestedGroup: Conversation | null = null;
    if (requestedPeerId) network = await openNetworkConversation(requestedPeerId);
    if (requestedGroupId) requestedGroup = await openGroupConversation(requestedGroupId);

    const byId = new Map<string, Conversation>();
    for (const item of [...support, ...existingGroups]) byId.set(item.id, item);
    if (network) byId.set(network.id, network);
    if (requestedGroup) byId.set(requestedGroup.id, requestedGroup);
    const combined = [...byId.values()];

    setConversations(combined);
    setActiveId(current => requestedGroup?.id || network?.id || current || combined[0]?.id || "");
    setStatus(combined.length ? "Governed messages are current." : "No governed conversations yet.");
  }, [requestedGroupId, requestedPeerId]);

  useEffect(() => {
    let mounted = true;
    const timer = window.setTimeout(() => {
      void load().catch(cause => { if (mounted) { setError(cause instanceof Error ? cause.message : "Inbox could not be loaded."); setStatus(""); } })
        .finally(() => { if (mounted) setLoading(false); });
    }, 0);
    return () => { mounted = false; window.clearTimeout(timer); };
  }, [load]);

  async function reload() { setLoading(true); setError(""); try { await load(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Inbox could not be loaded."); setStatus(""); }
    finally { setLoading(false); } }

  async function uploadAttachment(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file || !active) return;
    if (staged.length >= 5) { setError("A message can include up to 5 attachments."); return; }
    setUploading(true); setError("");
    try {
      const form = new FormData(); form.set("conversationId", active.id); form.set("file", file);
      const response = await fetch("/api/support-network/messages/attachments", { method: "POST", body: form });
      const result = await response.json() as { attachment?: Attachment; error?: string };
      if (!response.ok || !result.attachment) throw new Error(result.error ?? "Attachment upload failed.");
      setStaged(current => [...current, result.attachment!]); setStatus(`${file.name} is staged privately for this message.`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Attachment upload failed."); }
    finally { setUploading(false); }
  }

  async function removeAttachment(attachmentId: string) {
    setError("");
    const response = await fetch(`/api/support-network/messages/attachments?attachmentId=${encodeURIComponent(attachmentId)}`, { method: "DELETE" });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Attachment could not be removed."); return; }
    setStaged(current => current.filter(item => item.id !== attachmentId)); setStatus("Staged attachment removed.");
  }

  async function openAttachment(attachmentId: string) {
    setError("");
    const response = await fetch(`/api/support-network/messages/attachments?attachmentId=${encodeURIComponent(attachmentId)}`, { cache: "no-store" });
    const result = await response.json() as { signedUrl?: string; error?: string };
    if (!response.ok || !result.signedUrl) { setError(result.error ?? "Attachment is no longer authorized."); return; }
    window.open(result.signedUrl, "_blank", "noopener,noreferrer");
  }

  function endpointFor(conversation: Conversation) {
    return conversation.conversation_kind === "network" ? "/api/network/messages"
      : conversation.conversation_kind === "group" ? "/api/groups/messages"
        : "/api/support-network/messages";
  }

  async function send(event: FormEvent) {
    event.preventDefault(); if (!active || !body.trim()) return; setSending(true); setError("");
    try {
      const endpoint = endpointFor(active);
      const payload = active.conversation_kind === "network"
        ? { action: "SEND", conversationId: active.id, body, requestId: crypto.randomUUID(), attachmentIds: staged.map(item => item.id) }
        : active.conversation_kind === "group"
          ? { action: "SEND", conversationId: active.id, body, requestId: crypto.randomUUID(), attachmentIds: staged.map(item => item.id) }
          : { relationshipId: active.relationship?.id, conversationId: active.id, body, requestId: crypto.randomUUID(), attachmentIds: staged.map(item => item.id) };
      const response = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error ?? "Message failed.");
      setBody(""); setStaged([]); setStatus("Message delivered with PBOS provenance and governed attachment lineage."); await reload();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Message failed."); } finally { setSending(false); }
  }

  async function act(action: string, messageId?: string) {
    if (!active) return; setError("");
    const response = await fetch(endpointFor(active), {
      method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ action, conversationId: active.id, messageId }) });
    const result = await response.json() as { error?: string }; if (!response.ok) { setError(result.error ?? "Action failed."); return; }
    setStatus(action === "READ" ? "Conversation marked read." : "Conversation safety setting updated."); await reload();
  }

  return <PlaybookPage><PlaybookHero eyebrow="Governed Messaging" title="Your conversations"
    subtitle="Support, connected-peer, and group messages share one governed service with private attachments, unread state, safety controls, and PBOS provenance." />
    <p role="status" aria-live="polite" style={{ color: "#0F172A" }}>{loading ? "Loading…" : status}</p>{error && <p role="alert">{error} <button onClick={() => void reload()}>Retry</button></p>}
    <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, color: "#0F172A" }}>
      <aside aria-label="Conversations">{conversations.map(conversation => <button key={conversation.id} onClick={() => { setActiveId(conversation.id); setStaged([]); }}
        aria-pressed={conversation.id === active?.id} style={{ display: "block", width: "100%", padding: 14, marginBottom: 8, textAlign: "left" }}>
        {conversation.conversation_kind === "network" ? <><strong>Network</strong> · {peerName(conversation.peer)}</>
          : conversation.conversation_kind === "group" ? <><strong>Group</strong> · {conversation.group?.name ?? "Playbook group"}</>
            : <><strong>{conversation.relationship?.relationship ?? "Support"}</strong> · {conversation.relationship?.supporter_email ?? "Scholar"}</>}
        {conversation.unreadCount > 0 && <PlaybookPill>{conversation.unreadCount} unread</PlaybookPill>}</button>)}</aside>
      <article style={{ color: "#0F172A" }}>{!loading && !active && <p style={{ color: "#0F172A" }}>No authorized conversation exists yet. Start from a connected Network member, an existing Playbook group, or an active support relationship.</p>}
        {active && <><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => void act("READ")}>Mark read</button>
          <button onClick={() => void act(active.participant?.muted_at ? "UNMUTE" : "MUTE")}>{active.participant?.muted_at ? "Unmute" : "Mute"}</button>
          <button onClick={() => void act(active.participant?.blocked_at ? "UNBLOCK" : "BLOCK")}>{active.participant?.blocked_at ? "Unblock" : "Block"}</button></div>
          <form onSubmit={send}><label htmlFor="message-body" style={{ color: "#0F172A" }}>Message</label><textarea id="message-body" value={body}
            onChange={event => setBody(event.target.value)} disabled={sending || Boolean(active.participant?.blocked_at)} maxLength={2000} required />
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <label><span style={{ textDecoration: "underline", cursor: "pointer" }}>{uploading ? "Uploading…" : "Add private attachment"}</span>
                <input type="file" hidden disabled={uploading || sending || staged.length >= 5 || Boolean(active.participant?.blocked_at)}
                  accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.docx" onChange={event => void uploadAttachment(event)} /></label>
              <small>PDF, image, text, or DOCX · 10 MB max · 5 files</small>
            </div>
            {staged.length > 0 && <ul aria-label="Staged attachments">{staged.map(item => <li key={item.id}>{item.original_name} · {bytesLabel(item.byte_size)}
              <button type="button" onClick={() => void removeAttachment(item.id)}>Remove</button></li>)}</ul>}
            <button disabled={sending || uploading || Boolean(active.participant?.blocked_at)}>{sending ? "Sending…" : "Send message"}</button></form>
          <div aria-label="Message history">{active.messages.map(message => <article key={message.id} style={{ padding: 12, borderBottom: "1px solid #E2E8F0", color: "#0F172A" }}>
            <p style={{ color: "#0F172A" }}>{message.body}</p>
            {message.attachments?.length ? <ul aria-label="Message attachments">{message.attachments.map(item => <li key={item.id}>
              <button onClick={() => void openAttachment(item.id)}>{item.original_name} · {bytesLabel(item.byte_size)}</button></li>)}</ul> : null}
            <small style={{ color: "#0F172A" }}>{message.delivery_state} · {new Date(message.created_at).toLocaleString()}</small>
            <button onClick={() => void act("REPORT", message.id)}>Report</button></article>)}</div></>}
      </article></section></PlaybookPage>;
}