"use client";

import { useEffect, useState } from "react";
import RoleDashboardExperience from "@/components/role-os/dashboards/RoleDashboardExperience";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";

type VerificationRequest = {
  id: string;
  school: string;
  school_city: string | null;
  school_state: string | null;
  official_school_email: string;
  primary_sport: string;
  coach_role: string;
  years_coaching: string | null;
  roster_size: string | null;
  status: "pending" | "under_review" | "approved" | "rejected";
  submitted_at: string;
  reviewed_at: string | null;
  review_notes: string | null;
};

type LoadState = "loading" | "ready" | "error";

export default function CoachVerificationExperience() {
  const [state, setState] = useState<LoadState>("loading");
  const [request, setRequest] = useState<VerificationRequest | null>(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setState("loading");
    const response = await fetch("/api/coach-verification", { cache: "no-store" });
    const result = await response.json() as {
      error?: string;
      onboardingCompleted?: boolean;
      request?: VerificationRequest | null;
    };
    if (!response.ok) {
      setMessage(result.error ?? "Coach verification could not be loaded.");
      setState("error");
      return;
    }
    setOnboardingCompleted(Boolean(result.onboardingCompleted));
    setRequest(result.request ?? null);
    setMessage(null);
    setState("ready");
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit() {
    setSubmitting(true);
    setMessage(null);
    const response = await fetch("/api/coach-verification", { method: "POST" });
    const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false);
    if (!response.ok) {
      setMessage(result.error ?? "Coach verification could not be submitted.");
      return;
    }
    setMessage(result.message ?? "Coach verification submitted.");
    await load();
  }

  if (state === "loading") {
    return <CoachSurface title="Preparing Coach verification…" body="Checking your onboarding and institutional evidence." />;
  }

  if (state === "error") {
    return <CoachSurface title="Coach verification cannot be loaded" body="Playbook is keeping Coach authority fail-closed." message={message} />;
  }

  if (!onboardingCompleted) {
    return (
      <CoachSurface
        title="Complete Coach onboarding first"
        body="Your Coach OS is independent. Finish the Coach-specific onboarding questionnaire before submitting institutional verification evidence."
      >
        <PlaybookButton href="/start?first=1&role=coach">Return to Coach onboarding</PlaybookButton>
      </CoachSurface>
    );
  }

  if (!request) {
    return (
      <CoachSurface
        title="Submit Coach verification"
        body="Playbook will submit the school, official school email, sport, coaching role, experience, roster, and athlete-support evidence from your Coach onboarding. Submission does not create Scholar access and does not authorize Mentor validation."
        message={message}
      >
        <button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>
          {submitting ? "Submitting…" : "Submit verification evidence"}
        </button>
      </CoachSurface>
    );
  }

  if (request.status === "approved") {
    // Approval evidence alone is not enough to create a Scholar relationship.
    // Until the separate athlete/Scholar relationship contract is certified,
    // keep the Coach OS restricted instead of treating approval as access.
    return (
      <CoachSurface
        title="Identity verification approved"
        body="Your coaching identity evidence is approved. Scholar/athlete relationship authority is still required before Coach permissions or Mentor-validation authority can activate."
      >
        <Evidence request={request} />
      </CoachSurface>
    );
  }

  if (request.status === "rejected") {
    return (
      <CoachSurface
        title="Coach verification needs attention"
        body="No Coach authority is active. Review the evidence and follow the verification guidance before resubmitting."
        message={request.review_notes}
      >
        <Evidence request={request} />
      </CoachSurface>
    );
  }

  return (
    <CoachSurface
      title={request.status === "under_review" ? "Coach verification is under review" : "Coach verification is pending"}
      body="You are in the correct Coach OS, but Scholar data, roster access, Coach permissions, and Mentor-validation authority remain locked until both identity verification and a governed Scholar/athlete relationship are proven."
      message={message}
    >
      <Evidence request={request} />
    </CoachSurface>
  );
}

function Evidence({ request }: { request: VerificationRequest }) {
  return (
    <PlaybookCard eyebrow="Submitted evidence" title={`${request.coach_role} · ${request.primary_sport}`}>
      <p style={bodyStyle}>{request.school}{request.school_city ? ` · ${request.school_city}` : ""}{request.school_state ? `, ${request.school_state}` : ""}</p>
      <p style={bodyStyle}>Official email: {request.official_school_email}</p>
      {request.years_coaching && <p style={bodyStyle}>Experience: {request.years_coaching}</p>}
      {request.roster_size && <p style={bodyStyle}>Roster: {request.roster_size}</p>}
      <p style={metaStyle}>Status: {request.status.replaceAll("_", " ")} · Submitted {new Date(request.submitted_at).toLocaleDateString()}</p>
    </PlaybookCard>
  );
}

function CoachSurface({
  title,
  body,
  message,
  children,
}: {
  title: string;
  body: string;
  message?: string | null;
  children?: React.ReactNode;
}) {
  return (
    <PlaybookPage>
      <section style={surfaceStyle} data-testid="coach-verification-gate">
        <p style={eyebrowStyle}>Coach OS · Independent verification</p>
        <h1 style={titleStyle}>{title}</h1>
        <p style={bodyStyle}>{body}</p>
        {message && <div style={noticeStyle}>{message}</div>}
        <div style={{ marginTop: 22 }}>{children}</div>
        <div style={routeStyle}>Canonical destination: <strong>/coach-os</strong></div>
      </section>
    </PlaybookPage>
  );
}

const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 };
const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 };
const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 };
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
