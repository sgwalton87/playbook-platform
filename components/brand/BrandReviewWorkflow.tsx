"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { ADDITIONAL_VERIFICATION_REASONS, DECLINE_REASONS, buildReviewMessage, type ReviewOutcome } from "@/lib/verification/templates";
import { SAFEGUARDING_QUESTIONS } from "@/lib/verification/safeguarding";
import type { RegistryLookup } from "@/lib/verification/registry";
type Context = { registration?: { formation_state: string; entity_type: string; entity_number: string; safety_answers: Record<string,string> }; registry?: { human_outcome: string; source_url: string; review_note: string; safety_reviewed: boolean } };
export default function BrandReviewWorkflow({ requestId, documentsReviewed, onComplete }: { requestId: string; documentsReviewed: boolean; onComplete: (message: string) => void }) {
 const [context, setContext] = useState<Context | null>(null);
 const [outcome, setOutcome] = useState<ReviewOutcome>("needs_information");
 const [reason, setReason] = useState(""); const [extra, setExtra] = useState(""); const [privateNote, setPrivateNote] = useState("");
 const [campaignScope, setCampaignScope] = useState(false); const [complianceScope, setComplianceScope] = useState(false);
 const [humanOutcome, setHumanOutcome] = useState("needs_review"); const [sourceUrl, setSourceUrl] = useState(""); const [registryNote, setRegistryNote] = useState(""); const [safetyReviewed, setSafetyReviewed] = useState(false);
 const [lookup, setLookup] = useState<RegistryLookup | null>(null); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState("");
 const actionId = useRef<string | null>(null);
 const load = useCallback(async () => {
  const response = await fetch(`/api/admin/verification/brand-review?requestId=${encodeURIComponent(requestId)}`, { cache: "no-store" });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Review details unavailable.");
  const data = body as Context; setContext(data);
  if (data.registry) { setHumanOutcome(data.registry.human_outcome); setSourceUrl(data.registry.source_url); setRegistryNote(data.registry.review_note); setSafetyReviewed(data.registry.safety_reviewed); }
 }, [requestId]);
 useEffect(() => { const timer = window.setTimeout(() => { void load().catch(cause => setNotice(cause.message)); }, 0); return () => window.clearTimeout(timer); }, [load]);
 const reasons = outcome === "needs_information" ? ADDITIONAL_VERIFICATION_REASONS : outcome === "rejected" ? DECLINE_REASONS : [];
 let preview = "Select a reason to preview the applicant's message.";
 try { preview = buildReviewMessage(outcome, reason, extra); } catch { /* The dropdown supplies the required reason. */ }
 const ready = Boolean(context?.registry && ["matched_active","alternative_verified"].includes(context.registry.human_outcome) && context.registry.safety_reviewed);
 async function registryAction(action: "lookup" | "save") {
  setBusy(true); setNotice("");
  try {
   const response = await fetch("/api/admin/verification/registry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, requestId, humanOutcome, sourceUrl, note: registryNote, safetyReviewed }) });
   const body = await response.json(); if (!response.ok) throw new Error(body.error || "Registry operation failed.");
   if (action === "lookup") { setLookup(body); if (!sourceUrl) setSourceUrl(body.source || ""); }
   else { await load(); setNotice("Human registration and safeguarding review saved."); }
  } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Registry operation failed."); } finally { setBusy(false); }
 }
 async function submit() {
  setBusy(true); setNotice("");
  actionId.current ??= crypto.randomUUID();
  try {
   const response = await fetch("/api/admin/verification/brand-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId, actionId: actionId.current, outcome, reasonCode: reason, extraMessage: extra, privateNote, documentsReviewed, campaignScope, complianceScope }) });
   const body = await response.json(); if (!response.ok) throw new Error(body.error || "Review could not be saved.");
   actionId.current = null; setPrivateNote(""); setNotice(body.delivery.message);
   window.dispatchEvent(new Event("brand-verification-review-completed")); onComplete(`Review saved. ${body.delivery.message}`);
  } catch (cause) { setNotice(cause instanceof Error ? cause.message : "Review failed. Check the communication log before retrying."); } finally { setBusy(false); }
 }
 return <section aria-label="Brand Partner review and communication" style={{ display: "grid", gap: 12, marginTop: 18 }}>
  <h3>Business and safeguarding review</h3>
  {context?.registration ? <>
   <p>{context.registration.formation_state} · {context.registration.entity_type} · Entity number: {context.registration.entity_number || "Not supplied"}</p>
   <details><summary>Private student-safety declarations</summary>{SAFEGUARDING_QUESTIONS.map(q => <p key={q.id}><strong>{q.label}</strong><br />{context.registration?.safety_answers[q.id] || "Not answered"}</p>)}<p>A charge is not a conviction. Confirm identity, relevance, lawful reportability and any correction before making an individual decision. Do not send these declarations to AI.</p></details>
   <button type="button" disabled={busy} onClick={() => void registryAction("lookup")}>Check official registry / AI research</button>
  </> : <p>Registration and safeguarding declarations have not yet been supplied. Request additional verification before approval.</p>}
  {lookup && <section aria-label="Registry research aid"><p>{lookup.summary}</p><a href={lookup.source} target="_blank" rel="noopener noreferrer">Open official registry</a>{lookup.candidates.map(row => <p key={row.entityNumber}>{row.name} · {row.entityNumber} · {row.standing}</p>)}<ul>{lookup.sources.map(row => <li key={row.url}><a href={row.url} target="_blank" rel="noopener noreferrer">{row.title}</a></li>)}</ul></section>}
  <label>Human registration determination<select value={humanOutcome} onChange={e => { setHumanOutcome(e.target.value); }} style={input}><option value="needs_review">Not yet resolved</option><option value="matched_active">Official entity matched and current standing confirmed</option><option value="alternative_verified">Alternative establishment evidence verified</option><option value="confirmed_issue">Verified issue requires clarification or decline</option></select></label>
  <label>Official record or alternative evidence URL<input type="url" value={sourceUrl} maxLength={2000} onChange={e => setSourceUrl(e.target.value)} style={input} /></label>
  <label>Registration and safeguarding review note<textarea value={registryNote} maxLength={4000} onChange={e => setRegistryNote(e.target.value)} style={input} /></label>
  <label><input type="checkbox" checked={safetyReviewed} onChange={e => setSafetyReviewed(e.target.checked)} /> I completed an individual human safeguarding review, including any requested private discussion, and resolved the student-safety requirements for this proposed scope.</label>
  <button type="button" disabled={busy || !sourceUrl.trim() || !registryNote.trim()} onClick={() => void registryAction("save")}>Save human review</button>
  <h3>Decision and applicant communication</h3>
  <label>Review outcome<select value={outcome} onChange={e => { setOutcome(e.target.value as ReviewOutcome); setReason(""); actionId.current = null; }} style={input}><option value="needs_information">Need additional verification</option><option value="under_review">Review in progress</option><option value="approved">Approve role access</option><option value="rejected">Decline with reason</option></select></label>
  {reasons.length > 0 && <label>Applicant-facing reason<select value={reason} onChange={e => { setReason(e.target.value); actionId.current = null; }} style={input}><option value="">Select a reason</option>{reasons.map(row => <option key={row.id} value={row.id}>{row.label}</option>)}</select></label>}
  <label>Additional message to the applicant<textarea maxLength={2000} value={extra} onChange={e => { setExtra(e.target.value); actionId.current = null; }} style={input} /><small>For a decline, explain the specific verified issue. Keep sensitive history out of email.</small></label>
  <label>Private admin notes<textarea aria-label="Private admin notes" maxLength={4000} value={privateNote} onChange={e => setPrivateNote(e.target.value)} style={input} /><small>Saved separately from applicant messages and never included in email.</small></label>
  <button type="button" disabled={busy || !privateNote.trim()} onClick={() => { setBusy(true); void fetch("/api/admin/verification/brand-review", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "note", requestId, note: privateNote }) }).then(response => { if (!response.ok) throw new Error("Private note could not be saved."); setPrivateNote(""); setNotice("Private note saved. No email was sent."); }).catch(cause => setNotice(cause.message)).finally(() => setBusy(false)); }}>Save private note without email</button>
  {outcome === "approved" && <>
   <label><input type="checkbox" checked={campaignScope} onChange={e => setCampaignScope(e.target.checked)} /> Approve the requested Brand Partner campaign scope after review.</label>
   <label><input type="checkbox" checked={complianceScope} onChange={e => setComplianceScope(e.target.checked)} /> Approve the requested student-protection and NIL/compliance scope after review.</label>
   <p>Approval unlocks this role&apos;s authorized workspace and operations. It does not grant admin rights or unrestricted student-record access.</p>
   {!ready && <p>Save a resolved human registration and safeguarding review before approval.</p>}
  </>}
  <div aria-label="Email preview" style={{ whiteSpace: "pre-wrap", padding: 14, background: "#F8FAFC", border: "1px solid #CBD5E1", borderRadius: 10 }}><strong>Email preview</strong><p>{preview}</p><p>{outcome === "approved" ? "Button: Open your Brand Partner dashboard" : "Button: Review and update your profile"}</p><small>From and reply-to: onboarding@playbookseriesinc.org</small></div>
  <button type="button" disabled={busy || !context || (reasons.length > 0 && !reason) || (outcome === "rejected" && !extra.trim()) || (outcome === "approved" && (!ready || !documentsReviewed || !campaignScope || !complianceScope))} onClick={() => void submit()}>{busy ? "Working…" : outcome === "approved" ? "Approve and send invitation" : outcome === "rejected" ? "Decline and send explanation" : "Save review and send message"}</button>
  {notice && <p role="status">{notice}</p>}
 </section>;
}
const input: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: 10, border: "1px solid #CBD5E1", borderRadius: 8, color: "#15243A", background: "white", marginTop: 6 };
