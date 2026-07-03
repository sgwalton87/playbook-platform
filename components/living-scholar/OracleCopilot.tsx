"use client";

import Link from "next/link";

export default function OracleCopilot({ oracle }: { oracle: any }) {
  return (
    <section style={card}>
      <p style={eyebrow}>Oracle Copilot</p>
      <h2 style={title}>Ask Playbook what changed</h2>

      <div style={question}>What should I do next?</div>
      <p style={body}>{oracle.answer}</p>

      <Link href="/compass" style={button}>Ask more →</Link>
    </section>
  );
}

const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const title: React.CSSProperties = {fontSize:26,lineHeight:1.1,color:"#0F172A",margin:"8px 0"};
const question: React.CSSProperties = {border:"1px solid #E2E8F0",borderRadius:16,padding:14,color:"#0F172A",fontWeight:900,marginTop:16};
const body: React.CSSProperties = {fontSize:14,lineHeight:1.6,color:"#64748B"};
const button: React.CSSProperties = {display:"inline-flex",marginTop:12,background:"#0F172A",color:"#fff",borderRadius:999,padding:"10px 13px",fontWeight:900,textDecoration:"none",fontSize:13};
