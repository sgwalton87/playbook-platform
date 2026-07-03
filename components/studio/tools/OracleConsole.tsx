"use client";

import { useState } from "react";
import { generateDemoLearner } from "@/lib/studio/tools";
import { askOracle } from "@/lib/oracle";

export default function OracleConsole() {
  const learner = generateDemoLearner();
  const [question, setQuestion] = useState("What scholarships match this student?");
  const answer = askOracle({ question, courses: learner.courses, trustScore: learner.trustScore });

  return (
    <main style={page}>
      <p style={eyebrow}>Oracle Console</p>
      <h1 style={pageTitle}>Ask questions across the learner record.</h1>

      <section style={card}>
        <input value={question} onChange={(e) => setQuestion(e.target.value)} style={input} />
        <div style={answerBox}>
          <strong>{answer.type}</strong>
          <p style={body}>{answer.answer}</p>
          <div style={chips}>{answer.nextActions.map(action => <span key={action} style={chip}>{action}</span>)}</div>
        </div>
      </section>
    </main>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const input: React.CSSProperties = {width:"100%",boxSizing:"border-box",border:"1px solid #E2E8F0",borderRadius:16,padding:14,fontSize:15,fontWeight:800,color:"#0F172A"};
const answerBox: React.CSSProperties = {marginTop:16,border:"1px solid #E2E8F0",borderRadius:16,padding:16};
const chips: React.CSSProperties = {display:"flex",gap:8,flexWrap:"wrap",marginTop:12};
const chip: React.CSSProperties = {background:"#FFF7ED",border:"1px solid #FED7AA",color:"#F97316",borderRadius:999,padding:"7px 10px",fontSize:12,fontWeight:800};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B",lineHeight:1.6};
