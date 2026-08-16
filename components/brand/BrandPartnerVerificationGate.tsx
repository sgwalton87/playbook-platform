"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";
import { brandAuthorityReady } from "@/lib/brand-verification/policy";

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

  if (request && brandAuthorityReady({ verificationStatus: request.status, hasApprovedCampaignScope: request.campaign_scope_approved, hasApprovedComplianceScope: request.compliance_scope_approved })) {
    return <>{children}</>;
  }

  if (!request) return <Surface title="Submit Brand Partner verification" body="Verify organization identity, requested campaign types, and NIL/compliance acknowledgement before entering the Brand Partner workspace." message={message}><button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>{submitting ? "Submitting…" : "Submit verification evidence"}</button></Surface>;

  const rejected = request.status === "rejected";
  return <Surface
    title={rejected ? "Brand Partner verification needs attention" : request.status === "under_review" ? "Brand Partner verification is under review" : request.status === "approved" ? "Organization verified · scopes still pending" : "Brand Partner verification is pending"}
    body="The existing Brand Partner workspace remains preserved, but campaign creation, opportunities, scholar interactions, and NIL activity stay locked until organization identity, campaign scope, and compliance scope are all approved."
    message={rejected ? request.review_notes : message}>
    <PlaybookCard eyebrow="Submitted evidence" title={request.organization_name}>
      {request.brand_category && <p style={bodyStyle}>Category: {request.brand_category}</p>}
      <p style={bodyStyle}>Campaign scope: {request.campaign_scope_approved ? "approved" : "pending"}</p>
      <p style={bodyStyle}>Compliance scope: {request.compliance_scope_approved ? "approved" : "pending"}</p>
      <p style={metaStyle}>Status: {request.status.replaceAll("_", " ")} · Submitted {new Date(request.submitted_at).toLocaleDateString()}</p>
    </PlaybookCard>
  </Surface>;
}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="brand-verification-gate"><p style={eyebrowStyle}>Brand Partner OS · Independent verification</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/brand-partner-os</strong></div></section></PlaybookPage>;
}
const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 }; const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 }; const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 }; const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
