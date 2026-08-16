"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

type Circle = {
  id: string;
  name: string;
  description: string;
  pillar: string;
  mentor_user_id: string;
  mentor_name: string;
  mentor_username: string | null;
  mentor_avatar_url: string | null;
  capacity: number;
  active_count: number;
  waitlist_count: number;
  status: string;
  next_session_at: string | null;
  timezone: string;
  location: string | null;
  my_membership: "active" | "waitlisted" | "left" | "removed" | null;
};

type CirclesResponse = { circles?: Circle[]; error?: string };

async function fetchCircles(): Promise<Circle[]> {
  const response = await fetch("/api/community/mentorship", { cache: "no-store" });
  const result = await response.json() as CirclesResponse;
  if (!response.ok) throw new Error(result.error || "Mentorship circles could not be loaded.");
  return result.circles || [];
}

function formatSession(value: string | null) {
  if (!value) return "Next session to be scheduled";
  return new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value));
}

export default function MentorshipPage() {
  const [circles, setCircles] = useState<Circle[]>([]);
  const [view, setView] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("Loading governed mentorship circles…");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCircles();
      setCircles(data);
      setMessage(data.length ? "Mentorship circles are current." : "No active mentorship circles yet.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Mentorship circles could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void fetchCircles().then((data) => {
      if (!active) return;
      setCircles(data);
      setMessage(data.length ? "Mentorship circles are current." : "No active mentorship circles yet.");
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Mentorship circles could not be loaded.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  async function changeMembership(circle: Circle, action: "join" | "leave") {
    setBusy(circle.id);
    setError("");
    try {
      const response = await fetch("/api/community/mentorship", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ circleId: circle.id, action }),
      });
      const result = await response.json() as { membership?: { membership_status?: string }; error?: string };
      if (!response.ok) throw new Error(result.error || "Circle membership could not be updated.");
      const status = result.membership?.membership_status;
      setMessage(action === "leave" ? "You left the circle." : status === "waitlisted" ? "The circle is full. You’ve been added to the waitlist." : "You joined the circle.");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Circle membership could not be updated.");
    } finally {
      setBusy(null);
    }
  }

  const memberships = circles.filter((circle) => circle.my_membership === "active");
  const waitlists = circles.filter((circle) => circle.my_membership === "waitlisted");
  const visible = useMemo(() => view === "mine" ? circles.filter((circle) => circle.my_membership === "active" || circle.my_membership === "waitlisted") : circles, [circles, view]);
  const seats = circles.reduce((total, circle) => total + Math.max(circle.capacity - circle.active_count, 0), 0);

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Playbook Mentorship" title="Small circles. Real relationships. Durable support." subtitle="Mentorship Circles are governed communities led by onboarded Playbook Mentors. Membership, capacity, waitlists, mentor identity, and session state persist beyond the browser." />
      <PlaybookMetrics>
        <PlaybookMetric label="Active circles" value={loading ? "…" : String(circles.length)} />
        <PlaybookMetric label="Your circles" value={loading ? "…" : String(memberships.length)} />
        <PlaybookMetric label="Waitlists" value={loading ? "…" : String(waitlists.length)} />
        <PlaybookMetric label="Open seats" value={loading ? "…" : String(seats)} />
      </PlaybookMetrics>

      <div role="status" aria-live="polite" style={statusLine}>{loading ? "Loading…" : message}</div>
      {error && <div role="alert" style={alert}>{error} <button type="button" onClick={() => void load()}>Retry</button></div>}

      <section style={toolbar} aria-label="Mentorship views">
        <button type="button" aria-pressed={view === "all"} onClick={() => setView("all")} style={view === "all" ? activeButton : filterButton}>Explore circles</button>
        <button type="button" aria-pressed={view === "mine"} onClick={() => setView("mine")} style={view === "mine" ? activeButton : filterButton}>My circles ({memberships.length + waitlists.length})</button>
        <Link href="/support-network" style={supportLink}>My Support Network →</Link>
      </section>

      {!loading && visible.length === 0 ? (
        <PlaybookCard eyebrow="Mentorship" title={view === "mine" ? "You haven’t joined a circle yet" : "No active circles yet"}>
          <p style={copy}>{view === "mine" ? "Explore active circles and choose a community aligned with what you’re building." : "Playbook will show mentorship only when a real onboarded Mentor has an active circle."}</p>
          {view === "mine" && <button type="button" onClick={() => setView("all")} style={primaryButton}>Explore mentorship</button>}
        </PlaybookCard>
      ) : (
        <PlaybookGrid min={330}>
          {visible.map((circle) => {
            const full = circle.active_count >= circle.capacity;
            const active = circle.my_membership === "active";
            const waitlisted = circle.my_membership === "waitlisted";
            const occupancy = Math.min(Math.round((circle.active_count / circle.capacity) * 100), 100);
            return (
              <PlaybookCard key={circle.id} eyebrow={circle.pillar} title={circle.name}>
                <div style={mentorRow}>
                  <div style={avatar}>
                    {circle.mentor_avatar_url ? <Image unoptimized width={54} height={54} src={circle.mentor_avatar_url} alt="" style={avatarImage} /> : circle.mentor_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <strong style={mentorName}>{circle.mentor_name}</strong>
                    {circle.mentor_username && <div><Link href={`/u/${circle.mentor_username}`} style={profileLink}>@{circle.mentor_username}</Link></div>}
                    <span style={mentorLabel}>Playbook Mentor</span>
                  </div>
                </div>

                <p style={copy}>{circle.description}</p>
                <div style={sessionCard}>
                  <span style={label}>Next session</span>
                  <strong>{formatSession(circle.next_session_at)}</strong>
                  <span style={locationText}>{circle.location || "Location to be announced"}</span>
                </div>

                <div style={progressTop}><span>{circle.active_count}/{circle.capacity} members</span><strong>{occupancy}%</strong></div>
                <div style={progressTrack}><div style={{ ...progressFill, width: `${occupancy}%` }} /></div>

                <div style={pillRow}>
                  {active && <PlaybookPill>Member</PlaybookPill>}
                  {waitlisted && <PlaybookPill>Waitlisted</PlaybookPill>}
                  {circle.waitlist_count > 0 && <PlaybookPill>{circle.waitlist_count} waiting</PlaybookPill>}
                  {!full && <PlaybookPill>{circle.capacity - circle.active_count} seats open</PlaybookPill>}
                </div>

                <div style={actions}>
                  {active || waitlisted ? (
                    <button type="button" disabled={busy === circle.id} onClick={() => void changeMembership(circle, "leave")} style={secondaryButton}>{busy === circle.id ? "Updating…" : active ? "Leave circle" : "Leave waitlist"}</button>
                  ) : (
                    <button type="button" disabled={busy === circle.id} onClick={() => void changeMembership(circle, "join")} style={primaryButton}>{busy === circle.id ? "Joining…" : full ? "Join waitlist" : "Join circle"}</button>
                  )}
                </div>
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
const toolbar: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 22px", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" };
const baseButton: React.CSSProperties = { borderRadius: 999, padding: "10px 15px", fontWeight: 900, cursor: "pointer" };
const filterButton: React.CSSProperties = { ...baseButton, background: "#FFFFFF", color: "#334155", border: "1px solid #CBD5E1" };
const activeButton: React.CSSProperties = { ...filterButton, background: "#0F172A", color: "#FFFFFF", borderColor: "#0F172A" };
const primaryButton: React.CSSProperties = { ...baseButton, border: 0, background: "#F97316", color: "#FFFFFF" };
const secondaryButton: React.CSSProperties = { ...filterButton };
const supportLink: React.CSSProperties = { marginLeft: "auto", color: "#C2410C", fontWeight: 900, textDecoration: "none" };
const mentorRow: React.CSSProperties = { display: "flex", gap: 12, alignItems: "center", marginBottom: 14 };
const avatar: React.CSSProperties = { width: 54, height: 54, borderRadius: 18, display: "grid", placeItems: "center", overflow: "hidden", background: "#0F172A", color: "#F97316", fontWeight: 950, fontSize: 20 };
const avatarImage: React.CSSProperties = { width: 54, height: 54, objectFit: "cover" };
const mentorName: React.CSSProperties = { color: "#0F172A" };
const mentorLabel: React.CSSProperties = { color: "#64748B", fontSize: 12 };
const profileLink: React.CSSProperties = { color: "#C2410C", fontWeight: 850, textDecoration: "none", fontSize: 12 };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const sessionCard: React.CSSProperties = { padding: 14, borderRadius: 14, background: "#F8FAFC", border: "1px solid #E2E8F0", margin: "14px 0", color: "#0F172A" };
const label: React.CSSProperties = { display: "block", color: "#64748B", fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 4 };
const locationText: React.CSSProperties = { display: "block", marginTop: 4, color: "#64748B", fontSize: 12 };
const progressTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", color: "#64748B", fontSize: 12, marginBottom: 6 };
const progressTrack: React.CSSProperties = { height: 7, borderRadius: 999, overflow: "hidden", background: "#E2E8F0" };
const progressFill: React.CSSProperties = { height: "100%", borderRadius: 999, background: "#F97316" };
const pillRow: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", margin: "14px 0" };
const actions: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap" };
