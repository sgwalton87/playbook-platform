"use client";
import type { OnboardingActivity } from "@/lib/onboarding/types";

const input: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: 12, color: "#0f172a", fontSize: 16, background: "#fff", boxSizing: "border-box" };
const newActivity = (): OnboardingActivity => ({ activity: "", category: "", description: "", hours: "", supervisor: "" });
const categories = ["Sports", "School club", "Community service", "Work", "Leadership", "Family responsibilities", "Arts", "Other"];

export default function ActivityProfileField({ value, onChange }: {
  value: unknown;
  onChange: (entries: Array<OnboardingActivity | string>) => void;
}) {
  // No component-local draft: every edit updates the owner profile's canonical
  // onboarding state so the parent Save Changes action includes that edit.
  const entries: Array<OnboardingActivity | string> = Array.isArray(value)
    ? value.filter((x): x is OnboardingActivity | string =>
        typeof x === "string" || Boolean(x && typeof x === "object" && !Array.isArray(x)))
    : [];
  const change = (index: number, key: keyof OnboardingActivity, next: string) => {
    onChange(entries.map((item, i) => i === index && typeof item !== "string"
      ? { ...newActivity(), ...item, [key]: next } : item));
  };
  return <div style={{ display: "grid", gap: 12 }}>
    {entries.map((entry, index) => typeof entry === "string" ? (
      <div key={index} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}>
        <label>Legacy activity (editable)
          <input style={input} value={entry} onChange={event =>
            onChange(entries.map((item,i)=>i===index?event.target.value:item))} />
        </label>
        <button type="button" onClick={() => onChange(entries.filter((_,i)=>i!==index))}>Remove activity</button>
      </div>
    ) : (
      <fieldset key={index} style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, display: "grid", gap: 10 }}>
        <legend>Activity {index + 1} · saved with your profile</legend>
        <label>Activity<input style={input} value={entry.activity || ""} onChange={e => change(index, "activity", e.target.value)} /></label>
        <label>Category
          <input style={input} list="playbook-activity-category-options" value={entry.category || ""} onChange={e => change(index, "category", e.target.value)} />
        </label>
        <label>Hours<input style={input} inputMode="decimal" value={entry.hours || ""} onChange={e => change(index, "hours", e.target.value)} /></label>
        <label>Mentor / Supervisor<input style={input} value={entry.supervisor || ""} onChange={e => change(index, "supervisor", e.target.value)} /></label>
        <label>Description<textarea style={input} value={entry.description || ""} onChange={e => change(index, "description", e.target.value)} /></label>
        <button type="button" onClick={() => onChange(entries.filter((_,i)=>i!==index))}>Remove activity</button>
      </fieldset>
    ))}
    <datalist id="playbook-activity-category-options">{categories.map(c=><option key={c} value={c}/>)}</datalist>
    <button type="button" style={{ background: "#0f2c4b", border:0, color:"white", padding:14, borderRadius:12, fontWeight:800 }} onClick={() => onChange([...entries, newActivity()])}>+ Add activity row</button>
    <p style={{ color:"#475569", fontSize:13, margin:0 }}>Activity edits are included when you select Save & verify. You do not need to press a separate Add Entry button after typing.</p>
  </div>;
}
