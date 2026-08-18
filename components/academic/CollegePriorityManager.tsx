"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";

type PriorityFlag = "is_dream" | "is_top";

type SavedSchool = {
  id: string;
  college_name: string;
  college_type: string | null;
  status: string | null;
  deadline: string | null;
  notes: string | null;
  is_dream: boolean;
  is_top: boolean;
};

type Props = {
  flag: PriorityFlag;
  title: string;
  eyebrow: string;
  subtitle: string;
  activeLabel: string;
  emptyTitle: string;
  emptyCopy: string;
  promoteHeading: string;
  promoteLabel: string;
  removeLabel: string;
};

export default function CollegePriorityManager({
  flag,
  title,
  eyebrow,
  subtitle,
  activeLabel,
  emptyTitle,
  emptyCopy,
  promoteHeading,
  promoteLabel,
  removeLabel,
}: Props) {
  const router = useRouter();
  const [schools, setSchools] = useState<SavedSchool[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState("");

  const load = useCallback(async () => {
    const auth = await supabase.auth.getUser();
    if (!auth.data.user) {
      router.replace("/login");
      return;
    }

    const result = await supabase
      .from("college_list")
      .select("id,college_name,college_type,status,deadline,notes,is_dream,is_top")
      .eq("user_id", auth.data.user.id)
      .order("created_at", { ascending: false });

    if (result.error) setMessage(result.error.message);
    else setSchools((result.data || []) as SavedSchool[]);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (active) void load();
    });
    return () => {
      active = false;
    };
  }, [load]);

  async function updatePriority(school: SavedSchool, enabled: boolean) {
    setBusy(school.id);
    setMessage("");

    const auth = await supabase.auth.getUser();
    if (!auth.data.user) {
      setBusy("");
      router.replace("/login");
      return;
    }

    const result = await supabase
      .from("college_list")
      .update({ [flag]: enabled })
      .eq("id", school.id)
      .eq("user_id", auth.data.user.id);

    if (result.error) {
      setMessage(result.error.message);
    } else {
      setMessage(
        enabled
          ? `${school.college_name} is now marked ${activeLabel}.`
          : `${school.college_name} remains saved but is no longer marked ${activeLabel}.`
      );
      await load();
    }
    setBusy("");
  }

  const prioritized = schools.filter((school) => school[flag]);
  const candidates = schools.filter((school) => !school[flag]);

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <PlaybookMetrics>
        <PlaybookMetric label={activeLabel} value={loading ? "…" : String(prioritized.length)} />
        <PlaybookMetric label="Other saved schools" value={loading ? "…" : String(candidates.length)} />
        <PlaybookMetric label="Authority" value="College List" />
      </PlaybookMetrics>

      {message && (
        <p role="status" aria-live="polite" style={statusStyle}>
          {message}
        </p>
      )}

      <section style={sectionStyle}>
        <div style={headerStyle}>
          <div>
            <p style={eyebrowStyle}>Priority schools</p>
            <h2 style={headingStyle}>{activeLabel}</h2>
          </div>
          <div style={actionsStyle}>
            <Link href="/college-search" style={secondaryLinkStyle}>College Search →</Link>
            {flag === "is_dream" ? (
              <Link href="/top-schools" style={secondaryLinkStyle}>Top Schools →</Link>
            ) : (
              <Link href="/dream-schools" style={secondaryLinkStyle}>Dream Schools →</Link>
            )}
          </div>
        </div>

        {!loading && prioritized.length === 0 ? (
          <PlaybookCard eyebrow={activeLabel} title={emptyTitle}>
            <p style={copyStyle}>{emptyCopy}</p>
          </PlaybookCard>
        ) : (
          <PlaybookGrid min={320}>
            {prioritized.map((school) => (
              <PlaybookCard key={school.id} eyebrow={school.status || "considering"} title={school.college_name}>
                <PlaybookPill>{activeLabel}</PlaybookPill>
                {school.is_dream && flag !== "is_dream" && <PlaybookPill>Dream School</PlaybookPill>}
                {school.is_top && flag !== "is_top" && <PlaybookPill>Top School</PlaybookPill>}
                {school.deadline && <PlaybookPill>Deadline {school.deadline}</PlaybookPill>}
                <div style={actionsStyle}>
                  <Link
                    href={`/application-workspaces?${new URLSearchParams({
                      opportunityName: school.college_name,
                      opportunityType: "college",
                    }).toString()}`}
                    style={primaryStyle}
                  >
                    Application Workspace →
                  </Link>
                  <button
                    type="button"
                    disabled={busy === school.id}
                    onClick={() => void updatePriority(school, false)}
                    style={secondaryButtonStyle}
                  >
                    {removeLabel}
                  </button>
                </div>
              </PlaybookCard>
            ))}
          </PlaybookGrid>
        )}
      </section>

      {!loading && candidates.length > 0 && (
        <section style={sectionStyle}>
          <p style={eyebrowStyle}>Saved schools</p>
          <h2 style={headingStyle}>{promoteHeading}</h2>
          <PlaybookGrid min={300}>
            {candidates.map((school) => (
              <PlaybookCard key={school.id} eyebrow={school.status || school.college_type || "saved"} title={school.college_name}>
                {school.is_dream && <PlaybookPill>Dream School</PlaybookPill>}
                {school.is_top && <PlaybookPill>Top School</PlaybookPill>}
                <button
                  type="button"
                  disabled={busy === school.id}
                  onClick={() => void updatePriority(school, true)}
                  style={primaryStyle}
                >
                  {promoteLabel}
                </button>
              </PlaybookCard>
            ))}
          </PlaybookGrid>
        </section>
      )}
    </PlaybookPage>
  );
}

const sectionStyle: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 30px" };
const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "end",
  gap: 12,
  flexWrap: "wrap",
  marginBottom: 14,
};
const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: "#EA580C",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".1em",
};
const headingStyle: React.CSSProperties = { margin: "6px 0 14px", color: "#0F172A", fontSize: "clamp(27px,4vw,40px)" };
const copyStyle: React.CSSProperties = { color: "#475569", lineHeight: 1.65 };
const statusStyle: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", color: "#475569" };
const actionsStyle: React.CSSProperties = { display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 };
const baseActionStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  borderRadius: 999,
  padding: "10px 14px",
  fontWeight: 900,
  textDecoration: "none",
  cursor: "pointer",
};
const primaryStyle: React.CSSProperties = { ...baseActionStyle, border: 0, background: "#F97316", color: "#fff" };
const secondaryLinkStyle: React.CSSProperties = {
  ...baseActionStyle,
  border: "1px solid #CBD5E1",
  background: "#fff",
  color: "#0F172A",
};
const secondaryButtonStyle: React.CSSProperties = { ...secondaryLinkStyle };
