"use client";

import { getSystemMapLayers } from "@/lib/studio/operations";

export default function SystemMap() {
  const layers = getSystemMapLayers();

  return (
    <main style={page}>
      <p style={eyebrow}>System Map</p>
      <h1 style={pageTitle}>The product architecture in one view.</h1>
      <section style={map}>
        {layers.map((layer, i) => (
          <div key={layer} style={node}>
            <span style={number}>{i + 1}</span>
            <strong>{layer}</strong>
          </div>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const map: React.CSSProperties = {display:"grid",gap:12,maxWidth:760};
const node: React.CSSProperties = {display:"flex",alignItems:"center",gap:14,background:"#fff",border:"1px solid #E2E8F0",borderRadius:18,padding:16,boxShadow:"0 16px 40px rgba(15,23,42,.06)",color:"#0F172A"};
const number: React.CSSProperties = {width:32,height:32,borderRadius:999,background:"#F97316",color:"#fff",display:"grid",placeItems:"center",fontWeight:950};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
