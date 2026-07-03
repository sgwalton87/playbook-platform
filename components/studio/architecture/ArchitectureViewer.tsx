"use client";

import { useState } from "react";
import { getArchitectureNodes } from "@/lib/studio/operations";

export default function ArchitectureViewer() {
  const nodes = getArchitectureNodes();
  const [active, setActive] = useState(nodes[0]);

  return (
    <main style={page}>
      <Header label="Architecture Viewer" title="Click through Playbook OS." />
      <section style={grid}>
        <div style={nodeGrid}>
          {nodes.map(node => (
            <button key={node.id} onClick={() => setActive(node)} style={{...nodeStyle, borderColor: active.id === node.id ? "#F97316" : "#E2E8F0"}}>
              {node.title}
            </button>
          ))}
        </div>
        <aside style={panel}>
          <p style={eyebrow}>Selected Node</p>
          <h2 style={title}>{active.title}</h2>
          <p style={body}>{active.detail}</p>
        </aside>
      </section>
    </main>
  );
}

function Header({ label, title }: any) {
  return <header style={{marginBottom:22}}><p style={eyebrow}>{label}</p><h1 style={pageTitle}>{title}</h1></header>;
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"2fr 1fr",gap:18};
const nodeGrid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(190px,1fr))",gap:14};
const nodeStyle: React.CSSProperties = {background:"#fff",border:"2px solid #E2E8F0",borderRadius:20,padding:20,fontWeight:950,color:"#0F172A",cursor:"pointer"};
const panel: React.CSSProperties = {background:"#0F172A",color:"#fff",borderRadius:24,padding:24};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0"};
const title: React.CSSProperties = {fontSize:28,margin:"8px 0"};
const body: React.CSSProperties = {fontSize:14,lineHeight:1.6,color:"#CBD5E1"};
