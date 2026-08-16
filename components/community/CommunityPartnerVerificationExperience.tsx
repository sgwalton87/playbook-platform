"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";

type VerificationRequest = {
  id: string;
  organization_name: string;
  organization_type: string;
  official_email: string;
  organization_website: string | null;
  community_services: string[];
  service_area: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  service_scope_status: "pending" | "approved" | "rejected";
  submitted_at: string;
  review_notes: string | null;
};

export default function CommunityPartnerVerificationExperience() {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function reload() {
    const response = await fetch("/api/community-partner-verification", { cache: "no-store" });
    const result = await response.json() as { error?: string; onboardingCompleted?: boolean; request?: VerificationRequest | null };
    if (!response.ok) { setMessage(result.error ?? "Verification could not be loaded."); return; }
    setOnboardingCompleted(Boolean(result.onboardingCompleted));
    setRequest(result.request ?? null);
    setMessage(null);
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await fetch("/api/community-partner-verification", { cache: "no-store" });
      const result = await response.json() as { error?: string; onboardingCompleted?: boolean; request?: VerificationRequest | null };
      if (!active) return;
      if (!response.ok) setMessage(result.error ?? "Verification could not be loaded.");
      else { setOnboardingCompleted(Boolean(result.onboardingCompleted)); setRequest(result.request ?? null); }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  async function submit() {
    setSubmitting(true); setMessage(null);
    const response = await fetch("/api/community-partner-verification", { method: "POST" });
    const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false);
    if (!response.ok) { setMessage(result.error ?? "Verification could not be submitted."); return; }
    setMessage(result.message ?? "Verification submitted.");
    await reload();
  }

  if (loading) return <Surface title="Preparing Community Partner verification…" body="Checking your organization and service-area evidence." />;
  if (!onboardingCompleted) return <Surface title="Complete Community Partner onboarding first" body="Finish the Community Partner organization profile before submitting authority evidence."><PlaybookButton href="/start?first=1&role=other">Return to onboarding</PlaybookButton></Surface>;
  if (!request) return <Surface title="Submit Community Partner verification" body="Playbook will submit your organization identity, official email, services, and geographic service area. Submission creates no Scholar access or support relationship." message={message}><button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>{submitting ? "Submitting…" : "Submit verification evidence"}</button></Surface>;

  const identityApproved = request.status === "approved";
  const scopeApproved = request.service_scope_status === "approved";
  const rejected = request.status === "rejected" || request.service_scope_status === "rejected";
  return <Surface
    title={rejected ? "Community Partner verification needs attention" : identityApproved && scopeApproved ? "Organization and service scope approved" : "Community Partner verification is pending"}
    body={identityApproved && scopeApproved
      ? "Your organization and service scope are approved. Scholar-specific access still requires a separately governed relationship or invitation for the exact Scholar and purpose."
      : "You are in the correct Community Partner OS, but Scholar records, support actions, referrals, and service delivery remain locked until organization identity and service scope are approved."}
    message={rejected ? request.review_notes : message}
  >
    <PlaybookCard eyebrow="Submitted evidence" title={request.organization_name}>
      <p style={bodyStyle}>{request.organization_type} · {request.service_area}</p>
      <p style={bodyStyle}>Official email: {request.official_email}</p>
      {request.community_services?.length > 0 && <p style={bodyStyle}>Services: {request.community_services.join(", ")}</p>}
      <p style={metaStyle}>Identity: {request.status.replaceAll("_", " ")} · Service scope: {request.service_scope_status.replaceAll("_", " ")}</p>
    </PlaybookCard>
  </Surface>;
}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="community-partner-verification-gate"><p style={eyebrowStyle}>Community Partner OS · Independent verification</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/community-partner-os</strong></div></section></PlaybookPage>;
}

const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 };
const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 };
const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 };
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
