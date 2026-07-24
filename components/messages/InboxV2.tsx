"use client";

import { useMemo, useState } from "react";
import { PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";
import {
  buildConversationMessage,
  getDemoConversationMessages,
  getDemoConversations,
} from "@/lib/messages";

export default function InboxV2() {
  const conversations = useMemo(() => getDemoConversations(), []);
  const [activeId, setActiveId] = useState(conversations[0]?.id || "");
  const [body, setBody] = useState("");
  const [messagesByThread, setMessagesByThread] = useState<Record<string, LegacyValue[]>>({
    "support-network": getDemoConversationMessages(),
    family: getDemoConversationMessages(),
    mentor: getDemoConversationMessages(),
    "fafsa-action": getDemoConversationMessages(),
  });

  const activeConversation = conversations.find((c) => c.id === activeId) || null;
  const messages = activeId ? messagesByThread[activeId] || [] : [];

  function sendMessage() {
    if (!body.trim()) return;

    const message = buildConversationMessage({
      conversationId: activeId,
      senderRole: "scholar",
      senderName: "Playbook Member",
      body,
    });

    setMessagesByThread({
      ...messagesByThread,
      [activeId]: [message, ...messages],
    });

    setBody("");
  }

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Playbook Inbox v2"
        title="A real inbox for the scholar support system."
        subtitle="Direct messages, support-network threads, shared-action conversations, unread states, and email replies can live here."
      />

      <section style={shell} data-playbook-inbox-shell="true">
        <aside style={sidebar}>
          <p style={eyebrow}>Conversations</p>

          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => setActiveId(conversation.id)}
              style={{
                ...threadButton,
                borderColor: activeId === conversation.id ? "#F97316" : "#E2E8F0",
              }}
            >
              <div style={threadTop}>
                <strong>{conversation.title}</strong>
                {conversation.unreadCount > 0 && <span style={unread}>{conversation.unreadCount}</span>}
              </div>
              <p style={preview}>{conversation.lastMessage}</p>
              <PlaybookPill>{conversation.kind.replaceAll("_", " ")}</PlaybookPill>
            </button>
          ))}
        </aside>

        <section style={thread}>
          {activeConversation ? <div style={threadHeader}>
            <p style={eyebrow}>{activeConversation.kind.replaceAll("_", " ")}</p>
            <h2 style={threadTitle}>{activeConversation.title}</h2>
            <p style={participants}>{activeConversation.participants.join(" • ")}</p>
          </div> : <div style={threadHeader}><p style={eyebrow}>Empty inbox</p><h2 style={threadTitle}>No live conversations yet.</h2><p style={participants}>Demo message threads have been removed from production runtime.</p></div>}

          <div style={composer}>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write a message..."
              style={textarea}
            />
            <button onClick={sendMessage} style={send}>Send</button>
          </div>

          <div style={messageList}>
            {messages.map((message) => (
              <article key={message.id} style={messageCard}>
                <div style={messageTop}>
                  <strong>{message.senderName}</strong>
                  <span style={source}>{message.source}</span>
                </div>
                <p style={messageBody}>{message.body}</p>

                {message.actionId && (
                  <div style={attachment}>
                    Attached action: {message.actionId.replaceAll("-", " ")}
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>
      </section>
    </PlaybookPage>
  );
}

const shell: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "330px 1fr", gap: 16 };
const sidebar: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 18, boxShadow: "0 16px 40px rgba(15,23,42,.06)", height: "fit-content" };
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 950, color: "#F97316", margin: 0 };
const threadButton: React.CSSProperties = { width: "100%", textAlign: "left", background: "#fff", border: "2px solid #E2E8F0", borderRadius: 16, padding: 14, marginTop: 12, cursor: "pointer" };
const threadTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 10, color: "#0F172A" };
const unread: React.CSSProperties = { background: "#F97316", color: "#fff", borderRadius: 999, padding: "3px 7px", fontSize: 11, fontWeight: 950 };
const preview: React.CSSProperties = { color: "#64748B", fontSize: 13, lineHeight: 1.45 };
const thread: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 22, boxShadow: "0 16px 40px rgba(15,23,42,.06)" };
const threadHeader: React.CSSProperties = { borderBottom: "1px solid #E2E8F0", paddingBottom: 16, marginBottom: 16 };
const threadTitle: React.CSSProperties = { color: "#0F172A", fontSize: 32, margin: "8px 0" };
const participants: React.CSSProperties = { color: "#64748B", margin: 0 };
const composer: React.CSSProperties = { display: "grid", gap: 10, marginBottom: 16 };
const textarea: React.CSSProperties = { width: "100%", boxSizing: "border-box", minHeight: 100, border: "1px solid #E2E8F0", borderRadius: 16, padding: 14 };
const send: React.CSSProperties = { width: "fit-content", background: "#F97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 14px", fontWeight: 950, cursor: "pointer" };
const messageList: React.CSSProperties = { display: "grid", gap: 12 };
const messageCard: React.CSSProperties = { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 14 };
const messageTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", color: "#0F172A" };
const source: React.CSSProperties = { background: "#E2E8F0", borderRadius: 999, padding: "4px 7px", fontSize: 11, fontWeight: 900 };
const messageBody: React.CSSProperties = { color: "#334155", lineHeight: 1.55 };
const attachment: React.CSSProperties = { background: "#FFF7ED", border: "1px solid #FED7AA", color: "#9A3412", borderRadius: 12, padding: 10, fontSize: 12, fontWeight: 850 };
