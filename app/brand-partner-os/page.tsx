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
  { label: "Opportunity Listings", title: "Create real opportunities for human review", body: "Draft internships, jobs, sponsorships, NIL opportunities, scholarships, and mentorship listings. Publication requires independent Playbook operator review.", href: "/brand-partner-os/opportunities", action: "Manage opportunity listings" },
  { label: "Applicants", title: "View only Scholars who explicitly shared", body: "See the narrow applicant roster for your published opportunities only after each Scholar separately consents to Marketplace applicant sharing.", href: "/brand-partner-os/applicants", action: "Opportunity Applicants" },
  { label: "Scholar Marketplace", title: "See the Scholar-facing catalog", body: "Review the same published catalog Scholars see, separated clearly from PBOS readiness guidance.", href: "/opportunities", action: "Open Scholar Marketplace" },
  { label: "Communication", title: "Coordinate through governed services", body: "Publishing and applicant sharing do not automatically reveal private contact data or create an ungoverned outreach channel.", href: "/messages", action: "Open messages" },
] as const;

type Partner = { name: string; category: string; active: boolean };

type DashboardState = {
  partner: Partner | null;
  approvedTypes: number;
  campaignDrafts: number;
  opportunityReviewRequested: number;
  publishedOpportunities: number;
};

function firstPartner(value: unknown): Partner | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== "object") return null;
  return row as Partner;
}

export default function BrandPartnerOSPage() {
  return (
    <BrandPartnerVerificationGate>
      <BrandPartnerWorkspace />
    </BrandPartnerVerificationGate>
  );
}

function BrandPartnerWorkspace() {
  const [dashboard, setDashboard] = useState<DashboardState>({ partner: null, approvedTypes: 0, campaignDrafts: 0, opportunityReviewRequested: 0, publishedOpportunities: 0 });
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
      const partner = firstPartner(organization.data);
      if (organization.error || !partner) {
        setError(organization.error?.message || "Verified organization could not be resolved.");
        setState("error");
        return;
      }

      const [verification, campaigns, opportunities] = await Promise.all([
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
        supabase.rpc("get_own_marketplace_opportunities"),
      ]);
      if (!active) return;
      if (verification.error || campaigns.error || opportunities.error) {
        setError(verification.error?.message || campaigns.error?.message || opportunities.error?.message || "Marketplace data could not be loaded.");
        setState("error");
        return;
      }

      const approvedTypes = Array.isArray(verification.data?.campaign_types) ? verification.data.campaign_types.length : 0;
      const campaignRows = campaigns.data || [];
      const opportunityRows = (opportunities.data || []) as { status: string }[];
      setDashboard({
        partner,
        approvedTypes,
        campaignDrafts: campaignRows.filter((row) => row.status === "draft").length,
        opportunityReviewRequested: opportunityRows.filter((row) => row.status === "review_requested").length,
        publishedOpportunities: opportunityRows.filter((row) => row.status === "published").length,
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
          subtitle="Build responsible campaigns and real opportunities through governed publication and consent workflows without turning Scholar data into inventory."
        >
          <div style={heroActions}>
            <PlaybookButton href="/brand-partner-os/opportunities">Opportunity Listings</PlaybookButton>
            <PlaybookButton href="/brand-partner-os/applicants" variant="secondary">Opportunity Applicants</PlaybookButton>
            <PlaybookButton href="/brand-partner-os/campaigns" variant="secondary">Campaign Builder</PlaybookButton>
          </div>
        </PlaybookHero>

        <section style={identityRail} aria-live="polite">
          <div>
            <PlaybookPill>{state === "ready" ? "Verified operational partner" : state === "loading" ? "Connecting marketplace record" : "Marketplace record unavailable"}</PlaybookPill>
            <h2 style={identityTitle}>{organization}</h2>
          </div>
          <p style={identityCopy}>{state === "error" ? (error || "Your marketplace record could not be loaded. No Scholar data is being displayed.") : "Organization verification, campaign planning, opportunity publication, applicant consent, and consequential decisions remain separate governed records."}</p>
        </section>

        <PlaybookMetrics>
          <PlaybookMetric label="Partner category" value={dashboard.partner?.category || "Not resolved"} />
          <PlaybookMetric label="Campaign drafts" value={state === "loading" ? "…" : String(dashboard.campaignDrafts)} />
          <PlaybookMetric label="Listings in review" value={state === "loading" ? "…" : String(dashboard.opportunityReviewRequested)} />
          <PlaybookMetric label="Published opportunities" value={state === "loading" ? "…" : String(dashboard.publishedOpportunities)} />
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
