"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";

type VerificationRequest = {
  id: string;
  school_district: string;
  school: string | null;
  official_email: string;
  administrator_title: string;
  administrative_scope: string[];
  status: "pending" | "under_review" | "approved" | "rejected";
  submitted_at: string;
  review_notes: string | null;
};

type LoadResult = { error?: string; onboardingCompleted?: boolean; request?: VerificationRequest | null };

export default function DistrictVerificationExperience() {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/district-verification", { cache: "no-store" })
      .then(async (response) => ({ response, result: await response.json() as LoadResult }))
      .then(({ response, result }) => {
        if (cancelled) return;
        if (!response.ok) {
          setMessage(result.error ?? "District verification could not be loaded.");
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
        setMessage(error instanceof Error ? error.message : "District verification could not be loaded.");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  async function reloadAfterMutation() {
    const response = await fetch("/api/district-verification", { cache: "no-store" });
    const result = await response.json() as LoadResult;
    if (!response.ok) {
      setMessage(result.error ?? "District verification could not be loaded.");
      return;
    }
    setOnboardingCompleted(Boolean(result.onboardingCompleted));
    setRequest(result.request ?? null);
  }

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    const response = await fetch("/api/district-verification", { method: "POST" });
    const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false);
    if (!response.ok) {
      setMessage(result.error ?? "District verification could not be submitted.");
      return;
    }
    setMessage(result.message ?? "District verification submitted.");
    await reloadAfterMutation();
  }

  if (loading) return <Surface title="Preparing District verification…" body="Checking your onboarding and administrative-scope evidence." />;
  if (!onboardingCompleted) return <Surface title="Complete District onboarding first" body="Finish the District / School Administrator onboarding questionnaire before submitting verification evidence."><PlaybookButton href="/start?first=1&role=district">Return to District onboarding</PlaybookButton></Surface>;
  if (!request) return <Surface title="Submit administrator verification" body="Playbook will submit your district, school/department, official institutional email, title, and requested scope. Submission creates no cohort or Scholar visibility." message={message}><button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>{submitting ? "Submitting…" : "Submit verification evidence"}</button></Surface>;

  const approved = request.status === "approved";
  const rejected = request.status === "rejected";
  return (
    <Surface
      title={rejected ? "Administrator verification needs attention" : approved ? "Administrator identity verification approved" : request.status === "under_review" ? "Administrator verification is under review" : "Administrator verification is pending"}
      body={approved
        ? "Your administrator identity evidence is approved. The requested administrative scope must still be separately authorized before cohort metrics, readiness data, or Scholar visibility can activate."
        : "You are in the correct District OS, but all cohort and Scholar capabilities remain locked until identity and administrative scope are both approved."}
      message={rejected ? request.review_notes : message}
    >
      <PlaybookCard eyebrow="Submitted evidence" title={request.administrator_title}>
        <p style={bodyStyle}>District: {request.school_district}</p>
        {request.school && <p style={bodyStyle}>School / department: {request.school}</p>}
        <p style={bodyStyle}>Official email: {request.official_email}</p>
        {request.administrative_scope?.length > 0 && <p style={bodyStyle}>Requested scope: {request.administrative_scope.join(", ")}</p>}
        <p style={metaStyle}>Status: {request.status.replaceAll("_", " ")} · Submitted {new Date(request.submitted_at).toLocaleDateString()}</p>
      </PlaybookCard>
    </Surface>
  );
}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="district-verification-gate"><p style={eyebrowStyle}>District OS · Independent verification</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/district-os</strong></div></section></PlaybookPage>;
}

const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 };
const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 };
const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 };
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
