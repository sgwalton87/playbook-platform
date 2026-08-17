"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaybookButton,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui/PlaybookPage";
import { supabase } from "@/lib/supabaseClient";

type RecruitingEventRow = {
  id: string;
  event_type: string;
  from_stage: string | null;
  to_stage: string | null;
  summary: string | null;
  occurred_at: string;
  recruiting_targets: { school_name: string } | { school_name: string }[] | null;
};

function schoolNameFor(event: RecruitingEventRow) {
  const target = Array.isArray(event.recruiting_targets)
    ? event.recruiting_targets[0]
    : event.recruiting_targets;
  return target?.school_name || "Recruiting target";
}

export default function RecruitingTimelinePage() {
  const router = useRouter();
  const [events, setEvents] = useState<RecruitingEventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTimeline() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login");
        return;
      }

      const { data, error: timelineError } = await supabase
        .from("recruiting_target_events")
        .select("id,event_type,from_stage,to_stage,summary,occurred_at,recruiting_targets(school_name)")
        .eq("scholar_id", auth.user.id)
        .order("occurred_at", { ascending: false })
        .limit(100);

      if (!active) return;
      if (timelineError) {
        setError(timelineError.message);
        setLoading(false);
        return;
      }

      setEvents((data || []) as RecruitingEventRow[]);
      setLoading(false);
    }

    void loadTimeline();
    return () => { active = false; };
  }, [router]);

  return (
    <PlaybookPage>
      <div data-testid="recruiting-timeline" data-visual-canon="PGRT-001">
        <PlaybookHero
          eyebrow="Recruiting Timeline"
          title="Keep the evidence of every recruiting move."
          subtitle="Your timeline records target creation and stage changes so conversations, visits, offers, and commitments remain traceable over time."
        >
          <div style={heroActions}>
            <PlaybookButton href="/recruiting">Back to Recruiting Command Center</PlaybookButton>
            <PlaybookButton href="/scholar-athlete-os" variant="secondary">Scholar-Athlete OS</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={timelinePanel} aria-labelledby="timeline-heading">
          <div style={headingRow}>
            <div>
              <PlaybookPill>Living evidence</PlaybookPill>
              <h2 id="timeline-heading" style={sectionTitle}>Recruiting history</h2>
            </div>
            <span style={recordTruth}>{loading ? "Loading private history…" : `${events.length} recorded event${events.length === 1 ? "" : "s"}`}</span>
          </div>

          {error ? <div role="alert" style={errorState}><strong>Timeline needs attention.</strong> {error}</div> : null}

          {!loading && !error && events.length === 0 ? (
            <div style={emptyState}>
              <h3 style={{ marginTop: 0 }}>Your timeline starts with your first real recruiting target.</h3>
              <p style={muted}>No activity is manufactured. Add a school or program in the Recruiting Command Center and future stage changes will be preserved automatically.</p>
            </div>
          ) : null}

          <ol style={timelineList}>
            {events.map((event) => (
              <li key={event.id} style={timelineItem}>
                <div style={marker} aria-hidden="true" />
                <div style={eventCard}>
                  <div style={eventTopline}>
                    <span style={eventType}>{formatLabel(event.event_type)}</span>
                    <time dateTime={event.occurred_at} style={eventTime}>{new Date(event.occurred_at).toLocaleString()}</time>
                  </div>
                  <h3 style={eventTitle}>{schoolNameFor(event)}</h3>
                  <p style={eventCopy}>
                    {event.event_type === "stage_change"
                      ? `${formatLabel(event.from_stage || "unknown")} → ${formatLabel(event.to_stage || "unknown")}`
                      : `Added at ${formatLabel(event.to_stage || "researching")}`}
                  </p>
                  {event.summary ? <p style={summary}>{event.summary}</p> : null}
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </PlaybookPage>
  );
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const timelinePanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "clamp(20px,4vw,34px)", background: "#FFFFFF", border: "1px solid #DDE6EF", borderRadius: "24px 6px 24px 6px", boxShadow: "0 16px 50px rgba(15,23,42,.06)" };
const headingRow: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 16, alignItems: "start" };
const sectionTitle: React.CSSProperties = { margin: "12px 0 0", color: "#102238", fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.05 };
const recordTruth: React.CSSProperties = { color: "#6B7F94", fontSize: 12, fontWeight: 800 };
const errorState: React.CSSProperties = { marginTop: 20, padding: 16, borderRadius: 16, background: "#FFF5F4", border: "1px solid #F5B7B1", color: "#7F1D1D" };
const emptyState: React.CSSProperties = { marginTop: 22, padding: 22, borderRadius: 18, background: "#F4F8FB", border: "1px dashed #B8C9D8", color: "#20364E" };
const muted: React.CSSProperties = { color: "#61748A", lineHeight: 1.65 };
const timelineList: React.CSSProperties = { listStyle: "none", margin: "26px 0 0", padding: 0, display: "grid", gap: 0 };
const timelineItem: React.CSSProperties = { display: "grid", gridTemplateColumns: "24px minmax(0,1fr)", gap: 14, position: "relative", paddingBottom: 18 };
const marker: React.CSSProperties = { width: 12, height: 12, marginTop: 20, borderRadius: 999, background: "#F97316", boxShadow: "0 0 0 5px #FFF1E8" };
const eventCard: React.CSSProperties = { padding: 18, borderRadius: 18, border: "1px solid #E2E8F0", background: "#FBFCFE" };
const eventTopline: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 10 };
const eventType: React.CSSProperties = { color: "#D65F1F", fontSize: 10, fontWeight: 950, letterSpacing: ".12em", textTransform: "uppercase" };
const eventTime: React.CSSProperties = { color: "#718399", fontSize: 12 };
const eventTitle: React.CSSProperties = { margin: "7px 0 5px", color: "#102238", fontSize: 22 };
const eventCopy: React.CSSProperties = { margin: 0, color: "#20364E", fontWeight: 850 };
const summary: React.CSSProperties = { margin: "8px 0 0", color: "#718399", lineHeight: 1.55 };
