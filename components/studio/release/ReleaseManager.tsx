"use client";

import { getReleaseChecks } from "@/lib/studio/operations";

export default function ReleaseManager() {
  const checks = getReleaseChecks();

  return (
    <main style={page}>
      <p style={eyebrow}>Release Manager</p>
      <h1 style={pageTitle}>Ready to ship Playbook OS.</h1>
      <section style={card}>
        {checks.map(check => (
          <div key={check.label} style={row}>
            <span style={dot} />
            <strong>{check.label}</strong>
            <span style={status}>Green</span>
          </div>
        ))}
        <button style={button}>Release workflow ready</button>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,display:"grid",gap:14};
const row: React.CSSProperties = {display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid #E2E8F0",borderRadius:14,padding:14,color:"#0F172A"};
const dot: React.CSSProperties = {width:13,height:13,borderRadius:999,background:"#10B981"};
const status: React.CSSProperties = {color:"#166534",fontWeight:900};
const button: React.CSSProperties = {marginTop:10,background:"#F97316",color:"#fff",border:"none",borderRadius:999,padding:"12px 16px",fontWeight:950};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
