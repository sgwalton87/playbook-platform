"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";

type VerificationRequest = {
  id: string;
  college_name: string;
  conference: string | null;
  division_level: string | null;
  official_edu_email: string;
  primary_sport_recruiting: string;
  positions_recruiting: string | null;
  recruiting_radius: string[];
  graduation_classes_recruiting: string[];
  preferred_recruiting_contact: string | null;
  authorization_status: string | null;
  status: "pending" | "under_review" | "approved" | "rejected";
  submitted_at: string;
  review_notes: string | null;
};

type LoadResult = { error?: string; onboardingCompleted?: boolean; request?: VerificationRequest | null };

export default function RecruitingVerificationExperience() {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/recruiting-verification", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json() as LoadResult }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (!response.ok) {
          setMessage(result.error ?? "Recruiting verification could not be loaded.");
          setLoading(false);
          return;
        }
        setOnboardingCompleted(Boolean(result.onboardingCompleted));
        setRequest(result.request ?? null);
        setMessage(null);
        setLoading(false);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setMessage(error instanceof Error ? error.message : "Recruiting verification could not be loaded.");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function reloadAfterMutation() {
    const response = await fetch("/api/recruiting-verification", { cache: "no-store" });
    const result = await response.json() as LoadResult;
    if (!response.ok) { setMessage(result.error ?? "Recruiting verification could not be loaded."); return; }
    setOnboardingCompleted(Boolean(result.onboardingCompleted));
    setRequest(result.request ?? null);
  }

  async function submit() {
    setSubmitting(true); setMessage(null);
    const response = await fetch("/api/recruiting-verification", { method: "POST" });
    const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false);
    if (!response.ok) { setMessage(result.error ?? "Recruiting verification could not be submitted."); return; }
    setMessage(result.message ?? "Recruiting verification submitted.");
    await reloadAfterMutation();
  }

  if (loading) return <Surface title="Preparing Recruiting verification…" body="Checking your institutional and recruiting-scope evidence." />;
  if (!onboardingCompleted) return <Surface title="Complete Recruiting onboarding first" body="Finish the College Coach / Recruiter onboarding questionnaire before submitting verification evidence."><PlaybookButton href="/start?first=1&role=college-coach">Return to Recruiting onboarding</PlaybookButton></Surface>;
  if (!request) return <Surface title="Submit Recruiting verification" body="Playbook will submit your institution, official email, sport, recruiting radius, graduation classes, and authorization context. Submission creates no athlete visibility or outreach authority." message={message}><button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>{submitting ? "Submitting…" : "Submit verification evidence"}</button></Surface>;

  const approved = request.status === "approved";
  const rejected = request.status === "rejected";
  return <Surface
    title={rejected ? "Recruiting verification needs attention" : approved ? "Recruiting identity verification approved" : request.status === "under_review" ? "Recruiting verification is under review" : "Recruiting verification is pending"}
    body={approved ? "Your institutional identity evidence is approved. Recruiting scope must still be separately authorized before athlete discovery, verified-record access, or outreach can activate." : "You are in the correct Recruiting OS, but athlete discovery and recruiting capabilities remain locked until identity and scope are both approved."}
    message={rejected ? request.review_notes : message}
  >
    <PlaybookCard eyebrow="Submitted evidence" title={request.college_name}>
      <p style={bodyStyle}>Official email: {request.official_edu_email}</p>
      <p style={bodyStyle}>Sport: {request.primary_sport_recruiting}</p>
      {request.division_level && <p style={bodyStyle}>Division: {request.division_level}</p>}
      {request.recruiting_radius?.length > 0 && <p style={bodyStyle}>Radius: {request.recruiting_radius.join(", ")}</p>}
      <p style={metaStyle}>Status: {request.status.replaceAll("_", " ")} · Submitted {new Date(request.submitted_at).toLocaleDateString()}</p>
    </PlaybookCard>
  </Surface>;
}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="recruiting-verification-gate"><p style={eyebrowStyle}>Recruiting OS · Independent verification</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/recruiting-os</strong></div></section></PlaybookPage>;
}

const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 };
const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 };
const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 };
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
