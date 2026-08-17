"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type EventDetail = {
  id: string;
  title: string;
  description: string;
  event_type: string;
  pillar: string;
  starts_at: string;
  ends_at: string | null;
  timezone: string;
  location: string | null;
  virtual_url: string | null;
  capacity: number | null;
  xp_reward: number;
  coin_reward: number;
  replay_url: string | null;
  networking_enabled: boolean;
  check_in_enabled: boolean;
  my_rsvp: "going" | "interested" | "cancelled" | null;
  attended: boolean;
  checked_in_at: string | null;
  networking_opted_in: boolean;
};

type NetworkMember = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  headline: string | null;
};

export default function EventDetailPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const eventId = params?.eventId || "";
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [network, setNetwork] = useState<NetworkMember[]>([]);
  const [headline, setHeadline] = useState("");
  const [checkinToken, setCheckinToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadDetail(requestedEventId: string) {
    const detail = await supabase.rpc("get_community_event_detail", { requested_event_id: requestedEventId });
    if (detail.error) throw detail.error;
    const row = Array.isArray(detail.data) ? detail.data[0] as EventDetail | undefined : undefined;
    if (!row) {
      setEvent(null);
      setNetwork([]);
      return;
    }
    setEvent(row);
    if (row.networking_enabled && row.my_rsvp && row.my_rsvp !== "cancelled") {
      const directory = await supabase.rpc("get_community_event_networking_directory", { requested_event_id: requestedEventId });
      if (directory.error) throw directory.error;
      setNetwork((directory.data || []) as NetworkMember[]);
    } else {
      setNetwork([]);
    }
  }

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace(`/login?next=/events/${eventId}`);
        return;
      }
      try {
        await loadDetail(eventId);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Event detail could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (eventId) void load();
    return () => { active = false; };
  }, [eventId, router]);

  async function rsvp(status: "going" | "interested" | "cancelled") {
    if (!event) return;
    setBusy(true); setError(""); setMessage("");
    try {
      const response = await fetch("/api/community/events", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventId: event.id, status }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error || "RSVP could not be updated.");
      await loadDetail(event.id);
      setMessage(status === "cancelled" ? "RSVP removed." : status === "going" ? "You’re confirmed for this event." : "Event saved as interested.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "RSVP could not be updated."); }
    finally { setBusy(false); }
  }

  async function checkIn(eventSubmit: FormEvent<HTMLFormElement>) {
    eventSubmit.preventDefault();
    if (!event || !checkinToken.trim()) return;
    setBusy(true); setError(""); setMessage("");
    const result = await supabase.rpc("check_in_community_event", { requested_token: checkinToken.trim() });
    if (result.error) {
      setError(result.error.message); setBusy(false); return;
    }
    try {
      await loadDetail(event.id);
      setCheckinToken("");
      setMessage("Arrival recorded. Verified attendance remains a separate operator-reviewed record.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Arrival was recorded, but event detail could not refresh."); }
    finally { setBusy(false); }
  }

  async function updateNetworking(optIn: boolean) {
    if (!event) return;
    setBusy(true); setError(""); setMessage("");
    const result = await supabase.rpc("set_community_event_networking_opt_in", {
      requested_event_id: event.id,
      requested_opt_in: optIn,
      requested_headline: optIn ? headline.trim() || null : null,
    });
    if (result.error) {
      setError(result.error.message); setBusy(false); return;
    }
    try {
      await loadDetail(event.id);
      setMessage(optIn ? "You’re visible in this event’s opt-in networking directory." : "You left the event networking directory.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Networking preference saved, but the event could not refresh."); }
    finally { setBusy(false); }
  }

  if (loading) return <PlaybookPage><div style={state}>Loading governed event detail…</div></PlaybookPage>;
  if (!event) return <PlaybookPage><PlaybookHero eyebrow="Playbook Community" title="Event unavailable" subtitle="This event is not published or could not be found." /><div style={state}>No published event record is available.</div></PlaybookPage>;

  const googleCalendarUrl = buildGoogleCalendarUrl(event);
  const icsUrl = buildIcsDataUrl(event);
  const participating = Boolean(event.my_rsvp && event.my_rsvp !== "cancelled") || event.attended;

  return (
    <PlaybookPage>
      <div data-testid="event-detail" data-visual-canon="PGED-001">
        <PlaybookHero eyebrow={`${event.pillar} · ${label(event.event_type)}`} title={event.title} subtitle={event.description || "Published Playbook community event."}>
          <div style={actions}>
            <PlaybookButton href="/events">All Events</PlaybookButton>
            <PlaybookButton href="/events/replays" variant="secondary">Replay Library</PlaybookButton>
          </div>
        </PlaybookHero>
        {error ? <div role="alert" style={errorBox}>{error}</div> : null}
        {message ? <div role="status" style={successBox}>{message}</div> : null}

        <PlaybookMetrics>
          <PlaybookMetric label="RSVP" value={event.my_rsvp && event.my_rsvp !== "cancelled" ? label(event.my_rsvp) : "Not set"} />
          <PlaybookMetric label="Arrival evidence" value={event.checked_in_at ? "Recorded" : "Not recorded"} />
          <PlaybookMetric label="Attendance" value={event.attended ? "Verified" : "Not verified"} />
          <PlaybookMetric label="Reward" value={`+${event.xp_reward} XP · +${event.coin_reward} coins`} />
        </PlaybookMetrics>

        <section style={trustPanel}>
          <PlaybookPill>Evidence boundary</PlaybookPill>
          <h2 style={trustTitle}>Arrival and attendance are deliberately different records.</h2>
          <p style={trustCopy}>A valid event token can record that you arrived after confirming your RSVP. It does not mark attendance verified and does not issue rewards. Playbook’s existing operator-governed attendance verification remains the authority.</p>
        </section>

        <PlaybookGrid min={330}>
          <PlaybookCard eyebrow="Event Detail" title={formatDate(event.starts_at)}>
            <p style={copy}><strong>Ends:</strong> {event.ends_at ? formatDate(event.ends_at) : "Not specified"}</p>
            <p style={copy}><strong>Timezone:</strong> {event.timezone}</p>
            <p style={copy}><strong>Location:</strong> {event.location || (event.virtual_url ? "Virtual" : "To be announced")}</p>
            <p style={copy}><strong>Capacity:</strong> {event.capacity == null ? "Open" : String(event.capacity)}</p>
            <div style={actions}>
              <button disabled={busy} onClick={() => void rsvp("going")} style={event.my_rsvp === "going" ? selectedButton : primaryButton}>{event.my_rsvp === "going" ? "Going ✓" : "I’m going"}</button>
              <button disabled={busy} onClick={() => void rsvp("interested")} style={event.my_rsvp === "interested" ? selectedButton : secondaryButton}>Interested</button>
              {event.my_rsvp && event.my_rsvp !== "cancelled" ? <button disabled={busy} onClick={() => void rsvp("cancelled")} style={textButton}>Remove RSVP</button> : null}
            </div>
          </PlaybookCard>

          <PlaybookCard eyebrow="Calendar" title="Take the canonical event with you">
            <p style={copy}>Calendar links are derived from the current Playbook event record. They do not create a duplicate event inside Playbook.</p>
            <div style={actions}>
              <a href={googleCalendarUrl} target="_blank" rel="noreferrer" style={linkButton}>Google Calendar</a>
              <a href={icsUrl} download={`${safeFilename(event.title)}.ics`} style={linkButton}>Download .ics</a>
            </div>
          </PlaybookCard>

          {event.check_in_enabled ? <PlaybookCard eyebrow="Event Check-In" title={event.checked_in_at ? "Arrival already recorded" : "Record arrival evidence"}>
            {event.checked_in_at ? <><PlaybookPill>Checked in {formatDate(event.checked_in_at)}</PlaybookPill><p style={copy}>{event.attended ? "Attendance has also been independently verified." : "Attendance is still awaiting separate verification."}</p></> : (
              <form onSubmit={checkIn} style={form}><label style={field}>Event token<input value={checkinToken} onChange={(e) => setCheckinToken(e.target.value)} style={input} autoComplete="off" /></label><button disabled={busy || event.my_rsvp !== "going"} style={primaryButton}>{event.my_rsvp === "going" ? "Record arrival" : "Confirm ‘Going’ first"}</button></form>
            )}
          </PlaybookCard> : null}

          {event.networking_enabled ? <PlaybookCard eyebrow="Event Networking" title="Opt in; don’t get exposed by default">
            <p style={copy}>Only participating members who explicitly opt in appear below. Email, phone, private Scholar Record data, and support relationships are never part of this directory.</p>
            {!event.networking_opted_in ? <div style={form}><label style={field}>Optional networking headline<input maxLength={280} value={headline} onChange={(e) => setHeadline(e.target.value)} style={input} placeholder="What would you like to connect around?" /></label><button disabled={busy || !participating} onClick={() => void updateNetworking(true)} style={primaryButton}>{participating ? "Opt in to networking" : "RSVP to participate"}</button></div> : <button disabled={busy} onClick={() => void updateNetworking(false)} style={secondaryButton}>Leave networking directory</button>}
            {network.length ? <div style={networkList}>{network.map((member) => <div key={member.user_id} style={networkCard}><strong>{member.display_name}</strong><span style={muted}>{label(member.role)}</span>{member.headline ? <span style={copy}>{member.headline}</span> : null}</div>)}</div> : <p style={muted}>No participating members have opted into networking yet.</p>}
          </PlaybookCard> : null}

          {event.virtual_url && event.my_rsvp === "going" ? <PlaybookCard eyebrow="Live Event" title="Virtual access"><a href={event.virtual_url} target="_blank" rel="noreferrer" style={linkButton}>Open virtual event →</a></PlaybookCard> : null}
          {event.replay_url ? <PlaybookCard eyebrow="Replay" title="Event recording available"><p style={copy}>The replay link was published by the event operator.</p><a href={event.replay_url} target="_blank" rel="noreferrer" style={linkButton}>Watch replay →</a></PlaybookCard> : null}
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }
function compactUtc(value: string) { return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }
function calendarDetails(event: EventDetail) { return [event.description, event.location ? `Location: ${event.location}` : "", "Generated from the canonical Playbook event record."].filter(Boolean).join("\n\n"); }
function buildGoogleCalendarUrl(event: EventDetail) {
  const params = new URLSearchParams({ action: "TEMPLATE", text: event.title, dates: `${compactUtc(event.starts_at)}/${compactUtc(event.ends_at || event.starts_at)}`, details: calendarDetails(event), location: event.location || "" });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
function buildIcsDataUrl(event: EventDetail) {
  const escape = (value: string) => value.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replaceAll("\n", "\\n");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Playbook Platform//Community Event//EN", "BEGIN:VEVENT", `UID:${event.id}@playbook`, `DTSTART:${compactUtc(event.starts_at)}`, `DTEND:${compactUtc(event.ends_at || event.starts_at)}`, `SUMMARY:${escape(event.title)}`, `DESCRIPTION:${escape(calendarDetails(event))}`, event.location ? `LOCATION:${escape(event.location)}` : "", "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines)}`;
}
function safeFilename(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "playbook-event"; }

const state: React.CSSProperties = { maxWidth: 1180, minHeight: 320, margin: "30px auto", display: "grid", placeItems: "center", color: "#64748B" };
const actions: React.CSSProperties = { display: "flex", gap: 9, flexWrap: "wrap", alignItems: "center", marginTop: 14 };
const errorBox: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const successBox: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const trustPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const trustTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(25px,4vw,36px)" };
const trustCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const muted: React.CSSProperties = { color: "#64748B", fontSize: 12 };
const form: React.CSSProperties = { display: "grid", gap: 10, marginTop: 12 };
const field: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontSize: 12, fontWeight: 850 };
const input: React.CSSProperties = { minHeight: 44, borderRadius: 12, border: "1px solid #CBD5E1", padding: "8px 11px", font: "inherit" };
const baseButton: React.CSSProperties = { minHeight: 42, borderRadius: 999, padding: "0 14px", fontWeight: 900, cursor: "pointer" };
const primaryButton: React.CSSProperties = { ...baseButton, border: 0, background: "#F97316", color: "#FFF" };
const selectedButton: React.CSSProperties = { ...primaryButton, background: "#0F172A" };
const secondaryButton: React.CSSProperties = { ...baseButton, border: "1px solid #CBD5E1", background: "#FFF", color: "#334155" };
const textButton: React.CSSProperties = { border: 0, background: "transparent", color: "#64748B", fontWeight: 800, cursor: "pointer" };
const linkButton: React.CSSProperties = { display: "inline-flex", minHeight: 42, alignItems: "center", borderRadius: 999, padding: "0 14px", background: "#FFF7ED", color: "#C2410C", fontWeight: 900, textDecoration: "none", border: "1px solid #FDBA74" };
const networkList: React.CSSProperties = { display: "grid", gap: 8, marginTop: 14 };
const networkCard: React.CSSProperties = { display: "grid", gap: 3, padding: 12, borderRadius: 12, background: "#F8FAFC", border: "1px solid #E2E8F0" };
