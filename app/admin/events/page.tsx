"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlaybookButton, PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type EventOperation = {
  id: string;
  title: string;
  status: string;
  starts_at: string | null;
  ends_at: string | null;
  timezone: string;
  location: string | null;
  replay_url: string | null;
  networking_enabled: boolean;
  check_in_enabled: boolean;
};

type DraftConfig = { replayUrl: string; networkingEnabled: boolean; checkInEnabled: boolean };
type CreatedCheckIn = { eventId: string; token: string; validFrom: string; validUntil: string };

export default function EventOperationsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventOperation[]>([]);
  const [drafts, setDrafts] = useState<Record<string, DraftConfig>>({});
  const [createdCheckIn, setCreatedCheckIn] = useState<CreatedCheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      router.replace("/login?next=/admin/events");
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch("/api/admin/events", { cache: "no-store" });
    const body = await response.json().catch(() => ({})) as { events?: EventOperation[]; error?: string };
    if (response.status === 403) {
      setForbidden(true);
      setEvents([]);
      setLoading(false);
      return;
    }
    if (!response.ok) {
      setError(body.error || "Event operations could not be loaded.");
      setLoading(false);
      return;
    }
    const nextEvents = body.events || [];
    setEvents(nextEvents);
    setDrafts(Object.fromEntries(nextEvents.map((event) => [event.id, {
      replayUrl: event.replay_url || "",
      networkingEnabled: event.networking_enabled,
      checkInEnabled: event.check_in_enabled,
    }])));
    setForbidden(false);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  const published = useMemo(() => events.filter((event) => event.status === "published").length, [events]);
  const replayReady = useMemo(() => events.filter((event) => Boolean(event.replay_url)).length, [events]);
  const checkInReady = useMemo(() => events.filter((event) => event.check_in_enabled).length, [events]);

  function patchDraft(eventId: string, patch: Partial<DraftConfig>) {
    setDrafts((current) => ({ ...current, [eventId]: { ...(current[eventId] || { replayUrl: "", networkingEnabled: false, checkInEnabled: false }), ...patch } }));
  }

  async function saveExperience(event: EventOperation) {
    const draft = drafts[event.id];
    if (!draft) return;
    setBusy(event.id);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/events", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        eventId: event.id,
        replayUrl: draft.replayUrl,
        networkingEnabled: draft.networkingEnabled,
        checkInEnabled: draft.checkInEnabled,
      }),
    });
    const body = await response.json().catch(() => ({})) as { error?: string };
    if (!response.ok) {
      setError(body.error || "Event experience could not be saved.");
      setBusy("");
      return;
    }
    setMessage(`Event experience updated for ${event.title}.`);
    await load();
    setBusy("");
  }

  async function createCheckIn(event: EventOperation) {
    const start = event.starts_at ? new Date(event.starts_at) : new Date();
    const end = event.ends_at ? new Date(event.ends_at) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const validFrom = new Date(start.getTime() - 60 * 60 * 1000);
    const candidateUntil = new Date(end.getTime() + 60 * 60 * 1000);
    const maxUntil = new Date(validFrom.getTime() + 12 * 60 * 60 * 1000);
    const validUntil = candidateUntil < maxUntil ? candidateUntil : maxUntil;

    setBusy(`code:${event.id}`);
    setError("");
    setMessage("");
    const response = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ eventId: event.id, validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString() }),
    });
    const body = await response.json().catch(() => ({})) as { checkIn?: { token?: string; valid_from?: string; valid_until?: string }; error?: string };
    if (!response.ok || !body.checkIn?.token) {
      setError(body.error || "Check-in token could not be created.");
      setBusy("");
      return;
    }
    setCreatedCheckIn({
      eventId: event.id,
      token: body.checkIn.token,
      validFrom: body.checkIn.valid_from || validFrom.toISOString(),
      validUntil: body.checkIn.valid_until || validUntil.toISOString(),
    });
    setMessage("A new time-bounded check-in token was created. The plaintext token is shown only in this response.");
    setBusy("");
  }

  async function copyCheckInUrl() {
    if (!createdCheckIn) return;
    const url = `${window.location.origin}/events/${createdCheckIn.eventId}?checkin=${encodeURIComponent(createdCheckIn.token)}`;
    await navigator.clipboard.writeText(url);
    setMessage("QR-ready check-in URL copied.");
  }

  if (forbidden) {
    return <PlaybookPage><PlaybookHero eyebrow="Governed access" title="Event Operations" subtitle="This workspace is restricted to Playbook platform operators." /><PlaybookCard eyebrow="Default deny" title="Operator authority required"><p style={copy}>Event configuration and check-in token generation are protected by database operator authority, not by route visibility.</p></PlaybookCard></PlaybookPage>;
  }

  return (
    <PlaybookPage>
      <div data-testid="event-operations" data-visual-canon="PGEO-001">
        <PlaybookHero eyebrow="Founder / Admin" title="Event Operations" subtitle="Configure the shared Event service without creating a parallel admin-only event system. Replay, networking, and check-in controls extend the canonical community event record.">
          <div style={heroActions}>
            <PlaybookButton href="/admin">Admin Review Center</PlaybookButton>
            <PlaybookButton href="/events" variant="secondary">Open Events</PlaybookButton>
          </div>
        </PlaybookHero>
        <PlaybookMetrics>
          <PlaybookMetric label="Events" value={loading ? "…" : String(events.length)} />
          <PlaybookMetric label="Published" value={loading ? "…" : String(published)} />
          <PlaybookMetric label="Replay ready" value={loading ? "…" : String(replayReady)} />
          <PlaybookMetric label="Check-in enabled" value={loading ? "…" : String(checkInReady)} />
        </PlaybookMetrics>

        {error ? <div role="alert" style={alert}>{error}</div> : null}
        {message ? <div role="status" aria-live="polite" style={status}>{message}</div> : null}

        {createdCheckIn ? <section style={tokenPanel} aria-label="New check-in token">
          <PlaybookPill>One-time operator output</PlaybookPill>
          <h2 style={tokenTitle}>QR-ready check-in URL created</h2>
          <p style={tokenCopy}>The database stores only the token hash. Put the copied URL into the event’s QR artwork or venue signage. Scanning opens the event detail with the token prefilled; the attendee must explicitly record arrival.</p>
          <code style={tokenCode}>{createdCheckIn.token}</code>
          <p style={tokenMeta}>Valid {formatDate(createdCheckIn.validFrom)} → {formatDate(createdCheckIn.validUntil)}</p>
          <button type="button" onClick={() => void copyCheckInUrl()} style={primaryButton}>Copy QR-ready URL</button>
        </section> : null}

        {loading ? <div style={empty}>Loading governed event operations…</div> : events.length === 0 ? <PlaybookCard eyebrow="Event operations" title="No event records yet"><p style={copy}>Create an event through the existing governed Event service first. This workspace never fabricates event rows.</p></PlaybookCard> : (
          <PlaybookGrid min={360}>{events.map((event) => {
            const draft = drafts[event.id] || { replayUrl: "", networkingEnabled: false, checkInEnabled: false };
            const canGenerate = event.status === "published" && draft.checkInEnabled && event.check_in_enabled;
            return <PlaybookCard key={event.id} eyebrow={event.status} title={event.title}>
              <p style={copy}>{event.starts_at ? formatDate(event.starts_at) : "Date not scheduled"} · {event.location || "Location not set"}</p>
              <label style={field}>Replay URL<input type="url" value={draft.replayUrl} onChange={(e) => patchDraft(event.id, { replayUrl: e.target.value })} placeholder="https://…" style={input} /></label>
              <label style={checkRow}><input type="checkbox" checked={draft.networkingEnabled} onChange={(e) => patchDraft(event.id, { networkingEnabled: e.target.checked })} /> Enable opt-in event networking</label>
              <label style={checkRow}><input type="checkbox" checked={draft.checkInEnabled} onChange={(e) => patchDraft(event.id, { checkInEnabled: e.target.checked })} /> Enable governed event check-in</label>
              <div style={actions}>
                <button type="button" disabled={busy === event.id} onClick={() => void saveExperience(event)} style={primaryButton}>{busy === event.id ? "Saving…" : "Save experience"}</button>
                <button type="button" disabled={busy === `code:${event.id}` || !canGenerate} onClick={() => void createCheckIn(event)} style={secondaryButton}>{canGenerate ? "Generate check-in token" : event.status !== "published" ? "Publish event first" : "Save check-in enabled first"}</button>
              </div>
            </PlaybookCard>;
          })}</PlaybookGrid>
        )}
      </div>
    </PlaybookPage>
  );
}

function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }

const heroActions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const empty: React.CSSProperties = { maxWidth: 1180, margin: "24px auto", padding: 28, color: "#64748B" };
const field: React.CSSProperties = { display: "grid", gap: 6, marginTop: 12, color: "#334155", fontWeight: 850 };
const input: React.CSSProperties = { minHeight: 44, border: "1px solid #CBD5E1", borderRadius: 10, padding: "0 12px", font: "inherit" };
const checkRow: React.CSSProperties = { display: "flex", gap: 8, alignItems: "center", marginTop: 12, color: "#334155", fontWeight: 800 };
const actions: React.CSSProperties = { display: "flex", gap: 9, flexWrap: "wrap", marginTop: 16 };
const primaryButton: React.CSSProperties = { minHeight: 42, border: 0, borderRadius: 999, padding: "0 15px", background: "#F97316", color: "#FFF", fontWeight: 900, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { ...primaryButton, background: "#FFF", color: "#334155", border: "1px solid #CBD5E1" };
const tokenPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 20px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const tokenTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const tokenCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const tokenCode: React.CSSProperties = { display: "block", overflowWrap: "anywhere", padding: 12, borderRadius: 10, background: "rgba(255,255,255,.08)", color: "#FFF" };
const tokenMeta: React.CSSProperties = { color: "#C9D8E8", fontSize: 13 };
