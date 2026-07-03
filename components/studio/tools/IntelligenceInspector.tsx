"use client";

import { generateDemoLearner, inspectLearnerIntelligence } from "@/lib/studio/tools";

export default function IntelligenceInspector() {
  const learner = generateDemoLearner();
  const stages = inspectLearnerIntelligence(learner.courses, learner.trustScore);

  return (
    <main style={page}>
      <p style={eyebrow}>Intelligence Inspector</p>
      <h1 style={pageTitle}>Watch the engines work.</h1>

      <section style={flow}>
        {stages.map((stage, i) => (
          <article key={stage.stage} style={card}>
            <div style={number}>{i + 1}</div>
            <div>
              <p style={eyebrow}>{stage.status}</p>
              <h2 style={title}>{stage.stage}</h2>
              <p style={body}>{stage.output}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const flow: React.CSSProperties = {display:"grid",gap:14};
const card: React.CSSProperties = {display:"flex",gap:14,background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:18,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const number: React.CSSProperties = {width:34,height:34,borderRadius:999,background:"#0F172A",color:"#fff",display:"grid",placeItems:"center",fontWeight:950,flex:"0 0 auto"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
const title: React.CSSProperties = {fontSize:22,color:"#0F172A",margin:"6px 0"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B",lineHeight:1.55};
