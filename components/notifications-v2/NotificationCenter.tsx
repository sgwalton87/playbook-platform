"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

type Notification = { id: string; type: string; title: string; body: string; href: string; priority: string; read: boolean; created_at: string };
type Preference = { notification_type: string; mode: string };
type Failure = { id: string; event_type: string; attempt_count: number; last_error: string };
type Filter = "all" | "unread" | "messages" | "verification" | "opportunities" | "milestones" | "actions";
type NotificationResponse = { notifications?: Notification[]; preferences?: Preference[]; failures?: Failure[]; error?: string };

const preferenceTypes = ["message", "invitation", "verification", "opportunity", "milestone", "intervention"] as const;

async function fetchNotifications(): Promise<NotificationResponse> {
  const response = await fetch("/api/notifications", { cache: "no-store" });
  const result = await response.json() as NotificationResponse;
  if (!response.ok) throw new Error(result.error ?? "Notifications could not be loaded.");
  return result;
}

function matchesFilter(item: Notification, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "unread") return !item.read;
  if (filter === "messages") return ["message", "mail_reply"].includes(item.type);
  if (filter === "verification") return item.type === "verification";
  if (filter === "opportunities") return ["opportunity", "recommendation"].includes(item.type);
  if (filter === "milestones") return item.type === "milestone";
  return ["shared_action", "invitation", "network_blocker", "intervention", "compass_alert"].includes(item.type);
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<Preference[]>([]);
  const [failures, setFailures] = useState<Failure[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Loading what needs your attention…");
  const [error, setError] = useState("");

  async function reload() {
    setLoading(true); setError("");
    try {
      const result = await fetchNotifications();
      setNotifications(result.notifications ?? []);
      setPreferences(result.preferences ?? []);
      setFailures(result.failures ?? []);
      setStatus("Your attention center is current.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Notifications could not be loaded.");
      setStatus("");
    } finally { setLoading(false); }
  }

  useEffect(() => {
    let active = true;
    void fetchNotifications().then((result) => {
      if (!active) return;
      setNotifications(result.notifications ?? []);
      setPreferences(result.preferences ?? []);
      setFailures(result.failures ?? []);
      setStatus("Your attention center is current.");
    }).catch((cause) => {
      if (!active) return;
      setError(cause instanceof Error ? cause.message : "Notifications could not be loaded.");
      setStatus("");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const visible = useMemo(() => notifications.filter((item) => matchesFilter(item, filter)), [notifications, filter]);
  const unread = notifications.filter((item) => !item.read).length;
  const urgent = notifications.filter((item) => !item.read && ["high", "urgent"].includes(item.priority)).length;
  const verification = notifications.filter((item) => !item.read && item.type === "verification").length;

  async function act(payload: Record<string, unknown>) {
    setError("");
    const response = await fetch("/api/notifications", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Notification action failed."); return; }
    await reload();
  }

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Playbook Attention Center" title="Know what changed. Know what to do next." subtitle="Trusted lifecycle events become actionable notifications with deep links, priority, delivery preferences, acknowledgement, and recovery. System events come from governed Playbook workflows—not user-authored notification payloads." />
      <PlaybookMetrics>
        <PlaybookMetric label="Unread" value={loading ? "…" : String(unread)} />
        <PlaybookMetric label="High priority" value={loading ? "…" : String(urgent)} />
        <PlaybookMetric label="Verification" value={loading ? "…" : String(verification)} />
        <PlaybookMetric label="Delivery failures" value={loading ? "…" : String(failures.length)} />
      </PlaybookMetrics>
      <p role="status" aria-live="polite" style={statusLine}>{loading ? "Loading…" : status}</p>
      {error && <div role="alert" style={alert}>{error} <button type="button" onClick={() => void reload()}>Retry</button></div>}
      <PlaybookCard eyebrow="Delivery" title="Choose how Playbook reaches you">
        <div style={preferencesGrid}>{preferenceTypes.map((type) => (
          <label key={type} style={preferenceLabel}><span>{type.replaceAll("_", " ")}</span>
            <select value={preferences.find((item) => item.notification_type === type)?.mode ?? "immediate"}
              onChange={(event) => void act({ action: "PREFERENCE", notificationType: type, mode: event.target.value })} style={select}>
              <option value="immediate">Immediate</option><option value="daily_digest">Daily digest</option><option value="weekly_digest">Weekly digest</option><option value="muted">Muted</option>
            </select>
          </label>
        ))}</div>
      </PlaybookCard>
      <section aria-label="Notification views" style={filters}>
        {(["all", "unread", "messages", "verification", "opportunities", "milestones", "actions"] as Filter[]).map((value) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} style={filter === value ? activeFilter : filterButton}>{value}</button>
        ))}
        {unread > 0 && <button type="button" onClick={() => void act({ action: "READ_ALL" })} style={secondaryButton}>Mark all read</button>}
      </section>
      {!loading && visible.length === 0 ? (
        <PlaybookCard eyebrow="Attention Center" title="Nothing needs your attention here"><p style={copy}>When a governed Playbook workflow changes something important, the action will appear here with a direct next step.</p></PlaybookCard>
      ) : (
        <PlaybookGrid min={340}>{visible.map((item) => (
          <PlaybookCard key={item.id} eyebrow={`${item.type.replaceAll("_", " ")} · ${item.priority}`} title={item.title}>
            <div style={pillRow}><PlaybookPill>{item.read ? "Seen" : "New"}</PlaybookPill><PlaybookPill>{new Date(item.created_at).toLocaleString()}</PlaybookPill></div>
            <p style={copy}>{item.body}</p>
            <div style={actions}><Link href={item.href} style={primaryLink}>Take action →</Link>{!item.read && <button type="button" onClick={() => void act({ action: "READ", notificationId: item.id })} style={secondaryButton}>Mark read</button>}</div>
          </PlaybookCard>
        ))}</PlaybookGrid>
      )}
      {failures.length > 0 && <section style={recoverySection} aria-label="Delivery recovery"><h2 style={recoveryHeading}>Delivery recovery</h2><PlaybookGrid min={320}>{failures.map((item) => <PlaybookCard key={item.id} eyebrow={`${item.attempt_count} attempts`} title={item.event_type}><p style={copy}>{item.last_error}</p><button type="button" onClick={() => void act({ action: "RETRY", outboxId: item.id })} style={secondaryButton}>Retry trusted delivery</button></PlaybookCard>)}</PlaybookGrid></section>}
    </PlaybookPage>
  );
}

const statusLine: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 12px", color: "#475569" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 12, borderRadius: 14, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#991B1B" };
const preferencesGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 };
const preferenceLabel: React.CSSProperties = { display: "grid", gap: 7, color: "#0F172A", fontWeight: 850, textTransform: "capitalize" };
const select: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 12, padding: "10px 12px", background: "#FFFFFF", color: "#0F172A" };
const filters: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 22px", display: "flex", flexWrap: "wrap", gap: 8 };
const baseButton: React.CSSProperties = { borderRadius: 999, padding: "9px 13px", fontWeight: 900, cursor: "pointer" };
const filterButton: React.CSSProperties = { ...baseButton, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#334155", textTransform: "capitalize" };
const activeFilter: React.CSSProperties = { ...filterButton, background: "#0F172A", color: "#FFFFFF", borderColor: "#0F172A" };
const secondaryButton: React.CSSProperties = { ...baseButton, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" };
const primaryLink: React.CSSProperties = { ...baseButton, display: "inline-block", border: 0, background: "#F97316", color: "#FFFFFF", textDecoration: "none" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const pillRow: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 };
const actions: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" };
const recoverySection: React.CSSProperties = { maxWidth: 1180, margin: "30px auto 0" };
const recoveryHeading: React.CSSProperties = { color: "#0F172A", fontSize: 28 };
