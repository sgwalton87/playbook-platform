"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlaybookButton,
  PlaybookHero,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui/PlaybookPage";
import { supabase } from "@/lib/supabaseClient";

type AthleteProfileRow = {
  scholar_id: string;
  sport: string;
  position: string | null;
  secondary_position: string | null;
  graduation_year: number;
  governing_path: string;
  recruiting_status: string;
  highlight_url: string | null;
  updated_at: string;
};

export default function RecruitingProfilePage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [secondaryPosition, setSecondaryPosition] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [governingPath, setGoverningPath] = useState("undecided");
  const [recruitingStatus, setRecruitingStatus] = useState("exploring");
  const [highlightUrl, setHighlightUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login");
        return;
      }

      setOwnerId(auth.user.id);
      const { data, error: profileError } = await supabase
        .from("athlete_profiles")
        .select("scholar_id,sport,position,secondary_position,graduation_year,governing_path,recruiting_status,highlight_url,updated_at")
        .eq("scholar_id", auth.user.id)
        .maybeSingle();

      if (!active) return;
      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      const profile = data as AthleteProfileRow | null;
      if (profile) {
        setSport(profile.sport);
        setPosition(profile.position || "");
        setSecondaryPosition(profile.secondary_position || "");
        setGraduationYear(String(profile.graduation_year));
        setGoverningPath(profile.governing_path);
        setRecruitingStatus(profile.recruiting_status);
        setHighlightUrl(profile.highlight_url || "");
      }
      setLoading(false);
    }

    void loadProfile();
    return () => { active = false; };
  }, [router]);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerId) return;

    const year = Number(graduationYear);
    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      setError("Enter a valid four-digit graduation year.");
      return;
    }

    let normalizedHighlightUrl: string | null = null;
    if (highlightUrl.trim()) {
      try {
        const parsed = new URL(highlightUrl.trim());
        if (parsed.protocol !== "https:" && parsed.protocol !== "http:") throw new Error("Unsupported protocol");
        normalizedHighlightUrl = parsed.toString();
      } catch {
        setError("Highlight film must be a valid http or https URL.");
        return;
      }
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    const { error: saveError } = await supabase
      .from("athlete_profiles")
      .upsert({
        scholar_id: ownerId,
        sport: sport.trim(),
        position: position.trim() || null,
        secondary_position: secondaryPosition.trim() || null,
        graduation_year: year,
        governing_path: governingPath,
        recruiting_status: recruitingStatus,
        highlight_url: normalizedHighlightUrl,
        updated_at: new Date().toISOString(),
      }, { onConflict: "scholar_id" });

    if (saveError) {
      setError(saveError.message);
      setSaving(false);
      return;
    }

    setHighlightUrl(normalizedHighlightUrl || "");
    setMessage("Athlete profile saved to your private recruiting record.");
    setSaving(false);
  }

  if (loading) {
    return <PlaybookPage><div data-testid="athlete-recruiting-profile" style={loadingState}>Connecting your private athlete record…</div></PlaybookPage>;
  }

  return (
    <PlaybookPage>
      <div data-testid="athlete-recruiting-profile" data-visual-canon="PGAP-001">
        <PlaybookHero
          eyebrow="Athlete Profile & Film"
          title="Make the athletic record as intentional as the recruiting plan."
          subtitle="Keep your sport, positions, graduation year, recruiting path, and highlight film connected to the same private Scholar-Athlete record that powers recruiting."
        >
          <div style={heroActions}>
            <PlaybookButton href="/recruiting">Recruiting Command Center</PlaybookButton>
            <PlaybookButton href="/recruiting/timeline" variant="secondary">Recruiting Timeline</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={profilePanel} aria-labelledby="athlete-profile-heading">
          <div style={panelHeading}>
            <div>
              <PlaybookPill>Canonical athlete record</PlaybookPill>
              <h2 id="athlete-profile-heading" style={sectionTitle}>Recruiting profile</h2>
              <p style={muted}>Only information you save is treated as your record. Playbook does not infer measurements, statistics, eligibility, offers, or coach interest from this form.</p>
            </div>
            <span style={privateBadge}>Private · Scholar owned</span>
          </div>

          {error ? <div role="alert" style={errorState}><strong>Profile needs attention.</strong> {error}</div> : null}
          {message ? <div role="status" style={successState}>{message}</div> : null}

          <form onSubmit={saveProfile} style={formGrid}>
            <label style={field}>Sport<span style={required}>Required</span><input required value={sport} onChange={(event) => setSport(event.target.value)} style={input} placeholder="Basketball" /></label>
            <label style={field}>Primary position<input value={position} onChange={(event) => setPosition(event.target.value)} style={input} placeholder="Point Guard" /></label>
            <label style={field}>Secondary position<input value={secondaryPosition} onChange={(event) => setSecondaryPosition(event.target.value)} style={input} /></label>
            <label style={field}>Graduation year<span style={required}>Required</span><input required inputMode="numeric" pattern="[0-9]{4}" value={graduationYear} onChange={(event) => setGraduationYear(event.target.value)} style={input} placeholder="2028" /></label>
            <label style={field}>Governing path<select value={governingPath} onChange={(event) => setGoverningPath(event.target.value)} style={input}><option value="undecided">Undecided</option><option value="ncaa">NCAA</option><option value="naia">NAIA</option><option value="njcaa">NJCAA</option><option value="international">International</option><option value="other">Other</option></select></label>
            <label style={field}>Recruiting status<select value={recruitingStatus} onChange={(event) => setRecruitingStatus(event.target.value)} style={input}><option value="exploring">Exploring</option><option value="building_profile">Building profile</option><option value="actively_recruiting">Actively recruiting</option><option value="evaluating_offers">Evaluating offers</option><option value="committed">Committed</option><option value="closed">Closed</option></select></label>
            <label style={{ ...field, gridColumn: "1 / -1" }}>Highlight film URL<input type="url" value={highlightUrl} onChange={(event) => setHighlightUrl(event.target.value)} style={input} placeholder="https://…" /><span style={helper}>Use a link you control or intentionally share. A saved link is evidence you supplied—not verification of athletic performance.</span></label>
            <button disabled={saving} type="submit" style={primaryButton}>{saving ? "Saving athlete record…" : "Save athlete profile"}</button>
          </form>
        </section>

        <section style={truthPanel}>
          <div>
            <p style={eyebrow}>Evidence before inference</p>
            <h2 style={truthTitle}>Film belongs in the record. Claims still need evidence.</h2>
          </div>
          <p style={truthCopy}>This profile establishes the Scholar's declared athletic context and highlight-film reference. Measurements, verified statistics, formal eligibility findings, and recruiting outcomes should enter through their own governed evidence workflows rather than being guessed or blended into this record.</p>
        </section>
      </div>
    </PlaybookPage>
  );
}

const loadingState: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#52657B", fontWeight: 750 };
const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 };
const profilePanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "clamp(22px,4vw,36px)", background: "#FFFFFF", border: "1px solid #DDE6EF", borderRadius: "24px 6px 24px 6px", boxShadow: "0 16px 50px rgba(15,23,42,.06)" };
const panelHeading: React.CSSProperties = { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 18, alignItems: "start" };
const sectionTitle: React.CSSProperties = { margin: "12px 0 8px", color: "#102238", fontSize: "clamp(30px,4vw,44px)", lineHeight: 1.05 };
const muted: React.CSSProperties = { margin: 0, maxWidth: 720, color: "#61748A", lineHeight: 1.65 };
const privateBadge: React.CSSProperties = { color: "#52657B", fontSize: 12, fontWeight: 850 };
const errorState: React.CSSProperties = { marginTop: 20, padding: 16, borderRadius: 16, background: "#FFF5F4", border: "1px solid #F5B7B1", color: "#7F1D1D" };
const successState: React.CSSProperties = { marginTop: 20, padding: 16, borderRadius: 16, background: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534", fontWeight: 800 };
const formGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,280px),1fr))", gap: 16, marginTop: 26 };
const field: React.CSSProperties = { display: "grid", gap: 7, alignContent: "start", color: "#20364E", fontWeight: 800, fontSize: 13 };
const required: React.CSSProperties = { marginLeft: 8, color: "#A94422", fontSize: 10, textTransform: "uppercase", letterSpacing: ".08em" };
const input: React.CSSProperties = { minHeight: 44, borderRadius: 12, border: "1px solid #C7D4E0", padding: "10px 12px", font: "inherit", color: "#102238", background: "#FFFFFF" };
const helper: React.CSSProperties = { color: "#718399", fontWeight: 500, fontSize: 12, lineHeight: 1.5 };
const primaryButton: React.CSSProperties = { minHeight: 48, alignSelf: "end", border: 0, borderRadius: 999, padding: "0 20px", background: "#102238", color: "#FFFFFF", fontWeight: 900, cursor: "pointer" };
const truthPanel: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 0", padding: "clamp(24px,4vw,38px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 24, alignItems: "center", borderRadius: "30px 8px 30px 8px", color: "#F8FAFC", background: "linear-gradient(145deg,#06172D,#0B2648)" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#FF9D5C", fontWeight: 950, fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase" };
const truthTitle: React.CSSProperties = { margin: "9px 0 0", fontSize: "clamp(28px,4vw,44px)", lineHeight: 1.04 };
const truthCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.7 };
