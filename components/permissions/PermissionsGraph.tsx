"use client";

import { getRelationshipGraph } from "@/lib/permissions";

export default function PermissionsGraph() {
  const graph = getRelationshipGraph();

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Role OS Permissions</p>
        <h1 style={title}>Every relationship has clear access.</h1>
        <p style={sub}>
          Playbook connects the support system around the scholar while protecting what each person can see and do.
        </p>
      </section>

      <section style={grid}>
        {graph.map((person) => (
          <article key={person.relationship} style={card}>
            <p style={eyebrow}>{person.relationship}</p>
            <h2 style={cardTitle}>{person.name}</h2>
            <div style={chips}>
              {person.permissions.map((permission) => (
                <span key={permission} style={chip}>{permission.replaceAll("_", " ")}</span>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = { minHeight:"100vh", background:"#F8F7F4", padding:32, fontFamily:"system-ui, sans-serif" };
const hero: React.CSSProperties = { maxWidth:1120, margin:"0 auto 18px", background:"#0F172A", color:"#fff", borderRadius:30, padding:34 };
const eyebrow: React.CSSProperties = { fontSize:11, letterSpacing:".14em", textTransform:"uppercase", fontWeight:950, color:"#F97316", margin:0 };
const title: React.CSSProperties = { fontSize:54, lineHeight:1, margin:"12px 0" };
const sub: React.CSSProperties = { color:"#CBD5E1", fontSize:17, lineHeight:1.6, maxWidth:820 };
const grid: React.CSSProperties = { maxWidth:1120, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:16 };
const card: React.CSSProperties = { background:"#fff", border:"1px solid #E2E8F0", borderRadius:22, padding:22, boxShadow:"0 16px 40px rgba(15,23,42,.06)" };
const cardTitle: React.CSSProperties = { color:"#0F172A", fontSize:24, margin:"8px 0 14px" };
const chips: React.CSSProperties = { display:"flex", gap:8, flexWrap:"wrap" };
const chip: React.CSSProperties = { background:"#FFF7ED", border:"1px solid #FED7AA", color:"#9A3412", borderRadius:999, padding:"7px 10px", fontSize:12, fontWeight:800 };
