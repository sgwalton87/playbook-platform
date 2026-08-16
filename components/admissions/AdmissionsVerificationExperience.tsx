"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";

type VerificationRequest = {
  id: string; college_name: string; department: string; admissions_region: string | null; official_edu_email: string;
  target_majors: string[]; student_populations: string[]; student_contact_preference: string | null;
  engagement_opportunities: string[]; status: "pending" | "under_review" | "approved" | "rejected";
  submitted_at: string; review_notes: string | null;
};
type LoadResult = { error?: string; onboardingCompleted?: boolean; request?: VerificationRequest | null };

export default function AdmissionsVerificationExperience() {
  const [loading, setLoading] = useState(true); const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null); const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/admissions-verification", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json() as LoadResult }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (!response.ok) { setMessage(result.error ?? "Admissions verification could not be loaded."); setLoading(false); return; }
        setOnboardingCompleted(Boolean(result.onboardingCompleted)); setRequest(result.request ?? null); setMessage(null); setLoading(false);
      })
      .catch((error: unknown) => { if (!cancelled) { setMessage(error instanceof Error ? error.message : "Admissions verification could not be loaded."); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  async function reloadAfterMutation() {
    const response = await fetch("/api/admissions-verification", { cache: "no-store" }); const result = await response.json() as LoadResult;
    if (!response.ok) { setMessage(result.error ?? "Admissions verification could not be loaded."); return; }
    setOnboardingCompleted(Boolean(result.onboardingCompleted)); setRequest(result.request ?? null);
  }
  async function submit() {
    setSubmitting(true); setMessage(null);
    const response = await fetch("/api/admissions-verification", { method: "POST" }); const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false); if (!response.ok) { setMessage(result.error ?? "Admissions verification could not be submitted."); return; }
    setMessage(result.message ?? "Admissions verification submitted."); await reloadAfterMutation();
  }

  if (loading) return <Surface title="Preparing Admissions verification…" body="Checking your institution and admissions-scope evidence." />;
  if (!onboardingCompleted) return <Surface title="Complete Admissions onboarding first" body="Finish the College Admissions onboarding questionnaire before submitting verification evidence."><PlaybookButton href="/start?first=1&role=college-admissions">Return to Admissions onboarding</PlaybookButton></Surface>;
  if (!request) return <Surface title="Submit Admissions verification" body="Playbook will submit your institution, department, official email, territory, criteria, populations, and engagement preferences. Submission creates no Scholar search or application access." message={message}><button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>{submitting ? "Submitting…" : "Submit verification evidence"}</button></Surface>;

  const approved = request.status === "approved"; const rejected = request.status === "rejected";
  return <Surface title={rejected ? "Admissions verification needs attention" : approved ? "Admissions identity verification approved" : request.status === "under_review" ? "Admissions verification is under review" : "Admissions verification is pending"}
    body={approved ? "Your institutional identity evidence is approved. Admissions territory, search, contact, and engagement scope must still be separately authorized before Scholar access can activate." : "You are in the correct Admissions OS, but Scholar search, application data, and outreach remain locked until identity and scope are approved."}
    message={rejected ? request.review_notes : message}>
    <PlaybookCard eyebrow="Submitted evidence" title={request.college_name}>
      <p style={bodyStyle}>Department: {request.department}</p><p style={bodyStyle}>Official email: {request.official_edu_email}</p>
      {request.admissions_region && <p style={bodyStyle}>Territory: {request.admissions_region}</p>}
      <p style={metaStyle}>Status: {request.status.replaceAll("_", " ")} · Submitted {new Date(request.submitted_at).toLocaleDateString()}</p>
    </PlaybookCard>
  </Surface>;
}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="admissions-verification-gate"><p style={eyebrowStyle}>Admissions OS · Independent verification</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/admissions-os</strong></div></section></PlaybookPage>;
}
const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 }; const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 }; const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 }; const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
