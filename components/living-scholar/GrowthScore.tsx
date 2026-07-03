"use client";

export default function GrowthScore({ score }: { score: number }) {
  return (
    <section style={card}>
      <p style={eyebrow}>Daily Growth Score</p>
      <div style={scoreStyle}>{score}%</div>
      <p style={body}>Your Playbook is becoming more complete as you add evidence, courses, opportunities, and verified milestones.</p>
    </section>
  );
}

const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const scoreStyle: React.CSSProperties = {fontSize:64,lineHeight:1,color:"#0F172A",fontWeight:950,margin:"12px 0"};
const body: React.CSSProperties = {fontSize:14,lineHeight:1.6,color:"#64748B"};
