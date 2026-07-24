"use client";

import { useEffect, useState } from "react";
import {
  createSupportMessage,
  getDemoSharedActions,
  getDemoSupportThread,
} from "@/lib/support-network-live";

const DEMO_SCHOLAR_ID = "scholar-maya";

export default function SupportNetworkLiveCenter() {
  const [body, setBody] = useState("");
  const [messages, setMessages] = useState<LegacyValue[]>(getDemoSupportThread());
  const [actions, setActions] = useState<LegacyValue[]>(getDemoSharedActions());
  const [status, setStatus] = useState("Demo data loaded.");

  useEffect(() => {
    async function load() {
      try {
        const [msgRes, actionRes] = await Promise.all([
          fetch(`/api/support-network/messages?scholarId=${DEMO_SCHOLAR_ID}`),
          fetch(`/api/support-network/actions?scholarId=${DEMO_SCHOLAR_ID}`),
        ]);

        const msgJson = await msgRes.json();
        const actionJson = await actionRes.json();

        if (msgRes.ok && msgJson.messages?.length) setMessages(msgJson.messages);
        if (actionRes.ok && actionJson.actions?.length) setActions(actionJson.actions);

        setStatus("Connected to support network APIs.");
      } catch {
        setStatus("Using demo support network data.");
      }
    }

    load();
  }, []);

  async function sendMessage() {
    if (!body.trim()) return;

    const optimistic = createSupportMessage({
      scholarId: DEMO_SCHOLAR_ID,
      senderRole: "family",
      body,
    });

    setMessages([optimistic, ...messages]);
    setBody("");

    try {
      const res = await fetch("/api/support-network/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scholarId: DEMO_SCHOLAR_ID, senderRole: "family", body }),
      });

      const json = await res.json();

      if (res.ok && json.message) {
        setMessages((current) => [json.message, ...current.slice(1)]);
      }
    } catch {
      setStatus("Message saved locally for demo only.");
    }
  }

  async function updateAction(id: string, status: string) {
    setActions(actions.map((a) => (a.id === id ? { ...a, status } : a)));

    try {
      await fetch("/api/support-network/actions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
    } catch {
      setStatus("Action update saved locally for demo only.");
    }
  }

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Support Network Messaging v2</p>
        <h1 style={title}>Persisted messages, shared actions, and email-aware coordination.</h1>
        <p style={sub}>{status}</p>
      </section>

      <section style={grid}>
        <article style={card}>
          <p style={eyebrow}>Shared Actions</p>
          <h2 style={cardTitle}>Assigned support tasks</h2>

          {actions.map((action: LegacyValue, index) => (
            <div key={action.id || action.title} style={item}>
              <strong>{action.title}</strong>
              <span>{action.assigned_role}</span>
              <p>{action.detail}</p>
              <small>Status: {action.status || "open"}</small>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                {["open", "in_progress", "complete"].map((state) => (
                  <button
                    key={state}
                    onClick={() => updateAction(action.id || String(index), state)}
                    style={miniButton}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </article>

        <article style={card}>
          <p style={eyebrow}>Free Text DMs</p>
          <h2 style={cardTitle}>Support thread</h2>

          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Send a message to the support network..."
            style={textarea}
          />

          <button onClick={sendMessage} style={button}>Send message</button>

          <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
            {messages.map((msg: LegacyValue, i) => (
              <div key={`${msg.sender_role}-${i}`} style={message}>
                <strong>{msg.sender_role}</strong>
                <p>{msg.body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", padding: 32, fontFamily: "system-ui, sans-serif" };
const hero: React.CSSProperties = { maxWidth: 1120, margin: "0 auto 18px", background: "#0F172A", color: "#fff", borderRadius: 30, padding: 34 };
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 950, color: "#F97316", margin: 0 };
const title: React.CSSProperties = { fontSize: 50, lineHeight: 1, margin: "12px 0" };
const sub: React.CSSProperties = { color: "#CBD5E1", fontSize: 17, lineHeight: 1.6 };
const grid: React.CSSProperties = { maxWidth: 1120, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 16 };
const card: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 24, boxShadow: "0 16px 40px rgba(15,23,42,.06)" };
const cardTitle: React.CSSProperties = { color: "#0F172A", fontSize: 25, margin: "8px 0 16px" };
const item: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 16, padding: 14, marginBottom: 10, color: "#0F172A" };
const textarea: React.CSSProperties = { width: "100%", boxSizing: "border-box", minHeight: 110, border: "1px solid #E2E8F0", borderRadius: 16, padding: 14 };
const button: React.CSSProperties = { marginTop: 10, background: "#F97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 13px", fontWeight: 950 };
const miniButton: React.CSSProperties = { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 999, padding: "6px 8px", fontSize: 11, fontWeight: 800 };
const message: React.CSSProperties = { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 14, color: "#0F172A" };
