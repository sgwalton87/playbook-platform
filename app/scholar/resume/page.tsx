"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CanonicalRoleAuthorityGate } from "@/components/role-os/RoleAuthorityGate";
import { supabase } from "@/lib/supabaseClient";
import { buildScholarRecord } from "@/lib/scholar";
import { buildOwnerScholarConsumerProjection, type ScholarConsumerProjection } from "@/lib/scholar/consumer-projection";
import { buildPrivateScholarResumeDraft } from "@/lib/scholar/private-resume-draft";

const headings = { service: "Community Service", leadership: "Leadership", awards: "Awards & Honors",
  experience: "Experience", credentials: "Certificates & Credentials" } as const;

export default function ScholarResumePage() {
  return <CanonicalRoleAuthorityGate role="scholar"><ScholarResumeWorkspace /></CanonicalRoleAuthorityGate>;
}

function ScholarResumeWorkspace() {
  const [projection, setProjection] = useState<ScholarConsumerProjection | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "signed-out">("loading");
  const [message, setMessage] = useState("");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (!active) return;
      if (authError || !auth.user) { setStatus("signed-out"); return; }
      const id = auth.user.id;
      const [profile, activities, certificates, agProgress] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", id).single(),
        supabase.from("student_activities").select("*").eq("student_id", id).order("created_at", {ascending:false}),
        supabase.from("certificates").select("*").eq("user_id", id).order("issued_at", {ascending:false}),
        supabase.from("ag_progress").select("*").eq("user_id", id),
      ]);
      if (!active) return;
      if (profile.error || activities.error || certificates.error || agProgress.error) {
        setMessage("Some Scholar Record data could not be loaded. No résumé was published or exported.");
        setStatus("error"); return;
      }
      try {
        const record = buildScholarRecord({
          profile: profile.data, activities: activities.data ?? [],
          certificates: certificates.data ?? [], agProgress: agProgress.data ?? [],
        });
        const safe = buildOwnerScholarConsumerProjection(record, id);
        setProjection(safe);
        // Deliberately start unselected: an award or service entry is never published implicitly.
        setSelected([]);
        setStatus("ready");
      } catch {
        setMessage("We could not verify ownership of this Scholar Record.");
        setStatus("error");
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  const draft = useMemo(() => projection ? buildPrivateScholarResumeDraft(projection, selected) : null, [projection, selected]);
  const switchEntry = (id: string) => { setPrivacyConfirmed(false); setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]); };

  return <main className="sj-resume">
    <style>{`
      .sj-resume {min-height:100vh;background:#f8f7f4;padding:24px;font:16px/1.5 system-ui,sans-serif;color:#172035}
      .sj-shell {max-width:1080px;margin:auto}
      .sj-title {font-size:clamp(1.7rem,4vw,2.5rem);margin:10px 0}
      .sj-brand {font-size:12px;letter-spacing:.18em;font-weight:800;color:#181818}
      .sj-brand-rule {height:3px;background:#b48b38;margin:12px 0 18px}
      .sj-tutorial {border:1px solid #dac392;background:#fffdf8;border-radius:12px;padding:16px;margin:14px 0}
      .sj-tutorial ol {padding-left:24px}
      .sj-consent {display:flex;gap:10px;margin:16px 0;font-size:.9rem;align-items:flex-start}
      .sj-consent input {width:20px;height:20px;flex-shrink:0}
      .sj-grid {display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:20px}
      .sj-panel {background:white;border:1px solid #ddd;border-radius:16px;padding:20px;min-width:0}
      .sj-row {display:flex;gap:12px;padding:12px 0;border-bottom:1px solid #e5e7eb}
      .sj-row input {width:20px;height:20px;flex-shrink:0}
      .sj-row small {display:block;color:#566171}
      .sj-action {display:inline-block;border:0;border-radius:9px;background:#172035;color:white;padding:12px 18px;font:inherit;cursor:pointer}
      .sj-action:disabled {opacity:.5;cursor:not-allowed}
      .sj-draft section {margin-top:18px}
      .sj-print-brand {margin-bottom:18px}
      .sj-draft h3 {font-size:1rem;border-bottom:1px solid #aaa}
      .sj-draft p {margin:4px 0 10px}
      .sj-note {color:#566171;font-size:.9rem}
      @media(max-width:760px) {.sj-grid {grid-template-columns:1fr}.sj-resume {padding:14px}}
      @media print {nav,.sj-edit,.sj-actions,.sj-note,.sj-title,.sj-tutorial {display:none!important}
        .sj-resume{background:white;padding:0}.sj-grid{display:block}.sj-panel{border:0;padding:0}
        .sj-draft{width:100%;box-shadow:none}.sj-draft section{break-inside:avoid}}
    `}</style>
    <div className="sj-shell">
      <nav><Link href="/dashboard">Scholar Dashboard</Link> · <Link href="/record">Update Achievements</Link> · <Link href="/courses">Courses</Link> · <Link href="/compass">Compass</Link></nav>
      <h1 className="sj-title">My Scholar Résumé</h1>
      <div className="sj-tutorial"><button type="button" aria-expanded={tutorialOpen} aria-controls="sj-guide" onClick={() => setTutorialOpen(v => !v)}>{tutorialOpen ? "Hide" : "Show"} résumé tutorial</button>{tutorialOpen && <ol id="sj-guide"><li>Review your Scholar Record and add missing service or awards.</li><li>Select the accomplishments relevant to this opportunity.</li><li>Check dates, hours and verification labels before exporting.</li><li>Review the privacy notice, then print or save as PDF.</li><li>Employer and school links will be offered only after governed sharing is certified.</li></ol>}</div>
      <p className="sj-note">Choose the achievements you want to include. Your résumé starts private. Unverified entries remain clearly labeled.</p>
      {status === "loading" && <p role="status">Loading your Scholar Record…</p>}
      {status === "signed-out" && <p role="alert">Sign in to create your résumé.</p>}
      {status === "error" && <p role="alert">{message}</p>}
      {status === "ready" && projection && draft && <div className="sj-grid">
        <section className="sj-panel sj-edit" aria-label="Choose résumé entries">
          <h2>Select what to include</h2>
          {projection.entries.length === 0 && <p>No service, awards, or credentials found yet. <Link href="/record">Add an achievement</Link> to start building your record.</p>}
          {projection.entries.map(entry => <label className="sj-row" key={entry.id}>
            <input type="checkbox" checked={selected.includes(entry.id)} onChange={() => switchEntry(entry.id)} />
            <span><strong>{entry.title}</strong><small>{headings[entry.category === "award" ? "awards" : entry.category === "credential" ? "credentials" : entry.category]} · {entry.organization ?? "Organization not specified"} · {entry.verification}</small></span>
          </label>)}
        </section>
        <div className="sj-panel">
          <div className="sj-actions"><label className="sj-consent"><input type="checkbox" checked={privacyConfirmed} onChange={e => setPrivacyConfirmed(e.target.checked)} /><span>I have reviewed the selected entries. I understand that downloaded files are stored on my device and cannot be revoked or updated by Playbook after export. I will protect this file and review whom I share it with.</span></label><button className="sj-action" type="button" disabled={selected.length===0 || !privacyConfirmed} onClick={() => window.print()}>Print / Save as PDF</button></div>
          <p className="sj-note">PDF is saved through your browser's Print → Save as PDF option. External links are not enabled yet.</p>
          <article className="sj-draft" aria-label="Private résumé preview"><header className="sj-print-brand"><div className="sj-brand">PLAYBOOK SERIES · SCHOLAR RECORD™</div><div className="sj-brand-rule" aria-hidden="true" /></header>
            <h2>{draft.name}</h2>
            {draft.school && <p>{draft.school}</p>}
            {(Object.keys(headings) as Array<keyof typeof headings>).map(key => draft.sections[key].length > 0 && <section key={key}>
              <h3>{headings[key]}</h3>
              {draft.sections[key].map(e => <p key={e.id}><strong>{e.title}</strong>{e.role ? ` — ${e.role}` : ""}
                {e.organization ? <span> · {e.organization}</span> : null}
                {e.hours != null ? <span> · {e.hours} service hours</span> : null}
                <small style={{display:"block"}}>{e.verification === "verified" ? "Verified" : "Self-reported · Not verified"}</small>
              </p>)}
            </section>)}
            {selected.length===0 && <p>Select one or more entries to preview your résumé.</p>}
          </article>
        </div>
      </div>}
    </div>
  </main>;
}
