"use client";

import { useState } from "react";

/** Manual official-registry research only. Never equate no-match with a decline. */
const SOS_URL = "https://bizfileonline.sos.ca.gov/";
const STEPS = [
  { title: "Open the official California search", text: "Open the Secretary of State bizfile Online site using the link below. It opens separately; keep this Playbook review tab open. Choose Business Search on the official site." },
  { title: "Search the legal entity", text: "Search the applicant's registered legal business name or SOS entity number. If needed, try distinctive words from the name; a DBA or sole proprietor may not appear in this entity registry." },
  { title: "Examine the correct record", text: "Compare entity name, entity number, entity type, jurisdiction, filing date and current status with the documents supplied. Check similarly named entities and available advanced search options." },
  { title: "Return and document the finding", text: "Switch back to the Playbook tab. In reviewer notes record the official source, entity name and number, status, lookup timestamp, any mismatch, and what further documents are needed. Do not paste sensitive personal information." },
  { title: "Apply human review", text: "An active listing is supporting evidence, not automatic approval. A missing, suspended, or mismatched listing is not an automatic decline. Request additional evidence or escalate; keep the independent safeguarding, campaign, and compliance checks." },
] as const;

export default function SosVerificationTutorial() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  return (
    <section aria-label="California Secretary of State verification tutorial" style={{ border: "1px solid #CBD5E1", borderRadius: 12, padding: 16, marginBlock: 16, background: "#F8FAFC", color: "#0F172A" }}>
      <h2 style={{ marginTop: 0, fontSize: 20 }}>California official business verification</h2>
      <p>Use the free official SOS business search in a separate tab. Your Playbook reviewer dashboard remains open so you can return to this case.</p>
      <a href={SOS_URL} target="_blank" rel="noopener noreferrer" aria-label="Open California Secretary of State business search in a new tab" style={{ display: "inline-block", padding: "10px 14px", background: "#17365B", color: "#FFF", borderRadius: 8, marginBottom: 12 }}>Open official SOS search (new tab) ↗</a>
      <p style={{ fontSize: 13 }}>On phones or in-app browsers, switch back to the Playbook tab/app after researching. If your browser blocks the new tab, use the link directly. The SOS site is external to Playbook.</p>
      <div>
        <button type="button" aria-expanded={open} aria-controls="sos-review-tutorial" onClick={() => setOpen(v => !v)} style={{ padding: "8px 12px", cursor: "pointer" }}>{open ? "Hide" : "Start"} 5-step reviewer tutorial {completed ? "✓" : ""}</button>
      </div>
      {open && <div id="sos-review-tutorial" style={{ paddingTop: 14 }}>
        <p aria-live="polite">Step {step + 1} of {STEPS.length}</p>
        <h3>{STEPS[step].title}</h3>
        <p>{STEPS[step].text}</p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Previous</button>
          {step < STEPS.length - 1
            ? <button type="button" onClick={() => setStep(s => s + 1)}>Next step</button>
            : <button type="button" onClick={() => { setCompleted(true); setOpen(false); }}>Finish tutorial</button>}
        </div>
      </div>}
      <details style={{ marginTop: 12 }}>
        <summary>Reviewer evidence checklist</summary>
        <ul>
          <li>Official source: California SOS bizfile Online and URL</li>
          <li>Legal entity name and entity number (if present)</li>
          <li>Entity type, jurisdiction, filing date, and displayed status</li>
          <li>Date/time searched and comparison to applicant evidence</li>
          <li>Outcome: matched, inconsistent, not found, or alternate establishment evidence needed</li>
        </ul>
        <p>Do not record “verified” solely from a similar name. Human review, representative authority, and other gates still apply.</p>
      </details>
    </section>
  );
}
