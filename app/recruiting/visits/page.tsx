"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlaybookButton, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui/PlaybookPage";
import { supabase } from "@/lib/supabaseClient";

type Target = { id: string; school_name: string; athletic_program: string | null };
type VisitKind = "official" | "unofficial" | "camp_showcase" | "game_event" | "virtual" | "other";
type VisitStatus = "planned" | "confirmed" | "completed" | "cancelled";
type Visit = {
  id: string;
  recruiting_target_id: string;
  visit_kind: VisitKind;
  status: VisitStatus;
  scheduled_start: string;
  scheduled_end: string | null;
  location: string | null;
  notes: string | null;
  recruiting_targets: { school_name: string; athletic_program: string | null } | null;
};

const kinds: VisitKind[] = ["official", "unofficial", "camp_showcase", "game_event", "virtual", "other"];
const statuses: VisitStatus[] = ["planned", "confirmed", "completed", "cancelled"];

export default function RecruitingVisitsPage() {
  const router = useRouter();
  const [ownerId, setOwnerId] = useState("");
  const [targets, setTargets] = useState<Target[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [targetId, setTargetId] = useState("");
  const [kind, setKind] = useState<VisitKind>("unofficial");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function loadWorkspace(userId: string) {
    const [targetResult, visitResult] = await Promise.all([
      supabase.from("recruiting_targets").select("id,school_name,athletic_program").eq("scholar_id", userId).order("school_name"),
      supabase.from("recruiting_visits").select("id,recruiting_target_id,visit_kind,status,scheduled_start,scheduled_end,location,notes,recruiting_targets(school_name,athletic_program)").eq("scholar_id", userId).order("scheduled_start", { ascending: false }),
    ]);
    const firstError = targetResult.error || visitResult.error;
    if (firstError) throw firstError;
    const loadedTargets = (targetResult.data || []) as Target[];
    setTargets(loadedTargets);
    setVisits((visitResult.data || []) as unknown as Visit[]);
    setTargetId((current) => current || loadedTargets[0]?.id || "");
  }

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) {
        router.replace("/login?next=/recruiting/visits");
        return;
      }
      setOwnerId(auth.user.id);
      try {
        await loadWorkspace(auth.user.id);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Recruiting visits could not be loaded.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [router]);

  async function addVisit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ownerId || !targetId || !start) return;
    if (end && new Date(end).getTime() < new Date(start).getTime()) {
      setError("Visit end cannot be before the start.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    const { error: insertError } = await supabase.from("recruiting_visits").insert({
      scholar_id: ownerId,
      recruiting_target_id: targetId,
      visit_kind: kind,
      status: "planned",
      scheduled_start: new Date(start).toISOString(),
      scheduled_end: end ? new Date(end).toISOString() : null,
      location: location.trim() || null,
      notes: notes.trim() || null,
      provenance: { entry_surface: "recruiting/visits" },
    });
    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }
    try {
      await loadWorkspace(ownerId);
      setStart(""); setEnd(""); setLocation(""); setNotes("");
      setMessage("Recruiting visit added to your private recruiting record and timeline.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Visit saved, but the workspace could not refresh.");
    } finally { setSaving(false); }
  }

  async function updateVisitStatus(visitId: string, status: VisitStatus) {
    if (!ownerId) return;
    setSaving(true); setError(""); setMessage("");
    const { error: updateError } = await supabase.from("recruiting_visits").update({ status }).eq("id", visitId).eq("scholar_id", ownerId);
    if (updateError) {
      setError(updateError.message); setSaving(false); return;
    }
    setVisits((current) => current.map((visit) => visit.id === visitId ? { ...visit, status } : visit));
    setMessage("Visit status updated and preserved in recruiting history.");
    setSaving(false);
  }

  if (loading) return <PlaybookPage><div style={state}>Connecting your recruiting visits…</div></PlaybookPage>;

  const upcoming = visits.filter((visit) => visit.status === "planned" || visit.status === "confirmed").length;
  const completed = visits.filter((visit) => visit.status === "completed").length;

  return (
    <PlaybookPage>
      <div data-testid="recruiting-visits" data-visual-canon="PGRV-001">
        <PlaybookHero eyebrow="Recruiting Visits" title="Plan the visit. Preserve what actually happened." subtitle="Visits are tied to real schools in your recruiting pipeline. Scheduling a visit does not imply coach interest, an offer, admissions status, or eligibility." >
          <div style={actions}><PlaybookButton href="/recruiting">Recruiting Command Center</PlaybookButton><PlaybookButton href="/recruiting/timeline" variant="secondary">Recruiting Timeline</PlaybookButton><PlaybookButton href="/recruiting/offers" variant="secondary">Offers</PlaybookButton></div>
        </PlaybookHero>
        {error ? <div role="alert" style={errorBox}>{error}</div> : null}
        {message ? <div role="status" style={successBox}>{message}</div> : null}
        <PlaybookMetrics><PlaybookMetric label="Visits recorded" value={String(visits.length)} /><PlaybookMetric label="Upcoming" value={String(upcoming)} /><PlaybookMetric label="Completed" value={String(completed)} /><PlaybookMetric label="Targets available" value={String(targets.length)} /></PlaybookMetrics>

        <div style={grid}>
          <section style={panel}>
            <PlaybookPill>Visit logistics</PlaybookPill><h2 style={heading}>Add a recruiting visit</h2>
            {targets.length === 0 ? <div style={empty}><strong>Add a recruiting target first.</strong><p style={muted}>A visit must belong to a real school or program in your Recruiting Command Center.</p><PlaybookButton href="/recruiting">Add a target</PlaybookButton></div> : (
              <form onSubmit={addVisit} style={form}>
                <label style={field}>School / program<select value={targetId} onChange={(e) => setTargetId(e.target.value)} style={input}>{targets.map((target) => <option key={target.id} value={target.id}>{target.school_name}{target.athletic_program ? ` · ${target.athletic_program}` : ""}</option>)}</select></label>
                <label style={field}>Visit type<select value={kind} onChange={(e) => setKind(e.target.value as VisitKind)} style={input}>{kinds.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label>
                <label style={field}>Start<input required type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)} style={input} /></label>
                <label style={field}>End<input type="datetime-local" value={end} onChange={(e) => setEnd(e.target.value)} style={input} /></label>
                <label style={field}>Location / meeting details<input value={location} onChange={(e) => setLocation(e.target.value)} style={input} placeholder="Campus, arena, virtual meeting…" /></label>
                <label style={field}>Private notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={4000} style={textarea} /></label>
                <button disabled={saving} style={primary}>{saving ? "Saving…" : "Add visit"}</button>
              </form>
            )}
          </section>

          <section style={panel}>
            <PlaybookPill>Visit history</PlaybookPill><h2 style={heading}>Your recruiting visits</h2>
            {visits.length === 0 ? <div style={empty}><strong>No visits recorded.</strong><p style={muted}>Playbook will not invent campus visits, invitations, or coach contact.</p></div> : <div style={list}>{visits.map((visit) => (
              <article key={visit.id} style={card}>
                <div style={cardTop}><div><span style={eyebrow}>{label(visit.visit_kind)}</span><h3 style={cardTitle}>{visit.recruiting_targets?.school_name || "Recruiting target"}</h3><p style={muted}>{formatDate(visit.scheduled_start)}{visit.location ? ` · ${visit.location}` : ""}</p></div><select disabled={saving} value={visit.status} onChange={(e) => void updateVisitStatus(visit.id, e.target.value as VisitStatus)} style={smallSelect}>{statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}</select></div>
                {visit.notes ? <p style={note}>{visit.notes}</p> : null}
              </article>
            ))}</div>}
          </section>
        </div>
      </div>
    </PlaybookPage>
  );
}

function label(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()); }
function formatDate(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? value : date.toLocaleString(); }
const state: React.CSSProperties = { minHeight: 360, display: "grid", placeItems: "center", color: "#64748B" };
const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 };
const errorBox: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", color: "#991B1B" };
const successBox: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#F0FDF4", color: "#166534" };
const grid: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,360px),1fr))", gap: 18, alignItems: "start" };
const panel: React.CSSProperties = { padding: "clamp(20px,3vw,30px)", border: "1px solid #DDE6EF", borderRadius: 24, background: "#FFF" };
const heading: React.CSSProperties = { margin: "10px 0 12px", color: "#102238", fontSize: "clamp(26px,4vw,36px)" };
const form: React.CSSProperties = { display: "grid", gap: 13 };
const field: React.CSSProperties = { display: "grid", gap: 6, color: "#334155", fontSize: 12, fontWeight: 850 };
const input: React.CSSProperties = { minHeight: 44, borderRadius: 12, border: "1px solid #CBD5E1", padding: "9px 11px", font: "inherit" };
const textarea: React.CSSProperties = { ...input, minHeight: 100, resize: "vertical" };
const primary: React.CSSProperties = { minHeight: 46, border: 0, borderRadius: 999, background: "#F97316", color: "#FFF", fontWeight: 900 };
const empty: React.CSSProperties = { padding: 20, borderRadius: 16, background: "#F8FAFC", border: "1px dashed #CBD5E1" };
const muted: React.CSSProperties = { color: "#64748B", lineHeight: 1.55 };
const list: React.CSSProperties = { display: "grid", gap: 12 };
const card: React.CSSProperties = { padding: 17, borderRadius: 18, border: "1px solid #E2E8F0", background: "#FBFCFE" };
const cardTop: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" };
const eyebrow: React.CSSProperties = { color: "#C2410C", fontSize: 10, fontWeight: 950, letterSpacing: ".08em", textTransform: "uppercase" };
const cardTitle: React.CSSProperties = { margin: "5px 0", color: "#102238", fontSize: 21 };
const smallSelect: React.CSSProperties = { ...input, minWidth: 130 };
const note: React.CSSProperties = { marginBottom: 0, color: "#475569", lineHeight: 1.55 };
