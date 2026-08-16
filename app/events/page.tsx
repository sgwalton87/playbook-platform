"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  pillar: string;
  starts_at: string;
  ends_at: string;
  timezone: string;
  location: string | null;
  virtual_url: string | null;
  capacity: number | null;
  going_count: number;
  interested_count: number;
  xp_reward: number;
  coin_reward: number;
  status: string;
  my_rsvp: "going" | "interested" | "cancelled" | null;
  attended: boolean;
};

type EventsResponse = { events?: CommunityEvent[]; error?: string };
const FILTERS = ["All", "Leadership", "Finance", "Civic", "SEL", "NIL", "College", "Community"];

async function fetchEvents(): Promise<CommunityEvent[]> {
  const response = await fetch("/api/community/events", { cache: "no-store" });
  const result = await response.json() as EventsResponse;
  if (!response.ok) throw new Error(result.error || "Events could not be loaded.");
  return result.events || [];
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function EventsPage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [filter, setFilter] = useState("All");
  const [mineOnly, setMineOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Loading community calendar…");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchEvents();
      setEvents(data);
      setMessage(data.length ? "Community calendar is current." : "No published events yet.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Events could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void fetchEvents().then((data) => {
      if (!active) return;
      setEvents(data);
      setMessage(data.length ? "Community calendar is current." : "No published events yet.");
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Events could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function rsvp(event: CommunityEvent, status: "going" | "interested" | "cancelled") {
    setBusy(event.id);
    setError("");
    try {
      const response = await fetch("/api/community/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ eventId: event.id, status }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "RSVP could not be updated.");
      setMessage(status === "cancelled" ? "RSVP removed." : status === "going" ? "You’re confirmed for this event." : "Event saved as interested.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "RSVP could not be updated.");
    } finally {
      setBusy(null);
    }
  }

  const visible = useMemo(() => events.filter((event) => {
    const pillarMatch = filter === "All" || event.pillar === filter;
    const mineMatch = !mineOnly || Boolean(event.my_rsvp && event.my_rsvp !== "cancelled");
    return pillarMatch && mineMatch;
  }), [events, filter, mineOnly]);

  const myEvents = events.filter((event) => event.my_rsvp && event.my_rsvp !== "cancelled");
  const confirmed = events.filter((event) => event.my_rsvp === "going");

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Playbook Community" title="Events that move your record forward" subtitle="Discover workshops, labs, civic experiences, networking, and community gatherings. RSVP state, capacity, attendance, and earned rewards are governed by the platform—not by browser-only counters." />
      <PlaybookMetrics>
        <PlaybookMetric label="Published events" value={loading ? "…" : String(events.length)} />
        <PlaybookMetric label="Your events" value={loading ? "…" : String(myEvents.length)} />
        <PlaybookMetric label="Confirmed" value={loading ? "…" : String(confirmed.length)} />
        <PlaybookMetric label="Attendance verified" value={loading ? "…" : String(events.filter((event) => event.attended).length)} />
      </PlaybookMetrics>

      <div role="status" aria-live="polite" style={statusLine}>{loading ? "Loading…" : message}</div>
      {error && <div role="alert" style={alert}>{error} <button type="button" onClick={() => void load()}>Retry</button></div>}

      <section style={toolbar} aria-label="Event filters">
        <button type="button" aria-pressed={!mineOnly} onClick={() => setMineOnly(false)} style={!mineOnly ? activeButton : filterButton}>All events</button>
        <button type="button" aria-pressed={mineOnly} onClick={() => setMineOnly(true)} style={mineOnly ? activeButton : filterButton}>My events ({myEvents.length})</button>
        <span style={divider} />
        {FILTERS.map((value) => <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} style={filter === value ? activePillar : filterButton}>{value}</button>)}
      </section>

      {!loading && visible.length === 0 ? (
        <PlaybookCard eyebrow="Community calendar" title="Nothing matches this view"><p style={copy}>Try another filter. Playbook does not fabricate events to fill an empty state.</p></PlaybookCard>
      ) : (
        <PlaybookGrid min={340}>
          {visible.map((event) => {
            const seatsLeft = event.capacity == null ? null : Math.max(event.capacity - event.going_count, 0);
            const full = seatsLeft === 0 && event.my_rsvp !== "going";
            return (
              <PlaybookCard key={event.id} eyebrow={`${event.pillar} · ${event.event_type}`} title={event.title}>
                <p style={eventDate}>{formatDate(event.starts_at)}</p>
                <p style={copy}>{event.description}</p>
                <div style={detailGrid}>
                  <div><span style={label}>Location</span><strong>{event.location || (event.virtual_url ? "Virtual" : "To be announced")}</strong></div>
                  <div><span style={label}>Capacity</span><strong>{event.capacity == null ? "Open" : `${event.going_count}/${event.capacity}`}</strong></div>
                  <div><span style={label}>Interested</span><strong>{event.interested_count}</strong></div>
                  <div><span style={label}>Reward</span><strong>+{event.xp_reward} XP · +{event.coin_reward} coins</strong></div>
                </div>
                <div style={pillRow}>
                  {event.my_rsvp === "going" && <PlaybookPill>Going</PlaybookPill>}
                  {event.my_rsvp === "interested" && <PlaybookPill>Interested</PlaybookPill>}
                  {event.attended && <PlaybookPill>Attendance verified</PlaybookPill>}
                  {seatsLeft !== null && <PlaybookPill>{seatsLeft} seats left</PlaybookPill>}
                </div>
                <div style={actions}>
                  <button type="button" disabled={busy === event.id || full} onClick={() => void rsvp(event, "going")} style={event.my_rsvp === "going" ? selectedButton : primaryButton}>{event.my_rsvp === "going" ? "Confirmed ✓" : full ? "At capacity" : "I’m going"}</button>
                  <button type="button" disabled={busy === event.id} onClick={() => void rsvp(event, "interested")} style={event.my_rsvp === "interested" ? selectedButton : secondaryButton}>Interested</button>
                  {event.my_rsvp && event.my_rsvp !== "cancelled" && <button type="button" disabled={busy === event.id} onClick={() => void rsvp(event, "cancelled")} style={textButton}>Remove RSVP</button>}
                </div>
                {event.virtual_url && event.my_rsvp === "going" && <Link href={event.virtual_url} target="_blank" rel="noreferrer" style={resourceLink}>Open virtual event →</Link>}
              </PlaybookCard>
            );
          })}
        </PlaybookGrid>
      )}
    </PlaybookPage>
  );
}

const statusLine: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 12px", color: "#475569" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", padding: 12, borderRadius: 14, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" };
const toolbar: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 22px", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" };
const divider: React.CSSProperties = { width: 1, height: 26, background: "#CBD5E1", margin: "0 4px" };
const baseButton: React.CSSProperties = { borderRadius: 999, padding: "9px 13px", fontWeight: 900, cursor: "pointer" };
const filterButton: React.CSSProperties = { ...baseButton, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#334155" };
const activeButton: React.CSSProperties = { ...filterButton, background: "#0F172A", color: "#FFFFFF", borderColor: "#0F172A" };
const activePillar: React.CSSProperties = { ...filterButton, background: "#FFF7ED", color: "#C2410C", borderColor: "#FDBA74" };
const primaryButton: React.CSSProperties = { ...baseButton, border: 0, background: "#F97316", color: "#FFFFFF" };
const selectedButton: React.CSSProperties = { ...primaryButton, background: "#0F172A" };
const secondaryButton: React.CSSProperties = { ...filterButton };
const textButton: React.CSSProperties = { border: 0, background: "transparent", color: "#64748B", fontWeight: 800, cursor: "pointer" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const eventDate: React.CSSProperties = { color: "#EA580C", fontWeight: 900, margin: "0 0 8px" };
const detailGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 12, margin: "16px 0" };
const label: React.CSSProperties = { display: "block", color: "#64748B", fontSize: 11, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 };
const pillRow: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", margin: "12px 0" };
const actions: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" };
const resourceLink: React.CSSProperties = { display: "inline-block", marginTop: 14, color: "#C2410C", fontWeight: 900, textDecoration: "none" };
