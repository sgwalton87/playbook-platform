"use client";

import { getSupportWorkflow } from "@/lib/workflows";

export default function SupportWorkflowTracker() {
  const workflow = getSupportWorkflow();

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Support Workflow Tracker</p>
        <h1 style={title}>{workflow.scholar}'s opportunity support plan</h1>
        <p style={sub}>{workflow.opportunity}</p>
        <div style={track}><div style={{...fill,width:`${workflow.progress}%`}} /></div>
        <strong>{workflow.progress}% coordinated</strong>
      </section>

      <section style={grid}>
        {workflow.steps.map(step => (
          <article key={step.role} style={card}>
            <p style={eyebrow}>{step.role}</p>
            <h2 style={cardTitle}>{step.task}</h2>
            <span style={badge(step.status)}>{step.status}</span>
          </article>
        ))}
      </section>
    </main>
  );
}

function badge(status: string): React.CSSProperties {
  const color = status === "complete" ? "#10B981" : status === "watching" ? "#2563EB" : "#F97316";
  return {display:"inline-flex",background:color,color:"#fff",borderRadius:999,padding:"7px 10px",fontSize:12,fontWeight:950,textTransform:"uppercase"};
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#F8F7F4",padding:32,fontFamily:"system-ui, sans-serif"};
const hero: React.CSSProperties = {maxWidth:1120,margin:"0 auto 18px",background:"#0F172A",color:"#fff",borderRadius:30,padding:34};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const title: React.CSSProperties = {fontSize:50,lineHeight:1,margin:"12px 0"};
const sub: React.CSSProperties = {fontSize:17,color:"#CBD5E1",lineHeight:1.6};
const track: React.CSSProperties = {height:10,background:"#334155",borderRadius:999,overflow:"hidden",margin:"18px 0 8px"};
const fill: React.CSSProperties = {height:"100%",background:"#F97316",borderRadius:999};
const grid: React.CSSProperties = {maxWidth:1120,margin:"0 auto",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:16};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:22,padding:22,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const cardTitle: React.CSSProperties = {color:"#0F172A",fontSize:22,margin:"8px 0 14px"};
