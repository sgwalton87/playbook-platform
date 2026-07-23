"use client";

import { useEffect, useState } from "react";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Network = {
  id: string;
  title: string;
  participants: string[];
  messages: unknown[];
};

export default function LiveSupportNetwork() {
  const [networks, setNetworks] = useState<Network[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");

  async function load() {
    setState("loading");
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) {
      setState("signed-out");
      return;
    }

    const response = await fetch("/api/messages", {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
    if (!response?.ok) {
      setState("error");
      return;
    }

    const result = await response.json();
    setNetworks(result.networks || []);
    setState("ready");
  }

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  if (state === "loading") return <NetworkState title="Opening your Support Network…" body="Loading accepted relationships from your canonical Playbook record." />;
  if (state === "signed-out") return <NetworkState title="Sign in to see your network." body="Support relationships are private and permission-aware." href="/login" />;
  if (state === "error") return <NetworkState title="Your network needs another moment." body="No demo relationships were substituted." onRetry={load} />;

  const participantCount = networks.reduce(
    (count, network) => count + Math.max(network.participants.length - 1, 0),
    0,
  );
  const messageCount = networks.reduce(
    (count, network) => count + network.messages.length,
    0,
  );

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Starting Five · Live Support Network"
        title="The real people connected to your Playbook."
        subtitle="A person appears here only after accepting an invitation, completing role onboarding, and activating an authenticated relationship."
      >
        <div style={actions}>
          <PlaybookButton href="/invitations">Invite support</PlaybookButton>
          <PlaybookButton href="/messages" variant="secondary">Open Messages</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookMetrics>
        <PlaybookMetric label="Connected Networks" value={String(networks.length)} />
        <PlaybookMetric label="Active Supporters" value={String(participantCount)} />
        <PlaybookMetric label="Persisted Messages" value={String(messageCount)} />
        <PlaybookMetric label="Data Source" value="Live" />
      </PlaybookMetrics>

      {networks.length === 0 ? (
        <section style={empty}>
          <p style={kicker}>No fabricated relationships</p>
          <h2>Your network is ready to grow.</h2>
          <p style={body}>Invite your trusted people. They will appear here after completing the secure acceptance and role-onboarding flow.</p>
          <PlaybookButton href="/invitations">Invite my Starting Five</PlaybookButton>
        </section>
      ) : (
        <PlaybookGrid min={300}>
          {networks.map((network) => (
            <PlaybookCard key={network.id} eyebrow="Active relationship network" title={network.title}>
              <div style={people}>
                {network.participants.map((participant) => (
                  <PlaybookPill key={participant}>{participant}</PlaybookPill>
                ))}
              </div>
              <p style={body}>{network.messages.length} persisted messages in this network.</p>
              <PlaybookButton href="/messages">Open conversation</PlaybookButton>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      )}
    </PlaybookPage>
  );
}

function NetworkState({ title, body: copy, href, onRetry }: { title: string; body: string; href?: string; onRetry?: () => void }) {
  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Live Support Network" title={title} subtitle={copy}>
        {href && <PlaybookButton href={href}>Sign in</PlaybookButton>}
        {onRetry && <button type="button" style={retry} onClick={onRetry}>Try again</button>}
      </PlaybookHero>
    </PlaybookPage>
  );
}

const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 };
const people: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const kicker: React.CSSProperties = { color: "#F97316", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", fontWeight: 950 };
const empty: React.CSSProperties = { maxWidth: 760, margin: "0 auto", padding: 30, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 24 };
const retry: React.CSSProperties = { marginTop: 18, border: 0, borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "12px 18px", fontWeight: 900, cursor: "pointer" };
