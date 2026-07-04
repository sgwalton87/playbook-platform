"use client";

import { buildRecommendations } from "@/lib/intelligence-platform";

export default function RecommendationCenter() {
  const recommendations = buildRecommendations({
    academicProgress: 76,
    trustScore: 72,
    opportunities: 4,
    role: "scholar",
  });

  return (
    <section style={card}>
      <p style={eyebrow}>Recommendation Center</p>
      <h2 style={title}>Ranked next actions</h2>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {recommendations.map((rec) => (
          <article key={rec.id} style={item}>
            <div style={top}>
              <strong>{rec.title}</strong>
              <span style={badge(rec.priority)}>{rec.priority}</span>
            </div>
            <p style={body}>{rec.reason}</p>
            <div style={action}>{rec.action}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function badge(priority: string): React.CSSProperties {
  return {
    background: priority === "high" ? "#DC2626" : "#F97316",
    color: "#fff",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 950,
    textTransform: "uppercase",
  };
}

const card: React.CSSProperties = { background:"#fff", border:"1px solid #E2E8F0", borderRadius:24, padding:24, boxShadow:"0 16px 40px rgba(15,23,42,.06)" };
const eyebrow: React.CSSProperties = { fontSize:11, letterSpacing:".14em", textTransform:"uppercase", fontWeight:950, color:"#F97316", margin:0 };
const title: React.CSSProperties = { fontSize:26, color:"#0F172A", margin:"8px 0" };
const item: React.CSSProperties = { border:"1px solid #E2E8F0", borderRadius:18, padding:16 };
const top: React.CSSProperties = { display:"flex", justifyContent:"space-between", gap:12, color:"#0F172A" };
const body: React.CSSProperties = { color:"#64748B", fontSize:14, lineHeight:1.55 };
const action: React.CSSProperties = { background:"#FFF7ED", border:"1px solid #FED7AA", color:"#9A3412", borderRadius:12, padding:10, fontWeight:800, fontSize:13 };
