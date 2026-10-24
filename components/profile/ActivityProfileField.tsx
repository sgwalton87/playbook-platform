"use client";
import { useState } from "react";
import type { OnboardingActivity } from "@/lib/onboarding/types";

const input: React.CSSProperties = { width: "100%", border: "1px solid #cbd5e1", borderRadius: 10, padding: 12, color: "#0f172a", fontSize: 16, background: "#fff", boxSizing: "border-box" };
const newActivity = (): OnboardingActivity => ({ activity: "", category: "", description: "", hours: "", supervisor: "", supervisor_email: "", supervisor_telephone: "" });
const categories = ["Sports", "School club", "Community service", "Work", "Leadership", "Family responsibilities", "Arts", "Other"];

export default function ActivityProfileField({ value, onChange }: {
  value: unknown;
  onChange: (entries: Array<OnboardingActivity | string>) => void;
}) {
  // Edits flow directly to the canonical onboarding snapshot. Only the parent
  // Save & verify action persists, using its stale-snapshot/readback safeguards.
  const entries: Array<OnboardingActivity | string> = Array.isArray(value)
    ? value.filter((x): x is OnboardingActivity | string =>
        typeof x === "string" || Boolean(x && typeof x === "object" && !Array.isArray(x)))
    : [];
  const [expanded, setExpanded] = useState<number | null>(null);
  const change = (index: number, key: keyof OnboardingActivity, next: string) => {
    onChange(entries.map((item, i) => i === index && typeof item !== "string"
      ? { ...newActivity(), ...item, [key]: next } : item));
  };
  const remove = (index: number) => {
    onChange(entries.filter((_, i) => i !== index));
    setExpanded(current => current === null ? null : current === index ? null : current > index ? current - 1 : current);
  };
  return <div style={{ display: "grid", gap: 12, minWidth: 0 }}>
    {entries.map((entry, index) => {
      const legacy = typeof entry === "string";
      const name = legacy ? entry : entry.activity?.trim() || "";
      const category = legacy ? "" : entry.category?.trim() || "";
      const title = name || `Activity ${index + 1}`;
      const isOpen = expanded === index;
      return <section key={index} style={{border:"1px solid #cbd5e1",borderRadius:14,overflow:"hidden",background:"#fff",minWidth:0}}>
        <button type="button" aria-expanded={isOpen} aria-controls={`activity-details-${index}`}
          onClick={() => setExpanded(isOpen ? null : index)}
          style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,width:"100%",textAlign:"left",padding:"16px",border:0,background:isOpen?"#edf4fb":"#fff",color:"#0f172a",fontSize:16,cursor:"pointer"}}>
          <span style={{minWidth:0,overflowWrap:"anywhere"}}>
            <strong>{title}</strong>
            {category && <span style={{display:"block",fontSize:13,color:"#475569",marginTop:4}}>{category}</span>}
            {legacy && <span style={{display:"block",fontSize:12,color:"#64748b"}}>Earlier saved entry</span>}
          </span>
          <span aria-hidden="true" style={{fontWeight:800,fontSize:20,flexShrink:0}}>{isOpen ? "−" : "+"}</span>
        </button>
        {isOpen && <div id={`activity-details-${index}`} style={{display:"grid",gap:12,padding:16,borderTop:"1px solid #e2e8f0"}}>
          {legacy ? <label>Activity name
            <input style={input} value={entry} onChange={event =>
              onChange(entries.map((item,i)=>i===index?event.target.value:item))} />
          </label> : <>
            <label>Activity<input style={input} value={entry.activity || ""} onChange={e=>change(index,"activity",e.target.value)} /></label>
            <label>Category
              <select style={input} value={categories.includes(entry.category||"") ? entry.category : entry.category ? "Other" : ""}
                onChange={e=>change(index,"category",e.target.value)}>
                <option value="">Choose a category</option>
                {categories.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            {entry.category && !categories.includes(entry.category) && <p style={{fontSize:12,color:"#475569",margin:0}}>Previously saved category: {entry.category}. Choose a category above to update it.</p>}
            <label># Hours<input style={input} inputMode="decimal" value={entry.hours || ""} onChange={e=>change(index,"hours",e.target.value)} /></label>
            <label>Activity Supervisor<input style={input} value={entry.supervisor || ""} onChange={e=>change(index,"supervisor",e.target.value)} /></label>
            <label>Supervisor Email (optional)<input style={input} type="email" autoComplete="email" value={entry.supervisor_email || ""} onChange={e=>change(index,"supervisor_email",e.target.value)} /></label>
            <label>Supervisor Telephone (optional)<input style={input} type="tel" autoComplete="tel" value={entry.supervisor_telephone || ""} onChange={e=>change(index,"supervisor_telephone",e.target.value)} /></label>
            <label>Description<textarea style={input} value={entry.description || ""} onChange={e=>change(index,"description",e.target.value)} /></label>
          </>}
          <button type="button" onClick={() => remove(index)}
            style={{padding:12,border:"1px solid #cbd5e1",borderRadius:10,background:"#f8fafc",color:"#9a3412",cursor:"pointer"}}>Remove activity</button>
        </div>}
      </section>;
    })}
    <button type="button" style={{background:"#0f2c4b",border:0,color:"white",padding:14,borderRadius:12,fontWeight:800,cursor:"pointer"}}
      onClick={() => {setExpanded(entries.length);onChange([...entries,newActivity()]);}}>+ Add activity</button>
    <p style={{color:"#475569",fontSize:13,margin:0}}>Select an activity to expand and edit it. Changes are included when you choose Save & verify; there is no separate Add Entry step.</p>
  </div>;
}
