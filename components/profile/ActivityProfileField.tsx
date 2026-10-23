"use client";
import { useState } from "react";
import type { OnboardingActivity } from "@/lib/onboarding/types";

const input: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: 12, color: "#0f172a", fontSize: 16, background: "#fff", boxSizing: "border-box" };
const empty = (): OnboardingActivity => ({ activity: "", category: "", description: "", hours: "", supervisor: "" });

export default function ActivityProfileField({ value, onChange }: {
  value: unknown;
  onChange: (entries: OnboardingActivity[]) => void;
}) {
  const [draft, setDraft] = useState<OnboardingActivity>(empty);
  const records: OnboardingActivity[] = Array.isArray(value) ? value.filter((entry): entry is OnboardingActivity =>
    entry !== null && typeof entry === "object" && !Array.isArray(entry) && typeof entry.activity === "string"
  ).map(entry => ({ ...empty(), ...entry })) : [];
  // Legacy free-text entries are preserved and remain editable rather than discarded.
  const texts = Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  const add = () => {
    if (!draft.activity.trim()) return;
    onChange([...records, ...texts.map(activity => ({ ...empty(), activity })), { ...draft, activity: draft.activity.trim() }]);
    setDraft(empty());
  };
  return <div style={{ display: "grid", gap: 12 }}>
    {records.map((entry, index) => <div key={index} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "grid", gap: 8 }}>
      <label>Activity<input style={input} value={entry.activity} onChange={e => onChange(records.map((x, i) => i === index ? { ...x, activity: e.target.value } : x))} /></label>
      <label>Category<input style={input} value={entry.category} onChange={e => onChange(records.map((x, i) => i === index ? { ...x, category: e.target.value } : x))} /></label>
      <label>Hours<input style={input} value={entry.hours} onChange={e => onChange(records.map((x, i) => i === index ? { ...x, hours: e.target.value } : x))} /></label>
      <label>Mentor / Supervisor<input style={input} value={entry.supervisor} onChange={e => onChange(records.map((x, i) => i === index ? { ...x, supervisor: e.target.value } : x))} /></label>
      <label>Description<textarea style={input} value={entry.description} onChange={e => onChange(records.map((x, i) => i === index ? { ...x, description: e.target.value } : x))} /></label>
      <button type="button" onClick={() => onChange(records.filter((_, i) => i !== index))}>Remove activity</button>
    </div>)}
    {texts.length > 0 && <p>Legacy entries: {texts.join(", ")}. They remain preserved until you add or edit an entry.</p>}
    <fieldset style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
      <legend>Add activity</legend>
      <label>Activity<input style={input} value={draft.activity} onChange={e => setDraft(x => ({ ...x, activity: e.target.value }))} /></label>
      <label>Category<input style={input} value={draft.category} onChange={e => setDraft(x => ({ ...x, category: e.target.value }))} /></label>
      <label>Hours<input style={input} value={draft.hours} onChange={e => setDraft(x => ({ ...x, hours: e.target.value }))} /></label>
      <label>Mentor / Supervisor<input style={input} value={draft.supervisor} onChange={e => setDraft(x => ({ ...x, supervisor: e.target.value }))} /></label>
      <label>Description<textarea style={input} value={draft.description} onChange={e => setDraft(x => ({ ...x, description: e.target.value }))} /></label>
      <button type="button" disabled={!draft.activity.trim()} onClick={add}>Add activity entry</button>
    </fieldset>
  </div>;
}
