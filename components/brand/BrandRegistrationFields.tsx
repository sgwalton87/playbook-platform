"use client";
import { STATE_REGISTRIES } from "@/lib/verification/stateRegistries";
import { ENTITY_TYPES, type BrandRegistration } from "@/lib/verification/registration";
import { SAFEGUARDING_QUESTIONS, type SafetyAnswer } from "@/lib/verification/safeguarding";
export default function BrandRegistrationFields({ value, onChange }: { value: BrandRegistration; onChange: (value: BrandRegistration) => void }) {
 return <section aria-labelledby="business-safety-heading" style={{ padding: 16, background: "white", borderRadius: 12, color: "#15243A", display: "grid", gap: 14 }}>
  <h3 id="business-safety-heading">Business registration and student safety</h3>
  <label>Formation state or jurisdiction<select aria-label="Formation state or jurisdiction" value={value.formationState} onChange={e => onChange({ ...value, formationState: e.target.value })} style={input}><option value="">Select jurisdiction</option>{STATE_REGISTRIES.map(row => <option key={row.name} value={row.name}>{row.name}</option>)}</select></label>
  <label>Business structure<select aria-label="Business structure" value={value.entityType} onChange={e => onChange({ ...value, entityType: e.target.value })} style={input}><option value="">Select structure</option>{ENTITY_TYPES.map(type => <option key={type}>{type}</option>)}</select></label>
  <label>Entity number, if issued<input aria-label="Entity number, if issued" maxLength={80} value={value.entityNumber} onChange={e => onChange({ ...value, entityNumber: e.target.value })} style={input} /></label>
  <p>Use only the public business entity number. Do not enter an EIN, Social Security number or other personal identifier.</p>
  <p>Sole proprietors, DBAs, public agencies and other structures may use different establishment records. A missing Secretary of State result does not automatically disqualify a business.</p>
  <p>Answer to the best of your knowledge for yourself and the personnel you propose for this partnership. Do not disclose sealed, expunged, juvenile or otherwise legally protected records. Choose “Discuss privately” if you need confidential clarification. Pending charges are not convictions; no answer alone automatically approves or declines your organization.</p>
  {SAFEGUARDING_QUESTIONS.map(q => <label key={q.id}>{q.label}<select aria-label={q.label} style={input} value={value.safetyAnswers[q.id] || ""} onChange={e => onChange({ ...value, safetyAnswers: { ...value.safetyAnswers, [q.id]: e.target.value as SafetyAnswer } })}><option value="">Select an answer</option><option value="no">No</option><option value="yes">Yes — confidential human review</option><option value="private_review">Discuss privately</option></select></label>)}
  <label><input type="checkbox" checked={value.safeguardingAccepted} onChange={e => onChange({ ...value, safeguardingAccepted: e.target.checked })} /> I will follow Playbook student-protection and consent requirements, use only approved personnel and activities, avoid unauthorized student contact, and notify Playbook of material safety or authorization changes.</label>
  <p>These declarations are private verification information. Do not place sensitive history in public profiles or email attachments.</p>
 </section>;
}
const input: React.CSSProperties = { display: "block", width: "100%", boxSizing: "border-box", padding: 12, marginTop: 6, border: "1px solid #CBD5E1", borderRadius: 8, color: "#15243A", background: "white" };
