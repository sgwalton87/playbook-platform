"use client";

import { useEffect, useState } from "react";
import { PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type LiveMessage = {
  id: string;
  sender_name: string;
  sender_role: string;
  body: string;
  created_at: string;
};

type LiveNetwork = {
  id: string;
  scholarId: string;
  title: string;
  participants: string[];
  unreadCount: number;
  lastMessage: string;
  messages: LiveMessage[];
};

type CurrentUser = {
  id: string;
  name: string;
  role: string;
};

export default function LiveInbox() {
  const [networks, setNetworks] = useState<LiveNetwork[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [activeId, setActiveId] = useState("");
  const [body, setBody] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");

  async function load() {
    setState("loading");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;

    if (!token) {
      setState("signed-out");
      return;
    }

    setAccessToken(token);
    const response = await fetch("/api/messages", {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);

    if (!response?.ok) {
      setState("error");
      return;
    }

    const result = await response.json();
    setCurrentUser(result.currentUser);
    setNetworks(result.networks || []);
    setActiveId((current) => current || result.networks?.[0]?.id || "");
    setState("ready");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const activeNetwork = networks.find((network) => network.id === activeId) || null;

  async function sendMessage() {
    if (!body.trim() || !activeNetwork || !currentUser || !accessToken) return;

    const response = await fetch("/api/support-network/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        scholarId: activeNetwork.scholarId,
        senderRole: currentUser.role,
        body: body.trim(),
      }),
    }).catch(() => null);

    if (!response?.ok) return;

    setBody("");
    await load();
  }

  if (state === "loading") return <InboxState title="Opening your live inbox…" body="Loading your authenticated relationships and messages." />;
  if (state === "signed-out") return <InboxState title="Sign in to open Messages." body="Your inbox is private and connected to your Playbook relationships." href="/login" />;
  if (state === "error") return <InboxState title="Messages need another moment." body="We could not load your live inbox. No demo messages were substituted." onRetry={load} />;

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Live Playbook Inbox"
        title="The people in your Playbook. The conversations that move things forward."
        subtitle="Every name, relationship, and message below comes from an authenticated profile or persisted support-network record."
      />

      {networks.length === 0 ? (
        <section style={empty}>
          <p style={eyebrow}>No fabricated conversations</p>
          <h2 style={threadTitle}>Your inbox is ready for real connections.</h2>
          <p style={preview}>Once an invitation is accepted and role onboarding is complete, that relationship and its messages will appear here.</p>
          <a href="/support-network" style={send}>Open Support Network</a>
        </section>
      ) : (
        <section style={shell} data-playbook-inbox-shell="true">
          <aside style={sidebar}>
            <p style={eyebrow}>Your networks</p>
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => setActiveId(network.id)}
                style={{
                  ...threadButton,
                  borderColor: activeId === network.id ? "#F97316" : "#E2E8F0",
                }}
              >
                <div style={threadTop}>
                  <strong>{network.title}</strong>
                  {network.unreadCount > 0 && <span style={unread}>{network.unreadCount}</span>}
                </div>
                <p style={preview}>{network.lastMessage}</p>
                <PlaybookPill>support network</PlaybookPill>
              </button>
            ))}
          </aside>

          {activeNetwork && (
            <section style={thread}>
              <div style={threadHeader}>
                <p style={eyebrow}>Authenticated relationship thread</p>
                <h2 style={threadTitle}>{activeNetwork.title}</h2>
                <p style={participants}>{activeNetwork.participants.join(" • ")}</p>
              </div>

              <div style={composer}>
                <textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Write a message…" style={textarea} />
                <button onClick={sendMessage} style={send}>Send</button>
              </div>

              <div style={messageList}>
                {activeNetwork.messages.length === 0 && (
                  <p style={preview}>No messages yet. Start the first real conversation.</p>
                )}
                {activeNetwork.messages.map((message) => (
                  <article key={message.id} style={messageCard}>
                    <div style={messageTop}>
                      <strong>{message.sender_name}</strong>
                      <span style={source}>{message.sender_role.replaceAll("_", " ")}</span>
                    </div>
                    <p style={messageBody}>{message.body}</p>
                    <time style={timestamp}>{new Date(message.created_at).toLocaleString()}</time>
                  </article>
                ))}
              </div>
            </section>
          )}
        </section>
      )}
    </PlaybookPage>
  );
}

function InboxState({ title, body, href, onRetry }: { title: string; body: string; href?: string; onRetry?: () => void }) {
  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Live Playbook Inbox" title={title} subtitle={body}>
        {href && <a href={href} style={send}>Sign in</a>}
        {onRetry && <button onClick={onRetry} style={send}>Try again</button>}
      </PlaybookHero>
    </PlaybookPage>
  );
}

const shell: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(260px,330px) 1fr", gap: 16 };
const sidebar: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 18, boxShadow: "0 16px 40px rgba(15,23,42,.06)", height: "fit-content" };
const eyebrow: React.CSSProperties = { fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 950, color: "#F97316", margin: 0 };
const threadButton: React.CSSProperties = { width: "100%", textAlign: "left", background: "#fff", border: "2px solid #E2E8F0", borderRadius: 16, padding: 14, marginTop: 12, cursor: "pointer" };
const threadTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 10, color: "#0F172A" };
const unread: React.CSSProperties = { background: "#F97316", color: "#fff", borderRadius: 999, padding: "3px 7px", fontSize: 11, fontWeight: 950 };
const preview: React.CSSProperties = { color: "#64748B", fontSize: 14, lineHeight: 1.55 };
const thread: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 24, padding: 22, boxShadow: "0 16px 40px rgba(15,23,42,.06)" };
const threadHeader: React.CSSProperties = { borderBottom: "1px solid #E2E8F0", paddingBottom: 16, marginBottom: 16 };
const threadTitle: React.CSSProperties = { color: "#0F172A", fontSize: 32, margin: "8px 0" };
const participants: React.CSSProperties = { color: "#64748B", margin: 0 };
const composer: React.CSSProperties = { display: "grid", gap: 10, marginBottom: 16 };
const textarea: React.CSSProperties = { width: "100%", boxSizing: "border-box", minHeight: 100, border: "1px solid #E2E8F0", borderRadius: 16, padding: 14 };
const send: React.CSSProperties = { width: "fit-content", display: "inline-block", textDecoration: "none", background: "#F97316", color: "#fff", border: "none", borderRadius: 999, padding: "10px 14px", fontWeight: 950, cursor: "pointer" };
const messageList: React.CSSProperties = { display: "grid", gap: 12 };
const messageCard: React.CSSProperties = { background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 16, padding: 14 };
const messageTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", color: "#0F172A" };
const source: React.CSSProperties = { background: "#E2E8F0", borderRadius: 999, padding: "4px 7px", fontSize: 11, fontWeight: 900 };
const messageBody: React.CSSProperties = { color: "#334155", lineHeight: 1.55 };
const timestamp: React.CSSProperties = { color: "#94A3B8", fontSize: 11 };
const empty: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: 30, border: "1px solid #E2E8F0", borderRadius: 24, background: "#FFFFFF" };
