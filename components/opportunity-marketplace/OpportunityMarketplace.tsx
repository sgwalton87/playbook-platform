"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

type OpportunityStatus = "RECOMMENDED" | "SAVED" | "DISMISSED";
type Match = {
  id: string;
  opportunityId: string;
  title: string;
  type: string;
  description: string;
  score: number;
  reasons: readonly string[];
  nextSteps: readonly string[];
  status: OpportunityStatus;
  deliveryState: "PENDING" | "DELIVERED";
};

type OpportunityResponse = { matches?: Match[]; match?: Match; error?: string };

async function responseJson(response: Response) {
  const body = await response.json() as OpportunityResponse;
  if (!response.ok) throw new Error(body.error ?? "The opportunity service could not complete this request.");
  return body;
}

function workspaceType(type: string) {
  const normalized = type.trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  const aliases: Record<string, string> = {
    fellowship: "career",
    program: "summer_program",
    entrepreneurship: "career",
    mentorship: "mentor",
    scholarship: "scholarship",
    internship: "internship",
    job: "job",
    competition: "competition",
    grant: "grant",
    volunteer: "volunteer",
    research: "research",
    college: "college",
    recruiting: "recruiting",
    nil: "nil",
  };
  return aliases[normalized] || "career";
}

function applicationHref(match: Match) {
  const query = new URLSearchParams({
    opportunityId: match.opportunityId,
    opportunityName: match.title,
    opportunityType: workspaceType(match.type),
  });
  return `/application-workspaces?${query.toString()}`;
}

export default function OpportunityMarketplace() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<"ACTIVE" | "SAVED" | "DISMISSED">("ACTIVE");
  const [busy, setBusy] = useState<string | null>("load");
  const [message, setMessage] = useState("Loading your opportunity matches.");

  useEffect(() => {
    let active = true;
    void fetch("/api/pbos/opportunities", { cache: "no-store" }).then(responseJson).then((body) => {
      if (!active) return;
      setMatches(body.matches ?? []);
      setMessage((body.matches ?? []).length ? "Opportunity matches loaded." : "No saved matches yet. Find matches to begin.");
    }).catch((error) => {
      if (active) setMessage(error instanceof Error ? error.message : "Opportunity loading failed.");
    }).finally(() => {
      if (active) setBusy(null);
    });
    return () => { active = false; };
  }, []);

  async function discover() {
    setBusy("discover");
    setMessage("PBOS is matching verified Scholar signals to opportunities.");
    try {
      const body = await responseJson(await fetch("/api/pbos/opportunities", { method: "POST" }));
      setMatches(body.matches ?? []);
      setFilter("ACTIVE");
      setMessage((body.matches ?? []).length ? "Explainable opportunity matches are ready." : "Add academic evidence or goals to unlock explainable matches.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Opportunity discovery failed.");
    } finally {
      setBusy(null);
    }
  }

  async function decide(match: Match, decision: "SAVED" | "DISMISSED") {
    setBusy(match.id);
    setMessage(decision === "SAVED" ? "Saving opportunity." : "Dismissing opportunity.");
    try {
      const body = await responseJson(await fetch("/api/pbos/opportunities", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          matchId: match.id,
          decision,
          requestId: `opportunity-${decision.toLowerCase()}-${match.id}`,
        }),
      }));
      const updated = body.match;
      if (updated) setMatches((current) => current.map((item) => item.id === updated.id ? updated : item));
      setMessage(decision === "SAVED" ? "Opportunity saved." : "Opportunity dismissed. You can restore it by saving it later.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Opportunity decision failed.");
    } finally {
      setBusy(null);
    }
  }

  const visible = useMemo(() => matches.filter((match) => filter === "ACTIVE" ? match.status !== "DISMISSED" : match.status === filter), [matches, filter]);
  const saved = matches.filter((match) => match.status === "SAVED").length;
  const active = matches.filter((match) => match.status !== "DISMISSED").length;
  const strongest = active ? Math.max(...matches.filter((match) => match.status !== "DISMISSED").map((match) => match.score)) : 0;

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Opportunity Marketplace" title="Find the opportunity. Then build the application." subtitle="Every match explains the verified Scholar signals behind it. Save opportunities privately, dismiss what is irrelevant, or move directly into a durable Application Workspace without entering the opportunity twice." />
      <PlaybookMetrics>
        <PlaybookMetric label="Active matches" value={String(active)} />
        <PlaybookMetric label="Saved" value={String(saved)} />
        <PlaybookMetric label="Strongest match" value={active ? `${strongest}%` : "—"} />
        <PlaybookMetric label="Application path" value="Connected" />
      </PlaybookMetrics>

      <section style={toolbar}>
        <button type="button" onClick={() => void discover()} disabled={busy !== null} style={primaryButton}>{busy === "discover" ? "Finding matches…" : "Find my matches"}</button>
        <Link href="/application-workspaces" style={secondaryLink}>Application Workspaces →</Link>
      </section>
      <p role="status" aria-live="polite" style={status}>{message}</p>

      <nav aria-label="Opportunity views" style={filters}>
        {(["ACTIVE", "SAVED", "DISMISSED"] as const).map((value) => (
          <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)} style={filter === value ? activeFilter : filterButton}>
            {value === "ACTIVE" ? "Recommended" : value[0] + value.slice(1).toLowerCase()}
          </button>
        ))}
      </nav>

      {busy === "load" ? (
        <PlaybookCard eyebrow="Opportunity Intelligence" title="Loading your matches"><p style={copy}>Connecting verified Scholar signals to available opportunity records…</p></PlaybookCard>
      ) : visible.length === 0 ? (
        <PlaybookCard eyebrow="Opportunity Intelligence" title="Nothing in this view yet"><p style={copy}>Choose “Find my matches” or add verified academic evidence and goals. Playbook will not invent recommendations to fill the screen.</p></PlaybookCard>
      ) : (
        <PlaybookGrid min={320}>
          {visible.map((match) => (
            <PlaybookCard key={match.id} eyebrow={match.type} title={match.title}>
              <div style={scoreRow}><PlaybookPill>{match.score}% match</PlaybookPill><PlaybookPill>{match.deliveryState === "DELIVERED" ? "PBOS connected" : "Delivery pending"}</PlaybookPill></div>
              <p style={copy}>{match.description}</p>
              <section aria-label={`Why ${match.title} matched`}>
                <h3 style={subheading}>Why this matched</h3>
                <ul style={list}>{match.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              </section>
              <section aria-label={`Next steps for ${match.title}`}>
                <h3 style={subheading}>Recommended next steps</h3>
                <ul style={list}>{match.nextSteps.map((step) => <li key={step}>{step}</li>)}</ul>
              </section>
              <div style={actions}>
                <Link href={applicationHref(match)} style={applyLink} aria-label={`Start application for ${match.title}`}>Start application →</Link>
                <button type="button" disabled={busy === match.id} aria-pressed={match.status === "SAVED"} onClick={() => void decide(match, "SAVED")} style={saveButton}>{match.status === "SAVED" ? "Saved ✓" : "Save"}</button>
                <button type="button" disabled={busy === match.id} onClick={() => void decide(match, "DISMISSED")} style={dismissButton}>Dismiss</button>
              </div>
            </PlaybookCard>
          ))}
        </PlaybookGrid>
      )}
    </PlaybookPage>
  );
}

const toolbar: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 12px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" };
const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", minHeight: 24, color: "#334155" };
const filters: React.CSSProperties = { maxWidth: 1180, margin: "16px auto 24px", display: "flex", flexWrap: "wrap", gap: 8 };
const baseButton: React.CSSProperties = { borderRadius: 999, padding: "10px 14px", fontWeight: 900, cursor: "pointer" };
const primaryButton: React.CSSProperties = { ...baseButton, border: 0, background: "#F97316", color: "#FFFFFF" };
const secondaryLink: React.CSSProperties = { ...baseButton, display: "inline-block", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", textDecoration: "none" };
const filterButton: React.CSSProperties = { ...baseButton, border: "1px solid #94A3B8", background: "#FFFFFF", color: "#0F172A" };
const activeFilter: React.CSSProperties = { ...filterButton, background: "#0F172A", color: "#FFFFFF", borderColor: "#0F172A" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const scoreRow: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 };
const subheading: React.CSSProperties = { color: "#0F172A", fontSize: 14, marginBottom: 6 };
const list: React.CSSProperties = { color: "#475569", lineHeight: 1.55, paddingLeft: 20 };
const actions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18, alignItems: "center" };
const applyLink: React.CSSProperties = { ...primaryButton, textDecoration: "none" };
const saveButton: React.CSSProperties = { ...baseButton, border: 0, background: "#047857", color: "#FFFFFF" };
const dismissButton: React.CSSProperties = { ...baseButton, border: "1px solid #64748B", background: "#FFFFFF", color: "#0F172A" };
