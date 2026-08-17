"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  timezone: string;
  location: string | null;
  my_rsvp: "going" | "interested" | "cancelled" | null;
};

type ReminderRow = {
  event_id: string;
  minutes_before: 15 | 60 | 1440;
  status: "active" | "cancelled";
  last_delivered_for_start: string | null;
  last_delivered_at: string | null;
  updated_at: string;
};

type EventsResponse = { events?: CommunityEvent[]; error?: string };
const OFFSETS = [1440, 60, 15] as const;

export default function EventRemindersPage() {
  const router = useRouter();
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [reminders, setReminders] = useState<ReminderRow[]>([]);
  const [loadedAt, setLoadedAt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data: auth, error: authError } = await supabase.auth.getUser();
    if (authError || !auth.user) {
      router.replace("/login?next=/events/reminders");
      return;
    }

    setLoading(true);
    setError("");
    const [eventsResponse, reminderResult] = await Promise.all([
      fetch("/api/community/events", { cache: "no-store" }),
      supabase.from("community_event_reminders").select("event_id,minutes_before,status,last_delivered_for_start,last_delivered_at,updated_at").eq("user_id", auth.user.id),
    ]);
    const eventsBody = await eventsResponse.json() as EventsResponse;
    if (!eventsResponse.ok) {
      setError(eventsBody.error || "Events could not be loaded.");
      setLoading(false);
      return;
    }
    if (reminderResult.error) {
      setError(reminderResult.error.message);
      setLoading(false);
      return;
    }
    setEvents(eventsBody.events || []);
    setReminders((reminderResult.data || []) as ReminderRow[]);
    setLoadedAt(Date.now());
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const eligible = useMemo(() => events.filter((event) => {
    const start = new Date(event.starts_at).getTime();
    return Number.isFinite(start) && start > loadedAt && Boolean(event.my_rsvp && event.my_rsvp !== "cancelled");
  }).sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()), [events, loadedAt]);

  const activeCount = reminders.filter((row) => row.status === "active").length;
  const deliveredCount = reminders.filter((row) => Boolean(row.last_delivered_at)).length;

  function reminderFor(eventId: string, minutes: number) {
    return reminders.find((row) => row.event_id === eventId && row.minutes_before === minutes);
  }

  async function setReminder(event: CommunityEvent, minutesBefore: 15 | 60 | 1440, enabled: boolean) {
    const key = `${event.id}:${minutesBefore}`;
    setBusy(key);
    setError("");
    setMessage("");
    const result = await supabase.rpc("set_community_event_reminder", {
      requested_event_id: event.id,
      requested_minutes_before: minutesBefore,
      requested_enabled: enabled,
    });
    if (result.error) {
      setError(result.error.message);
      setBusy("");
      return;
    }
    setMessage(enabled ? `${offsetLabel(minutesBefore)} reminder enabled for ${event.title}.` : `${offsetLabel(minutesBefore)} reminder cancelled for ${event.title}.`);
    await load();
    setBusy("");
  }

  return (
    <PlaybookPage>
      <div data-testid="event-reminders" data-visual-canon="PGER-003">
        <PlaybookHero eyebrow="Playbook Community" title="Event Reminders" subtitle="Choose reminders for real events you’ve RSVP’d to. Delivery is scheduled by the shared Playbook notification service in the database—not by a browser timer that disappears when you close the app.">
          <div style={heroActions}>
            <PlaybookButton href="/events">All Events</PlaybookButton>
            <PlaybookButton href="/notifications" variant="secondary">Attention Center</PlaybookButton>
          </div>
        </PlaybookHero>

        <PlaybookMetrics>
          <PlaybookMetric label="Upcoming RSVP’d events" value={loading ? "…" : String(eligible.length)} />
          <PlaybookMetric label="Active reminders" value={loading ? "…" : String(activeCount)} />
          <PlaybookMetric label="Delivered subscriptions" value={loading ? "…" : String(deliveredCount)} />
          <PlaybookMetric label="Scheduler" value="Every 5 min" />
        </PlaybookMetrics>

        <section style={trustPanel}>
          <PlaybookPill>Shared notification service</PlaybookPill>
          <h2 style={trustTitle}>Reminders follow the canonical Event—not a copied date.</h2>
          <p style={trustCopy}>If an operator reschedules the Event, an active reminder follows the new canonical start time. RSVP, arrival, verified attendance, and rewards remain separate records.</p>
        </section>

        {error ? <div role="alert" style={alert}>{error}</div> : null}
        {message ? <div role="status" aria-live="polite" style={status}>{message}</div> : null}

        {loading ? <div style={empty}>Loading upcoming Event reminder options…</div> : eligible.length === 0 ? (
          <PlaybookCard eyebrow="Event reminders" title="No upcoming RSVP’d events"><p style={copy}>RSVP Going or Interested to a future published Event first. Playbook does not invent reminder subscriptions or demo Events.</p></PlaybookCard>
        ) : (
          <PlaybookGrid min={360}>{eligible.map((event) => (
            <PlaybookCard key={event.id} eyebrow={event.my_rsvp === "going" ? "Going" : "Interested"} title={event.title}>
              <p style={date}>{formatDate(event.starts_at)} · {event.timezone}</p>
              <p style={copy}>{event.location || "Location to be announced"}</p>
              <div style={offsetGrid}>
                {OFFSETS.map((minutes) => {
                  const row = reminderFor(event.id, minutes);
                  const active = row?.status === "active";
                  const key = `${event.id}:${minutes}`;
                  return <div key={minutes} style={offsetCard}>
                    <div><strong>{offsetLabel(minutes)}</strong><span style={muted}>{row?.last_delivered_at ? `Last delivered ${formatDate(row.last_delivered_at)}` : active ? "Scheduled" : "Off"}</span></div>
                    <button type="button" disabled={busy === key} onClick={() => void setReminder(event, minutes, !active)} style={active ? secondaryButton : primaryButton}>{busy === key ? "Saving…" : active ? "Turn off" : "Remind me"}</button>
                  </div>;
                })}
              </div>
              <div style={actions}><PlaybookButton href={`/events/${event.id}`} variant="secondary">Event Details</PlaybookButton></div>
            </PlaybookCard>
          ))}</PlaybookGrid>
        )}
      </div>
    </PlaybookPage>
  );
}

function offsetLabel(value: number) { if (value === 1440) return "1 day before"; if (value === 60) return "1 hour before"; return "15 minutes before"; }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }

const heroActions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const empty: React.CSSProperties = { maxWidth: 1180, margin: "24px auto", padding: 28, color: "#64748B" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const date: React.CSSProperties = { color: "#EA580C", fontWeight: 900 };
const offsetGrid: React.CSSProperties = { display: "grid", gap: 10, marginTop: 16 };
const offsetCard: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, padding: 12, border: "1px solid #E2E8F0", borderRadius: 14, flexWrap: "wrap" };
const muted: React.CSSProperties = { display: "block", color: "#64748B", fontSize: 12, marginTop: 3 };
const actions: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 };
const primaryButton: React.CSSProperties = { minHeight: 40, border: 0, borderRadius: 999, padding: "0 14px", background: "#F97316", color: "#FFF", fontWeight: 900, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: "#FFF", color: "#334155", border: "1px solid #CBD5E1" };
