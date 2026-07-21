"use client";

import { getDemoSupportNetwork } from "@/lib/support-network";

export default function SupportNetworkMap() {
  const network = getDemoSupportNetwork();

  return (
    <main style={page}>
      <section style={hero}>
        <p style={eyebrow}>Support Network Map</p>
        <h1 style={title}>Everyone around {network.scholar} is connected.</h1>
        <p style={sub}>The Scholar Record becomes the shared center of coordination.</p>
      </section>

      <section style={map}>
        <div style={center}>{network.center}</div>
        {network.nodes.map((node, i) => (
          <article key={node.role} style={{...card, transform:`rotate(${i*51}deg) translate(190px) rotate(-${i*51}deg)`}}>
            <p style={eyebrow}>{node.role}</p>
            <strong>{node.name}</strong>
            <span>{node.connection}</span>
          </article>
        ))}
      </section>
    </main>
  );
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#F8F7F4",padding:32,fontFamily:"system-ui, sans-serif"};
const hero: React.CSSProperties = {maxWidth:1120,margin:"0 auto 18px",background:"#0F172A",color:"#fff",borderRadius:30,padding:34};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const title: React.CSSProperties = {fontSize:50,lineHeight:1,margin:"12px 0"};
const sub: React.CSSProperties = {fontSize:17,color:"#CBD5E1"};
const map: React.CSSProperties = {maxWidth:900,height:620,margin:"0 auto",position:"relative",display:"grid",placeItems:"center"};
const center: React.CSSProperties = {width:150,height:150,borderRadius:999,background:"#0F172A",color:"#fff",display:"grid",placeItems:"center",textAlign:"center",fontWeight:950,boxShadow:"0 24px 70px rgba(15,23,42,.25)",zIndex:2};
const card: React.CSSProperties = {position:"absolute",width:190,background:"#fff",border:"1px solid #E2E8F0",borderRadius:18,padding:16,boxShadow:"0 16px 40px rgba(15,23,42,.08)",display:"grid",gap:5,color:"#0F172A",fontSize:13};
