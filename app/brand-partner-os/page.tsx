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
  { label: "Organization", title: "Maintain the verified organization", body: "Keep marketplace-facing organization context connected to the approved Brand Partner identity without rewriting verification evidence.", href: "/brand-partner-os/organization", action: "Organization Profile" },
  { label: "Campaigns", title: "Build inside approved campaign scope", body: "Create and refine campaign drafts using only campaign types already present in approved verification evidence.", href: "/brand-partner-os/campaigns", action: "Campaign Builder" },
  { label: "Opportunity", title: "Create a responsible pathway", body: "Publish internships, scholarships, events, work-based learning, or sponsored experiences with clear eligibility and support through the shared Opportunity service.", href: "/opportunities", action: "Open opportunities" },
  { label: "Scholar-Athlete", title: "Support NIL readiness responsibly", body: "Connect education, compliance, disclosure, deliverables, and payment readiness before activating a partnership.", href: "/scholar-athlete-os", action: "Review athlete journey" },
  { label: "Applications", title: "Use permissioned application workflows", body: "Application workspaces remain Scholar-owned. Marketplace campaigns do not grant automatic applicant or Scholar Record access.", href: "/application-workspaces", action: "Open workspaces" },
  { label: "Communication", title: "Coordinate with the right people", body: "Keep partner, scholar, guardian, and support-team decisions inside governed conversations.", href: "/messages", action: "Open messages" },
] as const;

type Partner = { name: string; category: string; active: boolean };

type DashboardState = {
  partner: Partner | null;
  approvedTypes: number;
  drafts: number;
  reviewRequested: number;
};

export default function BrandPartnerOSPage() {
  return (
    <BrandPartnerVerificationGate>
      <BrandPartnerWorkspace />
    </BrandPartnerVerificationGate>
  );
}

function BrandPartnerWorkspace() {
  const [dashboard, setDashboard] = useState<DashboardState>({ partner: null, approvedTypes: 0, drafts: 0, reviewRequested: 0 });
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) { setError("Authentication required."); setState("error"); return; }

      const organization = await supabase.rpc("ensure_brand_partner_organization");
      if (!active) return;
      if (organization.error || !organization.data) {
        setError(organization.error?.message || "Verified organization could not be resolved.");
        setState("error");
        return;
      }

      const [verification, campaigns] = await Promise.all([
        supabase.from("brand_partner_verification_requests")
          .select("campaign_types")
          .eq("brand_user_id", auth.user.id)
          .eq("status", "approved")
          .eq("campaign_scope_approved", true)
          .eq("compliance_scope_approved", true)
          .order("reviewed_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase.from("brand_campaign_drafts")
          .select("status")
          .eq("brand_user_id", auth.user.id),
      ]);
      if (!active) return;
      if (verification.error || campaigns.error) {
        setError(verification.error?.message || campaigns.error?.message || "Marketplace data could not be loaded.");
        setState("error");
        return;
      }

      const partner = organization.data as Partner;
      const approvedTypes = Array.isArray(verification.data?.campaign_types) ? verification.data.campaign_types.length : 0;
      const rows = campaigns.data || [];
      setDashboard({
        partner,
        approvedTypes,
        drafts: rows.filter((row) => row.status === "draft").length,
        reviewRequested: rows.filter((row) => row.status === "review_requested").length,
      });
      setState("ready");
    }
    void load();
    return () => { active = false; };
  }, []);

  const organization = dashboard.partner?.name || "Verified organization not resolved";

  return (
    <PlaybookPage>
      <div data-testid="brand-partner-os" data-visual-canon="PGBP-001">
        <PlaybookHero
          eyebrow="Brand Partner OS"
          title="Power opportunity. Protect the scholar."
          subtitle="Build responsible campaigns, rewards, sponsorships, NIL education, internships, events, and learning pathways without turning student data into inventory."
        >
          <div style={heroActions}>
            <PlaybookButton href="/brand-partner-os/campaigns">Campaign Builder</PlaybookButton>
            <PlaybookButton href="/brand-partner-os/organization" variant="secondary">Organization Profile</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={identityRail} aria-live="polite">
          <div>
            <PlaybookPill>{state === "ready" ? "Verified operational partner" : state === "loading" ? "Connecting marketplace record" : "Marketplace record unavailable"}</PlaybookPill>
            <h2 style={identityTitle}>{organization}</h2>
          </div>
          <p style={identityCopy}>{state === "error" ? (error || "Your marketplace record could not be loaded. No scholar data is being displayed.") : "The operational Organization Profile is materialized from approved Brand Partner verification. Campaign and compliance approval remain separate evidence."}</p>
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="Partner category" value={dashboard.partner?.category || "Not resolved"} />
          <PlaybookMetric label="Approved campaign types" value={state === "loading" ? "…" : String(dashboard.approvedTypes)} />
          <PlaybookMetric label="Campaign drafts" value={state === "loading" ? "…" : String(dashboard.drafts)} />
          <PlaybookMetric label="Review requested" value={state === "loading" ? "…" : String(dashboard.reviewRequested)} />
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
