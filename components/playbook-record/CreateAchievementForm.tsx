"use client";

import { useState } from "react";
import { createAchievementWithEvidence } from "@/lib/playbook-record/services/achievements";

type Props = {
  profileId: string;
};

export default function CreateAchievementForm({ profileId }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("academic");
  const [description, setDescription] = useState("");
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [reflection, setReflection] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!title.trim()) return alert("Add an achievement title.");

    setSaving(true);
    setDone(false);

    try {
      await createAchievementWithEvidence({
        profileId,
        title,
        category,
        description,
        evidenceTitle,
        evidenceUrl,
        reflection,
      });

      setTitle("");
      setDescription("");
      setEvidenceTitle("");
      setEvidenceUrl("");
      setReflection("");
      setDone(true);
    } catch (err: any) {
      alert(err.message || "Could not save achievement.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24}}>
      <p style={{fontFamily:"'Space Mono', monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",marginBottom:12}}>
        Playbook Record
      </p>

      <h1 style={{fontSize:28,marginBottom:8,color:"#0F172A"}}>
        Add Achievement + Evidence
      </h1>

      <p style={{fontSize:13,color:"#64748B",lineHeight:1.6,marginBottom:18}}>
        Create an achievement, attach evidence, add a reflection, and generate a timeline event.
      </p>

      <div style={{display:"grid",gap:12}}>
        <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Achievement title" style={inputStyle}/>

        <select value={category} onChange={e=>setCategory(e.target.value)} style={inputStyle}>
          <option value="academic">Academic</option>
          <option value="athletic">Athletic</option>
          <option value="career">Career</option>
          <option value="service">Service</option>
          <option value="leadership">Leadership</option>
          <option value="financial_literacy">Financial Literacy</option>
          <option value="entrepreneurship">Entrepreneurship</option>
          <option value="creative">Creative</option>
          <option value="civic">Civic</option>
          <option value="personal_growth">Personal Growth</option>
          <option value="other">Other</option>
        </select>

        <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" rows={3} style={inputStyle}/>

        <input value={evidenceTitle} onChange={e=>setEvidenceTitle(e.target.value)} placeholder="Evidence title" style={inputStyle}/>

        <input value={evidenceUrl} onChange={e=>setEvidenceUrl(e.target.value)} placeholder="Evidence link or URL" style={inputStyle}/>

        <textarea value={reflection} onChange={e=>setReflection(e.target.value)} placeholder="Reflection: What did you learn? Why does this matter?" rows={4} style={inputStyle}/>

        <button onClick={submit} disabled={saving} style={{
          background:saving?"#CBD5E1":"#F97316",
          color:"#fff",
          border:"none",
          borderRadius:999,
          padding:"12px 18px",
          fontWeight:800,
          cursor:saving?"default":"pointer"
        }}>
          {saving ? "Saving..." : "Save Achievement →"}
        </button>

        {done && <p style={{fontSize:13,color:"#10B981"}}>Achievement saved to the Playbook Record.</p>}
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width:"100%",
  border:"1px solid #E2E8F0",
  borderRadius:12,
  padding:"12px 14px",
  fontSize:14,
  fontFamily:"inherit",
};
