"use client";

import { useEffect, useState } from "react";
import { PlaybookButton, PlaybookCard, PlaybookPage } from "@/components/ui";

type Review = {
  id: string;
  destination_regions: string[];
  passport_readiness: string;
  eligibility_context: string;
  support_needs: string[];
  review_status: "pending" | "under_review" | "approved" | "rejected";
  jurisdiction_scope_status: "pending" | "approved" | "rejected";
  submitted_at: string;
  review_notes: string | null;
};

export default function AthleteAbroadReadinessGate({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function reload() {
    const response = await fetch("/api/athlete-abroad-readiness", { cache: "no-store" });
    const result = await response.json() as { error?: string; onboardingCompleted?: boolean; review?: Review | null };
    if (!response.ok) { setMessage(result.error ?? "Global readiness could not be loaded."); return; }
    setOnboardingCompleted(Boolean(result.onboardingCompleted));
    setReview(result.review ?? null);
    setMessage(null);
  }

  useEffect(() => {
    let active = true;
    void (async () => {
      const response = await fetch("/api/athlete-abroad-readiness", { cache: "no-store" });
      const result = await response.json() as { error?: string; onboardingCompleted?: boolean; review?: Review | null };
      if (!active) return;
      if (!response.ok) setMessage(result.error ?? "Global readiness could not be loaded.");
      else { setOnboardingCompleted(Boolean(result.onboardingCompleted)); setReview(result.review ?? null); }
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  async function submit() {
    setSubmitting(true); setMessage(null);
    const response = await fetch("/api/athlete-abroad-readiness", { method: "POST" });
    const result = await response.json() as { error?: string; message?: string };
    setSubmitting(false);
    if (!response.ok) { setMessage(result.error ?? "Global readiness could not be submitted."); return; }
    setMessage(result.message ?? "Global readiness submitted.");
    await reload();
  }

  if (loading) return <Surface title="Preparing global readiness…" body="Checking your Athlete Abroad pathway and international readiness evidence." />;
  if (!onboardingCompleted) return <Surface title="Complete Athlete Abroad onboarding first" body="Your Athlete Abroad record is self-owned. Complete the global pathway onboarding before activating jurisdiction-sensitive tools."><PlaybookButton href="/start?first=1&role=athlete-abroad">Return to onboarding</PlaybookButton></Surface>;
  if (!review) return <Surface title="Submit global readiness evidence" body="Your self-owned academic and athlete record remains yours. This review covers destination regions, passport readiness, eligibility context, and transition support needed before jurisdiction-sensitive global tools activate." message={message}><button onClick={() => void submit()} disabled={submitting} style={buttonStyle}>{submitting ? "Submitting…" : "Submit global readiness"}</button></Surface>;

  const ready = review.review_status === "approved" && review.jurisdiction_scope_status === "approved";
  if (ready) return <>{children}</>;

  const rejected = review.review_status === "rejected" || review.jurisdiction_scope_status === "rejected";
  return <Surface
    title={rejected ? "Global readiness needs attention" : "Global readiness is pending"}
    body="Your record remains available to you, but contract, tax, visa, eligibility, and jurisdiction-sensitive opportunity workflows stay locked until readiness and jurisdiction scope are approved."
    message={rejected ? review.review_notes : message}
  >
    <PlaybookCard eyebrow="Submitted global context" title={review.destination_regions.join(", ") || "Destinations pending"}>
      <p style={bodyStyle}>Passport: {review.passport_readiness}</p>
      <p style={bodyStyle}>Eligibility context: {review.eligibility_context}</p>
      <p style={metaStyle}>Readiness: {review.review_status.replaceAll("_", " ")} · Jurisdiction scope: {review.jurisdiction_scope_status.replaceAll("_", " ")}</p>
    </PlaybookCard>
  </Surface>;
}

function Surface({ title, body, message, children }: { title: string; body: string; message?: string | null; children?: React.ReactNode }) {
  return <PlaybookPage><section style={surfaceStyle} data-testid="athlete-abroad-readiness-gate"><p style={eyebrowStyle}>Athlete Abroad OS · Global readiness</p><h1 style={titleStyle}>{title}</h1><p style={bodyStyle}>{body}</p>{message && <div style={noticeStyle}>{message}</div>}<div style={{ marginTop: 22 }}>{children}</div><div style={routeStyle}>Canonical destination: <strong>/athlete-abroad-os</strong></div></section></PlaybookPage>;
}

const surfaceStyle: React.CSSProperties = { maxWidth: 900, margin: "40px auto", padding: "clamp(28px,5vw,52px)", borderRadius: 28, background: "#071A33", color: "#FFFFFF" };
const eyebrowStyle: React.CSSProperties = { margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: ".14em", textTransform: "uppercase", color: "#FF9A6C" };
const titleStyle: React.CSSProperties = { margin: "12px 0", fontSize: "clamp(34px,6vw,62px)", lineHeight: 1 };
const bodyStyle: React.CSSProperties = { color: "#C7D5E5", lineHeight: 1.65 };
const metaStyle: React.CSSProperties = { color: "#94A3B8", fontSize: 13 };
const noticeStyle: React.CSSProperties = { marginTop: 18, padding: 14, borderRadius: 14, background: "rgba(249,115,22,.12)", border: "1px solid rgba(255,154,108,.35)" };
const routeStyle: React.CSSProperties = { marginTop: 20, color: "#94A3B8", fontSize: 12 };
const buttonStyle: React.CSSProperties = { border: 0, borderRadius: 12, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "#F97316", color: "#FFFFFF" };
