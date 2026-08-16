"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";

type VerificationRequest = {
  id: string;
  school: string;
  school_district: string | null;
  official_edu_email: string;
  subjects_taught: string[];
  existing_students_to_support: string | null;
  open_to_letters: string | null;
  support_focus: string[];
  status: "pending" | "under_review" | "approved" | "rejected";
  submitted_at: string;
  review_notes: string | null;
};

export default function EducatorVerificationExperience() {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/educator-verification", { cache: "no-store" });
    const result = await response.json() as { error?: string; onboardingCompleted?: boolean; request?: VerificationRequest | null };
    if (!response.ok) {
      setMessage(result.error ?? "Educator verification could not be loaded.");
      setLoading(false);
      return;
    }
    setOnboardingCompleted(Boolean(result.onboardingCompleted));
    setRequest(result.request ?? null);
    setMessage(null);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    const response = await fetch("/api/educator-verification", { method: "POST" });
    const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false);
    if (!response.ok) {
      setMessage(result.error ?? "Educator verification could not be submitted.");
      return;
    }
    setMessage(result.message ?? "Educator verification submitted.");
    await load();
  }

  if (loading) return <Surface title="Preparing Educator verification…" body="Checking your onboarding and school evidence." />;

  if (!onboardingCompleted) {
    return <Surface title="Complete Educator onboarding first" body="Finish the Educator-specific onboarding questionnaire before submitting school verification evidence."><PlaybookButton href="/start?first=1&role=educator">Return to Educator onboarding</PlaybookButton></Surface>;
  }

  if (!request) {
    return <Surface title="Submit Educator verification" body="Playbook will submit the school, district, official school email, subjects, and support preferences from your Educator onboarding. Submission creates no Scholar access, cohort access, verification power, or recommendation authority." message={message}><button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>{submitting ? "Submitting…" : "Submit verification evidence"}</button></Surface>;
  }

  const approvedIdentity = request.status === "approved";
  const rejected = request.status === "rejected";
  return (
    <Surface
      title={rejected ? "Educator verification needs attention" : approvedIdentity ? "Educator identity verification approved" : request.status === "under_review" ? "Educator verification is under review" : "Educator verification is pending"}
      body={approvedIdentity
        ? "Your Educator identity evidence is approved. A separately governed Scholar/institution relationship is still required before student records, evidence verification, recommendations, or cohort access can activate."
        : "You are in the correct Educator OS, but student records, verification, recommendation, and cohort capabilities remain locked until identity and relationship authority are both proven."}
      message={rejected ? request.review_notes : message}
    >
      <PlaybookCard eyebrow="Submitted evidence" title={request.school}>
        <p style={bodyStyle}>Official email: {request.official_edu_email}</p>
        {request.school_district && <p style={bodyStyle}>District: {request.school_district}</p>}
        {request.subjects_taught?.length > 0 && <p style={bodyStyle}>Subjects: {request.subjects_taught.join(", ")}</p>}
        <p style={metaStyle}>Status: {request.status.replaceAll("_", " ")} · Submitted {new Date(request.submitted_at).toLocaleDateString()}</p>
      </PlaybookCard>
    </Surface>
  );
}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="educator-verification-gate"><p style={eyebrowStyle}>Educator OS · Independent verification</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/educator-os</strong></div></section></PlaybookPage>;
}

const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 };
const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 };
const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 };
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
