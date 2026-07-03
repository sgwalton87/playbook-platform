"use client";

import { getSDKModules } from "@/lib/studio/operations";

export default function SDKExplorer() {
  return (
    <main style={page}>
      <p style={eyebrow}>SDK Explorer</p>
      <h1 style={pageTitle}>Browse the Playbook SDK.</h1>
      <section style={grid}>
        {getSDKModules().map(mod => (
          <article key={mod} style={card}>
            <p style={eyebrow}>Module</p>
            <h2 style={title}>{mod}</h2>
            <p style={body}>Available through the internal Playbook SDK.</p>
          </article>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:22,padding:20,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
const title: React.CSSProperties = {fontSize:22,color:"#0F172A"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B"};
