"use client";

import { useEffect, useState } from "react";
import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
  PlaybookPill,
} from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

const pathways = [
  { label: "Opportunity", title: "Create a responsible pathway", body: "Publish internships, scholarships, events, work-based learning, or sponsored experiences with clear eligibility and support.", href: "/opportunities", action: "Open opportunities" },
  { label: "Scholar-Athlete", title: "Support NIL readiness responsibly", body: "Connect education, compliance, disclosure, deliverables, and payment readiness before activating a partnership.", href: "/scholar-athlete-os", action: "Review athlete journey" },
  { label: "Learning", title: "Sponsor useful education", body: "Support financial literacy, career readiness, wellness, leadership, and global-readiness learning paths.", href: "/courses", action: "Explore courses" },
  { label: "Applications", title: "Review permissioned participation", body: "Work with applications and verified evidence only after the scholar grants the appropriate authority.", href: "/application-workspaces", action: "Open workspaces" },
  { label: "Communication", title: "Coordinate with the right people", body: "Keep partner, scholar, guardian, and support-team decisions inside governed conversations.", href: "/messages", action: "Open messages" },
  { label: "Identity", title: "Complete the partner profile", body: "Maintain organization, category, goals, budget context, and compliance contacts before publishing activity.", href: "/profile", action: "Review profile" },
] as const;

export default function BrandPartnerOSPage() {
  return (
    <BrandPartnerVerificationGate>
      <BrandPartnerWorkspace />
    </BrandPartnerVerificationGate>
  );
}

function BrandPartnerWorkspace() {
  const [profile, setProfile] = useState<LegacyValue>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        setState("error");
        return;
      }
      const { data, error } = await supabase.from("profiles").select("*").eq("id", auth.user.id).maybeSingle();
      if (!active) return;
      setProfile(data);
      setState(error ? "error" : "ready");
    }
    void load();
    return () => { active = false; };
  }, []);

  const data = profile?.onboarding_data || {};
  const organization = data.organization_name || profile?.full_name || "Partner profile not completed";
  const goals = Array.isArray(data.partnership_goals) ? data.partnership_goals.length : 0;

  return (
    <PlaybookPage>
      <div data-testid="brand-partner-os" data-visual-canon="PGBP-001">
        <PlaybookHero
          eyebrow="Brand Partner OS"
          title="Power opportunity. Protect the scholar."
          subtitle="Build responsible campaigns, rewards, sponsorships, NIL education, internships, events, and learning pathways without turning student data into inventory."
        >
          <div style={heroActions}>
            <PlaybookButton href="/opportunities">Create an opportunity</PlaybookButton>
            <PlaybookButton href="/messages" variant="secondary">Open messages</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={identityRail} aria-live="polite">
          <div>
            <PlaybookPill>{state === "ready" ? "Verified partner context" : state === "loading" ? "Connecting partner context" : "Partner context unavailable"}</PlaybookPill>
            <h2 style={identityTitle}>{organization}</h2>
          </div>
          <p style={identityCopy}>{state === "error" ? "Your organization record could not be loaded. No partner or scholar data is being displayed." : "Organization identity, campaign scope, and compliance scope have passed the Brand Partner authority gate for this workspace."}</p>
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="Partner category" value={data.brand_category || "Not connected"} />
          <PlaybookMetric label="Declared goals" value={`${goals} selected`} />
          <PlaybookMetric label="Published opportunities" value="0 connected" />
          <PlaybookMetric label="Active campaigns" value="0 connected" />
        </PlaybookMetrics>

        <PlaybookGrid min={300}>
          {pathways.map((pathway) => (
            <PlaybookCard key={pathway.href} eyebrow={pathway.label} title={pathway.title}>
              <p style={body}>{pathway.body}</p>
              <PlaybookButton href={pathway.href}>{pathway.action}</PlaybookButton>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      </div>
    </PlaybookPage>
  );
}

const heroActions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 22 };
const identityRail: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: "22px clamp(20px,4vw,34px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, alignItems: "center", color: "#F8FAFC", background: "linear-gradient(115deg,#102A4A,#102238 60%,#2B1838)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "8px 30px 8px 30px" };
const identityTitle: React.CSSProperties = { margin: "12px 0 0", fontSize: "clamp(25px,4vw,38px)", lineHeight: 1.05 };
const identityCopy: React.CSSProperties = { margin: 0, color: "#C9D8E8", lineHeight: 1.65 };
const body: React.CSSProperties = { color: "#52657B", lineHeight: 1.65, margin: "0 0 20px" };
