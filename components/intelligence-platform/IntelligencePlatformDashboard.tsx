"use client";

import Link from "next/link";
import RecommendationCenter from "./RecommendationCenter";
import ScenarioLab from "./ScenarioLab";

export default function IntelligencePlatformDashboard() {
  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Playbook Intelligence Platform</p>
        <h1 style={title}>Recommendations, scenarios, impact, and explanations.</h1>
        <p style={sub}>Playbook can now suggest next actions and simulate what changes when a learner completes key steps.</p>
        <Link href="/living-scholar" style={button}>Back to Living Scholar →</Link>
      </section>

      <section style={grid}>
        <RecommendationCenter />
        <ScenarioLab />
      </section>
    </main>
  );
}

const page: React.CSSProperties = { minHeight:"100vh", background:"#F8F7F4", padding:32, fontFamily:"system-ui, sans-serif" };
const hero: React.CSSProperties = { maxWidth:1180, margin:"0 auto 18px", background:"#0F172A", color:"#fff", borderRadius:30, padding:34 };
const eyebrow: React.CSSProperties = { fontSize:11, letterSpacing:".14em", textTransform:"uppercase", fontWeight:950, color:"#F97316", margin:0 };
const title: React.CSSProperties = { fontSize:52, lineHeight:1, margin:"12px 0" };
const sub: React.CSSProperties = { color:"#CBD5E1", fontSize:17, lineHeight:1.6, maxWidth:820 };
const button: React.CSSProperties = { display:"inline-flex", marginTop:14, background:"#F97316", color:"#fff", borderRadius:999, padding:"10px 13px", textDecoration:"none", fontWeight:900 };
const grid: React.CSSProperties = { maxWidth:1180, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(360px,1fr))", gap:18 };
