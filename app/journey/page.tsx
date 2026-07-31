import Link from "next/link";

const stages = ["Identity", "Story", "Goals", "Journey", "Opportunities", "Connections", "Growth"];

export default function JourneyPage() {
  return <main style={page}>
    <header style={header}><p style={eyebrow}>Growth journey</p><h1 style={title}>Your path, backed by your evidence.</h1><p style={lead}>Revisit goals at any time. Playbook preserves the history and never treats a suggestion as your decision.</p></header>
    <section style={panel} aria-labelledby="journey-status"><h2 id="journey-status">Journey status</h2><div role="status" style={empty}><strong>No confirmed journey milestones yet.</strong><span>Start with your identity and goals. A milestone appears only after you confirm it and supporting evidence is available.</span><Link href="/profile" style={button}>Review your identity</Link></div></section>
    <section style={panel} aria-labelledby="journey-map"><h2 id="journey-map">Journey map</h2><ol style={timeline}>{stages.map((stage,index)=><li key={stage} style={step}><span aria-hidden="true" style={dot}>{index+1}</span><div><strong>{stage}</strong><p style={copy}>{index===0?"Your owned Scholar Record is the starting point.":"Locked until the prior context is confirmed."}</p></div></li>)}</ol></section>
    <aside style={boundary}><strong>Human confirmation required.</strong> Guidance may explain a possible next step, its evidence, confidence, and alternatives. You choose whether to accept, revise, or reject it.</aside>
  </main>;
}
const page:React.CSSProperties={minHeight:"100vh",background:"#F8F7F4",padding:"clamp(22px,5vw,60px)",color:"#0F172A",fontFamily:"system-ui,sans-serif"};
const header:React.CSSProperties={maxWidth:900,margin:"0 auto 28px"}; const eyebrow:React.CSSProperties={color:"#C2410C",fontWeight:800,textTransform:"uppercase",letterSpacing:".15em",fontSize:11}; const title:React.CSSProperties={fontSize:"clamp(38px,6vw,64px)",lineHeight:1.04,margin:"12px 0"}; const lead:React.CSSProperties={color:"#475569",fontSize:17,lineHeight:1.65};
const panel:React.CSSProperties={maxWidth:900,margin:"18px auto",background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24}; const empty:React.CSSProperties={display:"grid",gap:10,padding:20,background:"#FFF7ED",borderRadius:14,color:"#475569"}; const button:React.CSSProperties={justifySelf:"start",background:"#F97316",color:"#fff",textDecoration:"none",padding:"11px 14px",borderRadius:10,fontWeight:800};
const timeline:React.CSSProperties={listStyle:"none",padding:0,display:"grid",gap:12}; const step:React.CSSProperties={display:"flex",gap:14,alignItems:"flex-start",borderBottom:"1px solid #E2E8F0",padding:"12px 0"}; const dot:React.CSSProperties={width:30,height:30,borderRadius:99,background:"#E2E8F0",display:"grid",placeItems:"center",fontWeight:800,flexShrink:0}; const copy:React.CSSProperties={margin:"4px 0",color:"#64748B"}; const boundary:React.CSSProperties={maxWidth:900,margin:"18px auto",background:"#EFF6FF",borderLeft:"4px solid #2563EB",padding:18,lineHeight:1.6};
