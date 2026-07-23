"use client";

import { useCallback, useEffect, useState } from "react";
import AGTracker from "@/components/ag/AGTracker";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";
import { buildLearnerOSProjection, type LearnerOSRole, type LearnerProfile } from "@/lib/learner-os";
import { withTimeout } from "@/lib/async/withTimeout";
import { supabase } from "@/lib/supabaseClient";

const PREVIEW_PROFILES: Record<LearnerOSRole, LearnerProfile> = {
  scholar: { full_name: "Jordan Ellis", school: "Playbook Academy", grade: "11", graduation_year: "2027", dream_school: "University of California", onboarding_data: { gpa: "3.7", activities: ["Student leadership"], support_network: [{ email: "family@example.com" }, { email: "mentor@example.com" }] } },
  "scholar-athlete": { full_name: "Avery Brooks", school: "Playbook Academy", grade: "12", graduation_year: "2026", dream_school: "Target University", onboarding_data: { gpa: "3.5", primary_sport: "Basketball", position: "Guard", current_team: "Playbook Academy", target_division: "NCAA D2", highlight_link: "https://example.com/highlights", support_network: [{ email: "coach@example.com" }, { email: "family@example.com" }, { email: "mentor@example.com" }] } },
  "transition-youth": { full_name: "Morgan Reed", school: "Community Bridge Program", grade: "Transition-age youth", graduation_year: "Next 12 months", ideal_profession: "Healthcare", onboarding_data: { engagement_preferences: ["Internships", "Mentorship"], activities: ["Community service"], support_network: [{ email: "advocate@example.com" }, { email: "mentor@example.com" }] } },
  "athlete-abroad": { full_name: "Kai Thompson", school: "Playbook Academy", grade: "Post-grad", graduation_year: "Fall 2027", ideal_profession: "Professional athlete", onboarding_data: { primary_sport: "Soccer", target_countries: ["Spain", "Portugal"], abroad_pathway_goal: "University + sport", passport_status: "Valid passport", desired_start_window: "Fall 2027", international_readiness_needs: ["Housing", "Club vetting"], support_network: [{ email: "guardian@example.com" }, { email: "coach@example.com" }, { email: "advisor@example.com" }] } },
};

export default function LearnerOSDashboard({ role }: { role: LearnerOSRole }) {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");

  const load = useCallback(async () => {
    setState("loading");
    if (new URLSearchParams(window.location.search).get("preview") === "1") {
      setProfile(PREVIEW_PROFILES[role]);
      setState("ready");
      return;
    }
    const session = await withTimeout(
      supabase.auth.getSession().then(({ data }) => data.session),
      1_800,
    ).catch(() => null);

    if (!session?.user) {
      setState("signed-out");
      return;
    }

    const result = await withTimeout(
      supabase.from("profiles").select("*").eq("id", session.user.id).maybeSingle(),
      8_000,
      "Your learner record is taking too long to load.",
    ).catch(() => null);

    if (!result || result.error) {
      setState("error");
      return;
    }

    setProfile(result.data || {});
    setState("ready");
  }, [role]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (state === "loading") return <OSState title="Opening your Playbook…" body="Connecting your canonical learner record to this operating system." />;
  if (state === "signed-out") return <OSState title="Sign in to open your OS." body="Your role-specific dashboard is connected to your private Playbook record." href="/login" action="Sign in" />;
  if (state === "error") return <OSState title="Your record needs another moment." body="We could not load the learner record. Your data has not been changed." onRetry={load} />;

  const projection = buildLearnerOSProjection(role, profile || {});
  const { definition } = projection;
  return (
    <PlaybookPage>
      <PlaybookHero eyebrow={`${definition.label} · ${definition.accent}`} title={definition.headline} subtitle={definition.subtitle}>
        <div style={heroActions}>
          <PlaybookButton href="/compass">Open My Next Play</PlaybookButton>
          <PlaybookButton href="/record" variant="secondary">View My Record</PlaybookButton>
        </div>
      </PlaybookHero>

      <section style={welcomeRow}>
        <div>
          <p style={kicker}>Welcome back</p>
          <h2 style={welcomeTitle}>{projection.displayName}</h2>
          <p style={muted}>{projection.school} · {projection.grade}</p>
        </div>
        <div style={readinessBadge}>
          <strong>{projection.readiness}%</strong>
          <span>pathway ready</span>
        </div>
      </section>

      <PlaybookMetrics>
        <PlaybookMetric label="Profile Readiness" value={`${projection.readiness}%`} />
        <PlaybookMetric label="Support Network" value={`${projection.supportCount} of 5`} />
        <PlaybookMetric label="Graduation / Transition" value={projection.graduationYear} />
        <PlaybookMetric label="Primary Goal" value={projection.primaryGoal} />
      </PlaybookMetrics>

      <PlaybookGrid>
        {definition.modules.map((module) => (
          <PlaybookCard key={`${role}-${module.eyebrow}`} eyebrow={module.eyebrow} title={module.title}>
            <p style={body}>{module.body}</p>
            <PlaybookButton href={module.href}>{module.action}</PlaybookButton>
          </PlaybookCard>
        ))}
      </PlaybookGrid>

      <section style={trackerWrap}>
        <div style={sectionHeader}>
          <div>
            <p style={kicker}>Live Academic Foundation</p>
            <h2 style={sectionTitle}>Your A–G readiness remains connected.</h2>
          </div>
          <PlaybookButton href="/transcript">Update transcript</PlaybookButton>
        </div>
        <AGTracker />
      </section>

      <section style={networkCallout}>
        <div>
          <p style={kicker}>Starting Five · Support Network</p>
          <h2 style={sectionTitle}>One network. The right help at the right time.</h2>
          <p style={body}>Invite, review, and coordinate the trusted people connected to this learner-owned record.</p>
        </div>
        <PlaybookButton href="/support-network">Open Support Network</PlaybookButton>
      </section>
    </PlaybookPage>
  );
}

function OSState({ title, body: copy, href, action, onRetry }: { title: string; body: string; href?: string; action?: string; onRetry?: () => void }) {
  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Learner OS" title={title} subtitle={copy}>
        {href && <PlaybookButton href={href}>{action || "Continue"}</PlaybookButton>}
        {onRetry && <button type="button" style={retryButton} onClick={onRetry}>Try again</button>}
      </PlaybookHero>
    </PlaybookPage>
  );
}

const heroActions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 };
const welcomeRow: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", display: "flex", justifyContent: "space-between", gap: 20, alignItems: "center", flexWrap: "wrap", padding: "22px 24px", borderRadius: 24, background: "#FFFDF8", border: "1px solid #E2E8F0" };
const kicker: React.CSSProperties = { margin: 0, color: "#F97316", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const welcomeTitle: React.CSSProperties = { margin: "6px 0", color: "#0F172A", fontSize: "clamp(28px,4vw,42px)" };
const muted: React.CSSProperties = { margin: 0, color: "#64748B", fontWeight: 700 };
const readinessBadge: React.CSSProperties = { minWidth: 130, display: "grid", placeItems: "center", padding: 16, borderRadius: 18, background: "#0F172A", color: "#FFFFFF", textAlign: "center" };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.65 };
const trackerWrap: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 0", padding: 24, border: "1px solid #E2E8F0", borderRadius: 26, background: "#FFFFFF" };
const sectionHeader: React.CSSProperties = { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 18 };
const sectionTitle: React.CSSProperties = { margin: "7px 0", color: "#0F172A", fontSize: "clamp(25px,4vw,36px)" };
const networkCallout: React.CSSProperties = { maxWidth: 1180, margin: "18px auto 0", padding: 28, borderRadius: 26, background: "#FFF7ED", border: "1px solid #FED7AA", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20, flexWrap: "wrap" };
const retryButton: React.CSSProperties = { marginTop: 18, border: 0, borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "12px 18px", fontWeight: 900, cursor: "pointer" };
