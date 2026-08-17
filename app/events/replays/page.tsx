"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type ReplayEvent = {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  pillar: string | null;
  starts_at: string | null;
  replay_url: string | null;
};

export default function EventReplayLibraryPage() {
  const router = useRouter();
  const [events, setEvents] = useState<ReplayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login?next=/events/replays");
        return;
      }
      const result = await supabase
        .from("community_events")
        .select("id,title,description,event_type,pillar,starts_at,replay_url")
        .eq("status", "published")
        .not("replay_url", "is", null)
        .order("starts_at", { ascending: false });
      if (!active) return;
      if (result.error) setError(result.error.message);
      else setEvents((result.data || []) as ReplayEvent[]);
      setLoading(false);
    }
    void load();
    return () => { active = false; };
  }, [router]);

  return (
    <PlaybookPage>
      <div data-testid="event-replay-library" data-visual-canon="PGER-002">
        <PlaybookHero eyebrow="Playbook Community" title="Event Replay Library" subtitle="Return to operator-published event recordings without turning a replay into attendance evidence or a second event record." />
        <div style={actions}><Link href="/events" style={button}>All events</Link></div>
        {error ? <div role="alert" style={alert}>{error}</div> : null}
        {loading ? <div style={state}>Loading published event replays…</div> : events.length === 0 ? (
          <PlaybookCard eyebrow="Replay library" title="No event replays are published yet"><p style={copy}>Playbook will not invent recordings to fill this library.</p></PlaybookCard>
        ) : (
          <PlaybookGrid min={320}>{events.map((event) => <PlaybookCard key={event.id} eyebrow={`${event.pillar || "Community"} · ${label(event.event_type)}`} title={event.title}>
            {event.starts_at ? <PlaybookPill>{formatDate(event.starts_at)}</PlaybookPill> : null}
            {event.description ? <p style={copy}>{event.description}</p> : null}
            <div style={actions}>
              <a href={event.replay_url || "#"} target="_blank" rel="noreferrer" style={button}>Watch replay →</a>
              <Link href={`/events/${event.id}`} style={secondary}>Event details</Link>
            </div>
          </PlaybookCard>)}</PlaybookGrid>
        )}
      </div>
    </PlaybookPage>
  );
}
function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(); }
const state: React.CSSProperties = { maxWidth: 1180, margin: "30px auto", padding: 28, color: "#64748B" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const actions: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", display: "flex", gap: 9, flexWrap: "wrap" };
const button: React.CSSProperties = { display: "inline-flex", minHeight: 42, alignItems: "center", borderRadius: 999, padding: "0 14px", background: "#F97316", color: "#FFF", fontWeight: 900, textDecoration: "none" };
const secondary: React.CSSProperties = { ...button, background: "#FFF", color: "#334155", border: "1px solid #CBD5E1" };
