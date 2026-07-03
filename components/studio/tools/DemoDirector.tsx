"use client";

import Link from "next/link";
import { getDemoDirectorAudiences } from "@/lib/studio/tools";

export default function DemoDirector() {
  const audiences = getDemoDirectorAudiences();

  return (
    <main style={page}>
      <Header label="Demo Director" title="Choose the story for the room." />
      <section style={grid}>
        {audiences.map((item) => (
          <article key={item.audience} style={card}>
            <p style={eyebrow}>{item.audience}</p>
            <h2 style={title}>{item.title}</h2>
            <p style={body}>{item.focus}</p>
            <Link href={item.path} style={button}>Launch demo →</Link>
          </article>
        ))}
      </section>
    </main>
  );
}

function Header({ label, title }: any) {
  return (
    <header style={{marginBottom:22}}>
      <p style={eyebrow}>{label}</p>
      <h1 style={pageTitle}>{title}</h1>
    </header>
  );
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const grid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:22,padding:20,boxShadow:"0 16px 40px rgba(15,23,42,.06)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0"};
const title: React.CSSProperties = {fontSize:22,color:"#0F172A",margin:"8px 0"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B",lineHeight:1.55};
const button: React.CSSProperties = {display:"inline-flex",marginTop:12,background:"#F97316",color:"#fff",borderRadius:999,padding:"10px 13px",fontWeight:900,textDecoration:"none",fontSize:13};
