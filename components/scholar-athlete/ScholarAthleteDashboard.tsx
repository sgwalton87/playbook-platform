"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type AthleteProfile = {
  id: string;
  full_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  role?: string | null;
  profile_mode?: string | null;
  onboarding_completed?: boolean | null;
  public_profile_complete?: boolean | null;
  school?: string | null;
  grade?: string | null;
  gpa?: string | null;
  weighted_gpa?: string | null;
  primary_sport?: string | null;
  position?: string | null;
  current_team?: string | null;
  highlight_reel_url?: string | null;
  onboarding_data?: Record<string, unknown> | null;
};

function text(value: unknown) {
  if (Array.isArray(value)) return value.filter(Boolean).join(", ");
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function profileName(profile: AthleteProfile | null) {
  return profile?.full_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || profile?.username || "Scholar-athlete profile";
}

export default function ScholarAthleteDashboard() {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,first_name,last_name,username,role,profile_mode,onboarding_completed,public_profile_complete,school,grade,gpa,weighted_gpa,primary_sport,position,current_team,highlight_reel_url,onboarding_data")
        .eq("id", userData.user.id)
        .maybeSingle();

      setProfile((data as AthleteProfile | null) || null);
      setLoading(false);
    }

    loadProfile();
  }, []);

  const onboardingData = profile?.onboarding_data || {};
  const sport = profile?.primary_sport || text(onboardingData.primary_sport);
  const position = profile?.position || text(onboardingData.position);
  const team = profile?.current_team || text(onboardingData.current_team);
  const highlight = profile?.highlight_reel_url || text(onboardingData.highlight_link);

  if (loading) return <main style={page}>Loading scholar-athlete dashboard...</main>;

  return (
    <main style={page}>
      <section style={hero}>
        <div>
          <p style={eyebrow}>Scholar-Athlete OS</p>
          <h1 style={title}>{profileName(profile)}</h1>
          <p style={sub}>Live profile fields power this dashboard. Missing athletic, recruiting, or NIL data is shown as an empty state instead of fabricated targets.</p>
        </div>

        <div style={identity}>
          <strong>{profile?.profile_mode || profile?.role || "Role not set"}</strong>
          <span>{profile?.onboarding_completed ? "Onboarding complete" : "Onboarding not complete"}</span>
        </div>
      </section>

      <section style={metrics}>
        <Metric label="School" value={profile?.school || "Not provided"} />
        <Metric label="Academic Core" value={profile?.weighted_gpa || profile?.gpa || "Not provided"} />
        <Metric label="Primary Sport" value={sport || "Not provided"} />
        <Metric label="Public Profile" value={profile?.public_profile_complete ? "Complete" : "Incomplete"} />
      </section>

      <section style={grid}>
        <Panel eyebrow="Athlete Profile" title={sport || "Sport not provided"} body={`Position/event: ${position || "Not provided"}. Team: ${team || "Not provided"}.`} />
        <Panel eyebrow="Recruiting Evidence" title="Highlight link" body={highlight || "No highlight link has been added yet."} />
        <Panel eyebrow="Eligibility" title="No fabricated status" body="Eligibility status requires live transcript, A-G, and governing-body data. This dashboard does not invent eligibility metrics." />
        <Panel eyebrow="NIL" title="No active deals shown" body="NIL deal counts require live deal records. No placeholder deals are displayed." />
      </section>
    </main>
  );
}

function Metric(props: { label: string; value: string }) {
  return (
    <article style={metric}>
      <span style={metricLabel}>{props.label}</span>
      <strong style={metricValue}>{props.value}</strong>
    </article>
  );
}

function Panel(props: { eyebrow: string; title: string; body: string }) {
  return (
    <article style={panel}>
      <p style={eyebrow}>{props.eyebrow}</p>
      <h2 style={panelTitle}>{props.title}</h2>
      <p style={body}>{props.body}</p>
    </article>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", padding: 32, background: "#F8F7F4", fontFamily: "system-ui, sans-serif" };
const hero: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 36, borderRadius: 30, background: "#0F172A", color: "#FFFFFF", display: "flex", justifyContent: "space-between", gap: 24, flexWrap: "wrap" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#F97316", fontWeight: 950, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
const title: React.CSSProperties = { maxWidth: 760, margin: "12px 0", fontSize: 54, lineHeight: 1 };
const sub: React.CSSProperties = { maxWidth: 700, color: "#CBD5E1", fontSize: 17, lineHeight: 1.6 };
const identity: React.CSSProperties = { alignSelf: "flex-end", display: "grid", gap: 4, padding: 16, borderRadius: 16, background: "rgba(255,255,255,.08)" };
const metrics: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 12 };
const metric: React.CSSProperties = { padding: 18, background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 18 };
const metricLabel: React.CSSProperties = { display: "block", color: "#64748B", fontSize: 12, fontWeight: 800 };
const metricValue: React.CSSProperties = { display: "block", marginTop: 8, color: "#0F172A", fontSize: 22 };
const grid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 };
const panel: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 22, padding: 22 };
const panelTitle: React.CSSProperties = { color: "#0F172A", fontSize: 25, margin: "10px 0" };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
