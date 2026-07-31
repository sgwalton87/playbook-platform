import Link from "next/link";

const modules = [
  { title: "Build your Scholar Record", body: "Add identity, academic, and goal evidence before Playbook offers guidance.", href: "/profile", action: "Review profile" },
  { title: "Plan your journey", body: "Set the future you want and keep every decision under your control.", href: "/journey", action: "Open journey" },
  { title: "Explore opportunities", body: "Review sourced options only when the evidence and eligibility context are available.", href: "/opportunities", action: "View opportunities" },
];

export default function HomePage() {
  return (
    <main style={page}>
      <section style={hero} aria-labelledby="home-title">
        <p style={eyebrow}>Scholar home</p>
        <h1 id="home-title" style={title}>Own what comes next.</h1>
        <p style={subtitle}>Your home connects your Scholar Record, goals, opportunities, and trusted support without inventing progress or deciding for you.</p>
        <Link href="/journey" style={primary}>Choose a next step</Link>
      </section>
      <section aria-labelledby="current-state" style={section}>
        <h2 id="current-state" style={sectionTitle}>Current state</h2>
        <div role="status" style={notice}>
          <strong>No verified summary is available yet.</strong>
          <span>Complete or review your Scholar Record to create an evidence-backed starting point.</span>
        </div>
      </section>
      <section aria-labelledby="next-actions" style={section}>
        <h2 id="next-actions" style={sectionTitle}>Your next actions</h2>
        <div style={grid}>{modules.map((item) => <article key={item.title} style={card}><h3 style={cardTitle}>{item.title}</h3><p style={body}>{item.body}</p><Link href={item.href} style={link}>{item.action} →</Link></article>)}</div>
      </section>
      <aside style={trust} aria-label="Guidance boundary"><strong>Guidance stays advisory.</strong> Recommendations require evidence, an explanation, and your confirmation before any action.</aside>
    </main>
  );
}

const page: React.CSSProperties={minHeight:"100vh",background:"#F8F7F4",color:"#0F172A",padding:"clamp(20px,5vw,64px)",fontFamily:"system-ui,sans-serif"};
const hero: React.CSSProperties={maxWidth:1100,margin:"0 auto",background:"#0F172A",color:"#fff",borderRadius:28,padding:"clamp(28px,6vw,64px)"};
const eyebrow: React.CSSProperties={textTransform:"uppercase",letterSpacing:".16em",fontSize:11,fontWeight:800,color:"#FDBA74"};
const title: React.CSSProperties={fontSize:"clamp(42px,7vw,76px)",lineHeight:1,margin:"12px 0"};
const subtitle: React.CSSProperties={fontSize:18,lineHeight:1.6,maxWidth:720,color:"#CBD5E1",marginBottom:28};
const primary: React.CSSProperties={display:"inline-block",background:"#F97316",color:"#fff",padding:"13px 18px",borderRadius:12,textDecoration:"none",fontWeight:800};
const section: React.CSSProperties={maxWidth:1100,margin:"32px auto 0"};
const sectionTitle: React.CSSProperties={fontSize:24,marginBottom:14};
const notice: React.CSSProperties={display:"grid",gap:6,background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:16,padding:20};
const grid: React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16};
const card: React.CSSProperties={background:"#fff",border:"1px solid #E2E8F0",borderRadius:18,padding:22};
const cardTitle: React.CSSProperties={margin:"0 0 8px",fontSize:19};
const body: React.CSSProperties={color:"#475569",lineHeight:1.6};
const link: React.CSSProperties={color:"#C2410C",fontWeight:800,textDecoration:"none"};
const trust: React.CSSProperties={maxWidth:1100,margin:"24px auto 0",padding:18,borderLeft:"4px solid #2563EB",background:"#EFF6FF",lineHeight:1.6};
