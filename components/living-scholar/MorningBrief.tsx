"use client";

export default function MorningBrief({ brief }: { brief: any }) {
  return (
    <section style={card}>
      <p style={eyebrow}>Morning Brief</p>
      <h1 style={title}>{brief.headline}</h1>
      <p style={body}>{brief.summary}</p>

      <div style={focusBox}>
        <strong>Today&apos;s Focus</strong>
        <span>{brief.focus}</span>
      </div>

      <div style={impact}>{brief.impact}</div>
    </section>
  );
}

const card: React.CSSProperties = {background:"linear-gradient(135deg,#0F172A,#1E293B)",color:"#fff",borderRadius:30,padding:30,boxShadow:"0 24px 70px rgba(15,23,42,.25)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#FED7AA",margin:0};
const title: React.CSSProperties = {fontSize:46,lineHeight:1,margin:"12px 0"};
const body: React.CSSProperties = {fontSize:16,lineHeight:1.6,color:"#CBD5E1",maxWidth:760};
const focusBox: React.CSSProperties = {display:"grid",gap:6,background:"rgba(255,255,255,.08)",border:"1px solid rgba(255,255,255,.12)",borderRadius:18,padding:16,marginTop:20};
const impact: React.CSSProperties = {display:"inline-flex",marginTop:14,background:"#F97316",color:"#fff",borderRadius:999,padding:"9px 12px",fontWeight:900,fontSize:13};
