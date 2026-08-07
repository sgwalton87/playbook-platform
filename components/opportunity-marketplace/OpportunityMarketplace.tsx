"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type OpportunityStatus = "RECOMMENDED" | "SAVED" | "DISMISSED";
type Match = { id: string; opportunityId: string; title: string; type: string; description: string; score: number;
  reasons: readonly string[]; nextSteps: readonly string[]; status: OpportunityStatus; deliveryState: "PENDING" | "DELIVERED" };

async function responseJson(response: Response) {
  const body = await response.json() as { matches?: Match[]; match?: Match; error?: string };
  if (!response.ok) throw new Error(body.error ?? "The opportunity service could not complete this request.");
  return body;
}

export default function OpportunityMarketplace() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [filter, setFilter] = useState<"ACTIVE" | "SAVED" | "DISMISSED">("ACTIVE");
  const [busy, setBusy] = useState<string | null>("load");
  const [message, setMessage] = useState("Loading your opportunity matches.");

  const load = useCallback(async () => {
    setBusy("load"); setMessage("Loading your opportunity matches.");
    try {
      const body = await responseJson(await fetch("/api/pbos/opportunities", { cache: "no-store" }));
      setMatches(body.matches ?? []); setMessage((body.matches ?? []).length ? "Opportunity matches loaded." : "No saved matches yet. Find matches to begin.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Opportunity loading failed."); }
    finally { setBusy(null); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function discover() {
    setBusy("discover"); setMessage("PBOS is matching verified Scholar signals to opportunities.");
    try {
      const body = await responseJson(await fetch("/api/pbos/opportunities", { method: "POST" }));
      setMatches(body.matches ?? []); setFilter("ACTIVE");
      setMessage((body.matches ?? []).length ? "Explainable opportunity matches are ready." : "Add academic evidence or goals to unlock explainable matches.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Opportunity discovery failed."); }
    finally { setBusy(null); }
  }

  async function decide(match: Match, decision: "SAVED" | "DISMISSED") {
    setBusy(match.id); setMessage(decision === "SAVED" ? "Saving opportunity." : "Dismissing opportunity.");
    try {
      const body = await responseJson(await fetch("/api/pbos/opportunities", { method: "PATCH",
        headers: { "content-type": "application/json" }, body: JSON.stringify({ matchId: match.id, decision,
          requestId: "opportunity-" + decision.toLowerCase() + "-" + match.id }) }));
      const updated = body.match;
      if (updated) setMatches(current => current.map(item => item.id === updated.id ? updated : item));
      setMessage(decision === "SAVED" ? "Opportunity saved." : "Opportunity dismissed. You can restore it by saving it later.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Opportunity decision failed."); }
    finally { setBusy(null); }
  }

  const visible = useMemo(() => matches.filter(match => filter === "ACTIVE" ? match.status !== "DISMISSED" : match.status === filter), [matches, filter]);
  return (
    <main style={{ background: "#F8F7F4", minHeight: "100vh", padding: "clamp(20px, 5vw, 48px)", fontFamily: "system-ui, sans-serif" }}>
      <section aria-labelledby="opportunity-heading" style={{ maxWidth: 1120, margin: "0 auto" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#64748B" }}>Opportunity Marketplace</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 20, alignItems: "end", marginBottom: 22 }}>
          <div><h1 id="opportunity-heading" style={{ fontSize: "clamp(30px, 6vw, 48px)", lineHeight: 1.05, color: "#0F172A", margin: 0 }}>Your explainable matches</h1>
            <p style={{ color: "#475569", maxWidth: 680, lineHeight: 1.65 }}>Matches use your verified Scholar evidence. Every recommendation explains why it appears, and save or dismiss choices remain private to your account.</p></div>
          <button type="button" onClick={() => void discover()} disabled={busy !== null}
            style={{ border: 0, borderRadius: 999, padding: "12px 18px", background: "#B45309", color: "white", fontWeight: 800, cursor: busy ? "wait" : "pointer" }}>
            {busy === "discover" ? "Finding matches…" : "Find my matches"}
          </button>
        </div>
        <p role="status" aria-live="polite" style={{ minHeight: 24, color: "#334155" }}>{message}</p>
        <nav aria-label="Opportunity views" style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "16px 0 24px" }}>
          {(["ACTIVE", "SAVED", "DISMISSED"] as const).map(value => <button key={value} type="button" aria-pressed={filter === value}
            onClick={() => setFilter(value)} style={{ border: "1px solid #94A3B8", borderRadius: 999, padding: "9px 14px",
              background: filter === value ? "#0F172A" : "white", color: filter === value ? "white" : "#0F172A", fontWeight: 700 }}>
            {value === "ACTIVE" ? "Recommended" : value[0] + value.slice(1).toLowerCase()}
          </button>)}
        </nav>
        {busy === "load" ? <div aria-busy="true" style={{ padding: 28, background: "white", borderRadius: 20 }}>Loading matches…</div> :
          visible.length === 0 ? <div style={{ padding: 28, background: "white", border: "1px dashed #94A3B8", borderRadius: 20 }}>
            <h2 style={{ marginTop: 0 }}>Nothing in this view yet</h2><p>Choose “Find my matches” or add verified academic evidence and goals.</p></div> :
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))", gap: 16 }}>
            {visible.map(match => <article key={match.id} aria-labelledby={"match-" + match.id}
              style={{ background: "white", border: "1px solid #CBD5E1", borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><div><p style={{ color: "#B45309", fontSize: 12, fontWeight: 900, textTransform: "uppercase" }}>{match.type}</p>
                <h2 id={"match-" + match.id} style={{ color: "#0F172A", fontSize: 21 }}>{match.title}</h2></div>
                <strong aria-label={match.score + " percent match"} style={{ color: "#0F172A", fontSize: 21 }}>{match.score}%</strong></div>
              <p style={{ color: "#475569", lineHeight: 1.55 }}>{match.description}</p>
              <h3 style={{ fontSize: 14 }}>Why this matched</h3><ul>{match.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>
              <h3 style={{ fontSize: 14 }}>Next steps</h3><ul>{match.nextSteps.map(step => <li key={step}>{step}</li>)}</ul>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <button type="button" disabled={busy === match.id} aria-pressed={match.status === "SAVED"}
                  onClick={() => void decide(match, "SAVED")} style={{ border: 0, borderRadius: 999, padding: "10px 14px", background: "#047857", color: "white", fontWeight: 800 }}>
                  {match.status === "SAVED" ? "Saved" : "Save"}</button>
                <button type="button" disabled={busy === match.id} onClick={() => void decide(match, "DISMISSED")}
                  style={{ border: "1px solid #64748B", borderRadius: 999, padding: "10px 14px", background: "white", color: "#0F172A", fontWeight: 800 }}>Dismiss</button>
              </div>
            </article>)}
          </div>}
      </section>
    </main>
  );
}
