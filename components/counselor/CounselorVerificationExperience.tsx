"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";

type VerificationRequest = {
  id: string;
  school: string;
  school_district: string | null;
  official_email: string;
  counselor_scope: string[];
  status: "pending" | "under_review" | "approved" | "rejected";
  submitted_at: string;
  review_notes: string | null;
};

type LoadResult = { error?: string; onboardingCompleted?: boolean; request?: VerificationRequest | null };

export default function CounselorVerificationExperience() {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/counselor-verification", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json() as LoadResult }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (!response.ok) {
          setMessage(result.error ?? "Counselor verification could not be loaded.");
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
        setMessage(error instanceof Error ? error.message : "Counselor verification could not be loaded.");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function reloadAfterMutation() {
    const response = await fetch("/api/counselor-verification", { cache: "no-store" });
    const result = await response.json() as LoadResult;
    if (!response.ok) {
      setMessage(result.error ?? "Counselor verification could not be loaded.");
      return;
    }
    setOnboardingCompleted(Boolean(result.onboardingCompleted));
    setRequest(result.request ?? null);
  }

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    const response = await fetch("/api/counselor-verification", { method: "POST" });
    const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false);
    if (!response.ok) {
      setMessage(result.error ?? "Counselor verification could not be submitted.");
      return;
    }
    setMessage(result.message ?? "Counselor verification submitted.");
    await reloadAfterMutation();
  }

  if (loading) return <Surface title="Preparing Counselor verification…" body="Checking your onboarding and school-scope evidence." />;
  if (!onboardingCompleted) return <Surface title="Complete Counselor onboarding first" body="Finish the Counselor-specific onboarding questionnaire before submitting verification evidence."><PlaybookButton href="/start?first=1&role=high-school-counselor">Return to Counselor onboarding</PlaybookButton></Surface>;
  if (!request) return <Surface title="Submit Counselor verification" body="Playbook will submit your school, district, official email, and counseling scope. Submission grants no Scholar access or counseling authority." message={message}><button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>{submitting ? "Submitting…" : "Submit verification evidence"}</button></Surface>;

  const approved = request.status === "approved";
  const rejected = request.status === "rejected";
  return (
    <Surface
      title={rejected ? "Counselor verification needs attention" : approved ? "Counselor identity verification approved" : request.status === "under_review" ? "Counselor verification is under review" : "Counselor verification is pending"}
      body={approved
        ? "Your Counselor identity and school-scope evidence is approved. A separately governed Scholar relationship is still required before counseling access or Scholar data can activate."
        : "You are in the correct Counselor OS, but Scholar records and counseling capabilities remain locked until identity, school scope, and relationship authority are all proven."}
      message={rejected ? request.review_notes : message}
    >
      <PlaybookCard eyebrow="Submitted evidence" title={request.school}>
        <p style={bodyStyle}>Official email: {request.official_email}</p>
        {request.school_district && <p style={bodyStyle}>District: {request.school_district}</p>}
        {request.counselor_scope?.length > 0 && <p style={bodyStyle}>Scope: {request.counselor_scope.join(", ")}</p>}
        <p style={metaStyle}>Status: {request.status.replaceAll("_", " ")} · Submitted {new Date(request.submitted_at).toLocaleDateString()}</p>
      </PlaybookCard>
    </Surface>
  );
}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="counselor-verification-gate"><p style={eyebrowStyle}>Counselor OS · Independent verification</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/counselor-os</strong></div></section></PlaybookPage>;
}

const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 };
const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 };
const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 };
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
