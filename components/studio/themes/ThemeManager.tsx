"use client";

import { getThemes } from "@/lib/studio/operations";

export default function ThemeManager() {
  return (
    <main style={page}>
      <p style={eyebrow}>Theme Manager</p>
      <h1 style={pageTitle}>Preview Playbook identities.</h1>
      <section style={grid}>
        {getThemes().map(theme => (
          <article key={theme.name} style={card}>
            <div style={{...swatch,background:theme.accent}} />
            <h2 style={title}>{theme.name}</h2>
            <p style={body}>{theme.description}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:16};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:22,padding:20,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const swatch: React.CSSProperties = {width:44,height:44,borderRadius:999,marginBottom:14};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
const title: React.CSSProperties = {fontSize:22,color:"#0F172A"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B",lineHeight:1.55};
