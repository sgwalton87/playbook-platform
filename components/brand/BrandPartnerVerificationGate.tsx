"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";
import { brandAuthorityReady } from "@/lib/brand-verification/policy";
import BrandVerificationEvidenceUpload from "@/components/brand/BrandVerificationEvidenceUpload";

type VerificationRequest = {
  id: string;
  organization_name: string;
  brand_category: string | null;
  nil_acknowledgement: string;
  campaign_types: string[];
  campaign_scope_approved: boolean;
  compliance_scope_approved: boolean;
  status: "pending" | "under_review" | "approved" | "rejected";
  submitted_at: string;
  review_notes: string | null;
};
type LoadResult = { error?: string; onboardingCompleted?: boolean; request?: VerificationRequest | null };

export default function BrandPartnerVerificationGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasEvidence, setHasEvidence] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/brand-verification", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json() as LoadResult }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (!response.ok) { setMessage(result.error ?? "Brand verification could not be loaded."); setLoading(false); return; }
        setOnboardingCompleted(Boolean(result.onboardingCompleted)); setRequest(result.request ?? null); setMessage(null); setLoading(false);
      })
      .catch((error: unknown) => { if (!cancelled) { setMessage(error instanceof Error ? error.message : "Brand verification could not be loaded."); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  async function reloadAfterMutation() {
    const response = await fetch("/api/brand-verification", { cache: "no-store" }); const result = await response.json() as LoadResult;
    if (!response.ok) { setMessage(result.error ?? "Brand verification could not be loaded."); return; }
    setOnboardingCompleted(Boolean(result.onboardingCompleted)); setRequest(result.request ?? null);
  }
  async function submit() {
    setSubmitting(true); setMessage(null);
    const response = await fetch("/api/brand-verification", { method: "POST" }); const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false); if (!response.ok) { setMessage(result.error ?? "Brand verification could not be submitted."); return; }
    setMessage(result.message ?? "Brand verification submitted."); await reloadAfterMutation();
  }

  if (loading) return <Surface title="Preparing Brand Partner verification…" body="Checking organization, campaign, and compliance authority." />;
  if (!onboardingCompleted) return <Surface title="Complete Brand Partner onboarding first" body="Finish Brand Partner onboarding before organization and compliance evidence can be submitted."><PlaybookButton href="/start?first=1&role=brand-partner">Return to Brand Partner onboarding</PlaybookButton></Surface>;

  const approved = Boolean(request && brandAuthorityReady({ verificationStatus: request.status, hasApprovedCampaignScope: request.campaign_scope_approved, hasApprovedComplianceScope: request.compliance_scope_approved }));
  // The role workspace is not a privileged capability: backend authorization remains
  // responsible for every scoped campaign, applicant, publishing and NIL operation.
  // Do not hide the entire dashboard while independent approval is pending.
  if (approved) return <>{children}</>;
  return <>
    <section aria-label="Brand Partner verification status" role="status" style={noticeStyle}>
      <strong>Brand Partner verification {request?.status?.replaceAll("_", " ") ?? "not submitted"}</strong>
      <p>Organization and campaign approval are separate from dashboard access. Restricted operations remain unavailable until explicitly approved.</p>
      {message && <p>{message}</p>}
      <BrandVerificationEvidenceUpload onEvidenceChange={setHasEvidence} />
      {!request && <button onClick={() => void submit()} disabled={submitting || !hasEvidence} style={buttonStyle}>{submitting ? "Submitting…" : "Submit verification evidence"}</button>}
      {!hasEvidence && <p>Upload at least one supporting document before submitting verification.</p>}
      {request && <p>Campaign scope: {request.campaign_scope_approved ? "approved" : "pending"} · Compliance scope: {request.compliance_scope_approved ? "approved" : "pending"}</p>}
    </section>
    {children}
  </>;


}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="brand-verification-gate"><p style={eyebrowStyle}>Brand Partner OS · Independent verification</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/brand-partner-os</strong></div></section></PlaybookPage>;
}
const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 }; const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 }; const noticeStyle: React.CSSProperties = { margin: "14px auto 18px", maxWidth: 1180, padding: 18, borderRadius: 14, color: "#7C2D12", background: "#FFF7ED", border: "1px solid #FDBA74", lineHeight: 1.55 };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 }; const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
