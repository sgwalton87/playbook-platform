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

type PublishedOpportunity = {
  id: string;
  partner_id: string;
  organization_name: string;
  opportunity_type: "internship" | "job" | "sponsorship" | "nil" | "scholarship" | "mentorship";
  title: string;
  description: string;
  location: string | null;
  external_url: string | null;
  deadline: string | null;
  compensation_summary: string | null;
  eligibility: string[];
  requirements: string[];
  tags: string[];
  published_at: string;
};

type OpportunityResponse = { matches?: Match[]; match?: Match; error?: string };
type CatalogResponse = { opportunities?: PublishedOpportunity[]; error?: string };
type CatalogFilter = "all" | PublishedOpportunity["opportunity_type"];

async function responseJson(response: Response) {
  const body = await response.json() as OpportunityResponse;
  if (!response.ok) throw new Error(body.error ?? "The opportunity intelligence service could not complete this request.");
  return body;
}

async function catalogJson(response: Response) {
  const body = await response.json() as CatalogResponse;
  if (!response.ok) throw new Error(body.error ?? "Published Marketplace opportunities could not be loaded.");
  return body;
}

function workspaceType(type: string) {
  const normalized = type.trim().toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  const aliases: Record<string, string> = {
    mentorship: "mentor",
    scholarship: "scholarship",
    internship: "internship",
    job: "job",
    sponsorship: "career",
    nil: "nil",
  };
  return aliases[normalized] || "career";
}

function applicationHref(opportunity: PublishedOpportunity) {
  const query = new URLSearchParams({
    opportunityId: opportunity.id,
    opportunityName: opportunity.title,
    opportunityType: workspaceType(opportunity.opportunity_type),
  });
  if (opportunity.deadline) query.set("deadline", opportunity.deadline);
  return `/application-workspaces?${query.toString()}`;
}

function typeLabel(type: PublishedOpportunity["opportunity_type"]) {
  if (type === "nil") return "NIL Opportunity";
  return type[0].toUpperCase() + type.slice(1);
}

export default function OpportunityMarketplace() {
  const [catalog, setCatalog] = useState<PublishedOpportunity[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [catalogFilter, setCatalogFilter] = useState<CatalogFilter>("all");
  const [guidanceFilter, setGuidanceFilter] = useState<"ACTIVE" | "SAVED" | "DISMISSED">("ACTIVE");
  const [busy, setBusy] = useState<string | null>("load");
  const [catalogMessage, setCatalogMessage] = useState("Loading published Marketplace opportunities.");
  const [guidanceMessage, setGuidanceMessage] = useState("Loading PBOS readiness guidance.");

  useEffect(() => {
    let active = true;
    void Promise.all([
      fetch("/api/marketplace/opportunities", { cache: "no-store" }).then(catalogJson),
      fetch("/api/pbos/opportunities", { cache: "no-store" }).then(responseJson),
    ]).then(([catalogBody, guidanceBody]) => {
      if (!active) return;
      setCatalog(catalogBody.opportunities ?? []);
      setMatches(guidanceBody.matches ?? []);
      setCatalogMessage((catalogBody.opportunities ?? []).length ? "Published Marketplace opportunities loaded." : "No published Marketplace opportunities yet.");
      setGuidanceMessage((guidanceBody.matches ?? []).length ? "PBOS readiness guidance loaded." : "No saved readiness guidance yet.");
    }).catch((error) => {
      if (!active) return;
      const message = error instanceof Error ? error.message : "Opportunity loading failed.";
      setCatalogMessage(message); setGuidanceMessage(message);
    }).finally(() => { if (active) setBusy(null); });
    return () => { active = false; };
  }, []);

  async function discoverGuidance() {
    setBusy("discover");
    setGuidanceMessage("PBOS is evaluating verified Scholar signals for readiness guidance.");
    try {
      const body = await responseJson(await fetch("/api/pbos/opportunities", { method: "POST" }));
      setMatches(body.matches ?? []);
      setGuidanceFilter("ACTIVE");
      setGuidanceMessage((body.matches ?? []).length ? "Explainable readiness guidance is ready." : "Add academic evidence or goals to unlock explainable guidance.");
    } catch (error) {
      setGuidanceMessage(error instanceof Error ? error.message : "Opportunity readiness guidance failed.");
    } finally { setBusy(null); }
  }

  async function decide(match: Match, decision: "SAVED" | "DISMISSED") {
    setBusy(match.id);
    setGuidanceMessage(decision === "SAVED" ? "Saving readiness guidance." : "Dismissing readiness guidance.");
    try {
      const body = await responseJson(await fetch("/api/pbos/opportunities", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ matchId: match.id, decision, requestId: `opportunity-${decision.toLowerCase()}-${match.id}` }),
      }));
      const updated = body.match;
      if (updated) setMatches((current) => current.map((item) => item.id === updated.id ? updated : item));
      setGuidanceMessage(decision === "SAVED" ? "Readiness guidance saved." : "Readiness guidance dismissed.");
    } catch (error) {
      setGuidanceMessage(error instanceof Error ? error.message : "Readiness guidance decision failed.");
    } finally { setBusy(null); }
  }

  const visibleCatalog = useMemo(() => catalog.filter((item) => catalogFilter === "all" || item.opportunity_type === catalogFilter), [catalog, catalogFilter]);
  const visibleGuidance = useMemo(() => matches.filter((match) => guidanceFilter === "ACTIVE" ? match.status !== "DISMISSED" : match.status === guidanceFilter), [matches, guidanceFilter]);
  const savedGuidance = matches.filter((match) => match.status === "SAVED").length;
  const activeGuidance = matches.filter((match) => match.status !== "DISMISSED").length;

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Opportunity Marketplace" title="Real opportunities. Clear readiness guidance." subtitle="Browse human-reviewed Marketplace listings from verified organizations. Separately, use PBOS readiness guidance to understand pathways, strengths, gaps, and next steps. Playbook does not present AI/readiness templates as real opportunities." />
      <PlaybookMetrics>
        <PlaybookMetric label="Published listings" value={busy === "load" ? "…" : String(catalog.length)} />
        <PlaybookMetric label="Opportunity types" value={String(new Set(catalog.map((item) => item.opportunity_type)).size)} />
        <PlaybookMetric label="Readiness guidance" value={String(activeGuidance)} />
        <PlaybookMetric label="Saved guidance" value={String(savedGuidance)} />
      </PlaybookMetrics>

      <section style={truthPanel}>
        <PlaybookPill>Canonical opportunity catalog</PlaybookPill>
        <h2 style={truthTitle}>Published listings are facts. PBOS guidance is advisory.</h2>
        <p style={truthCopy}>A listing below has passed human publication review and can start an Application Workspace. Readiness guidance farther down the page is generated from Scholar signals and cannot be submitted as though it were a real scholarship, job, internship, sponsorship, NIL opportunity, or mentorship listing.</p>
      </section>

      <section aria-labelledby="published-opportunities-heading" style={section}>
        <div style={sectionHeader}><div><p style={eyebrow}>Published Marketplace</p><h2 id="published-opportunities-heading" style={heading}>Human-reviewed opportunities</h2></div><Link href="/application-workspaces" style={secondaryLink}>Application Workspaces →</Link></div>
        <p role="status" aria-live="polite" style={status}>{catalogMessage}</p>
        <nav aria-label="Marketplace listing types" style={filters}>
          {(["all","internship","job","sponsorship","nil","scholarship","mentorship"] as CatalogFilter[]).map((value) => <button key={value} type="button" aria-pressed={catalogFilter === value} onClick={() => setCatalogFilter(value)} style={catalogFilter === value ? activeFilter : filterButton}>{value === "all" ? "All listings" : value === "nil" ? "NIL" : value[0].toUpperCase() + value.slice(1)}</button>)}
        </nav>
        {busy === "load" ? <PlaybookCard eyebrow="Marketplace" title="Loading published opportunities"><p style={copy}>Connecting to the canonical Marketplace Opportunity Catalog…</p></PlaybookCard> : visibleCatalog.length === 0 ? <PlaybookCard eyebrow="Marketplace" title="No published listings in this view"><p style={copy}>Try another filter. Playbook does not fabricate opportunities to fill an empty state.</p></PlaybookCard> : <PlaybookGrid min={340}>{visibleCatalog.map((opportunity) => <PlaybookCard key={opportunity.id} eyebrow={`${opportunity.organization_name} · ${typeLabel(opportunity.opportunity_type)}`} title={opportunity.title}>
          <div style={pillRow}>{opportunity.deadline ? <PlaybookPill>Deadline {opportunity.deadline}</PlaybookPill> : <PlaybookPill>Open deadline</PlaybookPill>}{opportunity.location ? <PlaybookPill>{opportunity.location}</PlaybookPill> : null}</div>
          <p style={copy}>{opportunity.description}</p>
          {opportunity.compensation_summary ? <p style={copy}><strong>Compensation / award:</strong> {opportunity.compensation_summary}</p> : null}
          {opportunity.eligibility?.length ? <section><h3 style={subheading}>Eligibility</h3><ul style={list}>{opportunity.eligibility.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
          {opportunity.requirements?.length ? <section><h3 style={subheading}>Requirements</h3><ul style={list}>{opportunity.requirements.map((item) => <li key={item}>{item}</li>)}</ul></section> : null}
          <div style={actions}><Link href={applicationHref(opportunity)} style={applyLink}>Start Application Workspace →</Link>{opportunity.external_url ? <Link href={opportunity.external_url} target="_blank" rel="noreferrer" style={secondaryLink}>Official listing ↗</Link> : null}</div>
        </PlaybookCard>)}</PlaybookGrid>}
      </section>

      <section aria-labelledby="readiness-guidance-heading" style={guidanceSection}>
        <div style={sectionHeader}><div><p style={eyebrow}>PBOS Opportunity Intelligence</p><h2 id="readiness-guidance-heading" style={heading}>Readiness guidance</h2></div><button type="button" onClick={() => void discoverGuidance()} disabled={busy !== null} style={primaryButton}>{busy === "discover" ? "Analyzing…" : "Refresh my guidance"}</button></div>
        <p style={guidanceNotice}><strong>Not a real listing.</strong> These cards are derived readiness guidance based on authorized Scholar signals. They do not represent an employer, scholarship fund, sponsor, NIL deal, or mentorship opening.</p>
        <p role="status" aria-live="polite" style={status}>{guidanceMessage}</p>
        <nav aria-label="Readiness guidance views" style={filters}>{(["ACTIVE","SAVED","DISMISSED"] as const).map((value) => <button key={value} type="button" aria-pressed={guidanceFilter === value} onClick={() => setGuidanceFilter(value)} style={guidanceFilter === value ? activeFilter : filterButton}>{value === "ACTIVE" ? "Current" : value[0] + value.slice(1).toLowerCase()}</button>)}</nav>
        {visibleGuidance.length === 0 ? <PlaybookCard eyebrow="Readiness guidance" title="Nothing in this view yet"><p style={copy}>Use “Refresh my guidance” or strengthen your Scholar Record. Playbook will not invent recommendations to fill the screen.</p></PlaybookCard> : <PlaybookGrid min={320}>{visibleGuidance.map((match) => <PlaybookCard key={match.id} eyebrow={`Readiness guidance · ${match.type}`} title={match.title}>
          <div style={pillRow}><PlaybookPill>{match.score}% readiness alignment</PlaybookPill><PlaybookPill>Derived guidance</PlaybookPill></div>
          <p style={copy}>{match.description}</p>
          <section><h3 style={subheading}>Why this guidance appeared</h3><ul style={list}>{match.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul></section>
          <section><h3 style={subheading}>Suggested next steps</h3><ul style={list}>{match.nextSteps.map((step) => <li key={step}>{step}</li>)}</ul></section>
          <div style={actions}><button type="button" disabled={busy === match.id} aria-pressed={match.status === "SAVED"} onClick={() => void decide(match,"SAVED")} style={saveButton}>{match.status === "SAVED" ? "Saved ✓" : "Save guidance"}</button><button type="button" disabled={busy === match.id} onClick={() => void decide(match,"DISMISSED")} style={dismissButton}>Dismiss</button></div>
        </PlaybookCard>)}</PlaybookGrid>}
      </section>
    </PlaybookPage>
  );
}

const truthPanel: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 24px", padding: "clamp(20px,4vw,32px)", borderRadius: "8px 28px 8px 28px", background: "#081D34", color: "#FFF" };
const truthTitle: React.CSSProperties = { margin: "10px 0 8px", fontSize: "clamp(24px,4vw,34px)" };
const truthCopy: React.CSSProperties = { color: "#C9D8E8", lineHeight: 1.65 };
const section: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 34px" };
const guidanceSection: React.CSSProperties = { ...section, paddingTop: 26, borderTop: "1px solid #CBD5E1" };
const sectionHeader: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 14, flexWrap: "wrap" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#EA580C", textTransform: "uppercase", letterSpacing: ".1em", fontSize: 11, fontWeight: 900 };
const heading: React.CSSProperties = { margin: "5px 0 0", color: "#0F172A", fontSize: "clamp(25px,4vw,38px)" };
const status: React.CSSProperties = { minHeight: 24, color: "#334155" };
const filters: React.CSSProperties = { margin: "14px 0 20px", display: "flex", flexWrap: "wrap", gap: 8 };
const baseButton: React.CSSProperties = { borderRadius: 999, padding: "10px 14px", fontWeight: 900, cursor: "pointer" };
const primaryButton: React.CSSProperties = { ...baseButton, border: 0, background: "#F97316", color: "#FFFFFF" };
const secondaryLink: React.CSSProperties = { ...baseButton, display: "inline-flex", alignItems: "center", border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A", textDecoration: "none" };
const filterButton: React.CSSProperties = { ...baseButton, border: "1px solid #94A3B8", background: "#FFFFFF", color: "#0F172A" };
const activeFilter: React.CSSProperties = { ...filterButton, background: "#0F172A", color: "#FFFFFF", borderColor: "#0F172A" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const pillRow: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 };
const subheading: React.CSSProperties = { color: "#0F172A", fontSize: 14, marginBottom: 6 };
const list: React.CSSProperties = { color: "#475569", lineHeight: 1.55, paddingLeft: 20 };
const actions: React.CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8, marginTop: 18, alignItems: "center" };
const applyLink: React.CSSProperties = { ...primaryButton, display: "inline-flex", alignItems: "center", textDecoration: "none" };
const saveButton: React.CSSProperties = { ...baseButton, border: 0, background: "#047857", color: "#FFFFFF" };
const dismissButton: React.CSSProperties = { ...baseButton, border: "1px solid #64748B", background: "#FFFFFF", color: "#0F172A" };
const guidanceNotice: React.CSSProperties = { padding: 14, borderRadius: 12, background: "#FFF7ED", color: "#9A3412", lineHeight: 1.6 };
