"use client";

import { getDocumentationModules } from "@/lib/studio/operations";

export default function DocumentationCenter() {
  const docs = getDocumentationModules();

  return (
    <main style={page}>
      <p style={eyebrow}>Documentation Center</p>
      <h1 style={pageTitle}>The knowledge base of Playbook OS.</h1>
      <section style={grid}>
        {docs.map(doc => (
          <article key={doc} style={card}>
            <p style={eyebrow}>Doc</p>
            <h2 style={title}>{doc}</h2>
            <p style={body}>Tracked by Doc Governor and connected to Playbook OS memory.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:22,padding:20,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
const title: React.CSSProperties = {fontSize:20,color:"#0F172A"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B",lineHeight:1.55};
