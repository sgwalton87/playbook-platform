"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Badge = { id: string; badge_key: string; badge_name: string; description: string; source_type: string; source_id: string; awarded_at: string };

export default function BadgesPage() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { location.href = "/login?next=/badges"; return; }
      const result = await supabase.from("achievement_badges").select("id,badge_key,badge_name,description,source_type,source_id,awarded_at").eq("user_id", auth.user.id).order("awarded_at", { ascending: false });
      if (result.error) throw result.error;
      if (active) setBadges((result.data || []) as Badge[]);
    })().catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Badges could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const courseBadges = badges.filter((badge) => badge.source_type === "course");

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Achievement Vault" title="Badges backed by evidence" subtitle="Badges are issued from governed lifecycle events. They are no longer an editable array on a profile record." />
      <PlaybookMetrics>
        <PlaybookMetric label="Badges earned" value={loading ? "…" : String(badges.length)} />
        <PlaybookMetric label="Course badges" value={loading ? "…" : String(courseBadges.length)} />
        <PlaybookMetric label="Authority" value="Governed" />
      </PlaybookMetrics>
      {error && <div role="alert" style={alert}>{error}</div>}
      {loading ? <div style={state}>Loading achievement evidence…</div> : badges.length === 0 ? (
        <PlaybookCard eyebrow="Badge Vault" title="No governed badges yet">
          <p style={copy}>Complete a published course to earn a course-completion badge. Additional milestone badges can be added only when their issuing lifecycle is governed and auditable.</p>
          <Link href="/courses" style={primaryLink}>Go to Courses →</Link>
        </PlaybookCard>
      ) : (
        <PlaybookGrid min={290}>
          {badges.map((badge) => <PlaybookCard key={badge.id} eyebrow={badge.source_type} title={badge.badge_name}>
            <div style={seal}>★</div>
            <PlaybookPill>Evidence-backed</PlaybookPill>
            <p style={copy}>{badge.description}</p>
            <p style={meta}>Awarded {new Date(badge.awarded_at).toLocaleDateString()} · Source: {badge.source_id}</p>
            {badge.source_type === "course" && <Link href={`/courses/${badge.source_id}`} style={secondaryLink}>Open source course</Link>}
          </PlaybookCard>)}
        </PlaybookGrid>
      )}
    </PlaybookPage>
  );
}

const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 15px", padding: 13, borderRadius: 12, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" };
const state: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: 28, background: "#FFFFFF", borderRadius: 18, color: "#64748B" };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const meta: React.CSSProperties = { color: "#94A3B8", fontSize: 12, lineHeight: 1.5 };
const seal: React.CSSProperties = { width: 72, height: 72, display: "grid", placeItems: "center", borderRadius: 24, margin: "8px 0 14px", fontSize: 34, color: "#F97316", background: "linear-gradient(135deg,#07172D,#102A4A)" };
const primaryLink: React.CSSProperties = { display: "inline-block", width: "fit-content", padding: "10px 14px", borderRadius: 999, background: "#F97316", color: "#FFFFFF", fontWeight: 900, textDecoration: "none" };
const secondaryLink: React.CSSProperties = { ...primaryLink, background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" };
