import Link from "next/link";
import { buildEvidenceTraceabilityFeed, buildNotificationPreferenceSummary } from "@/lib/scholar-experience";

export default function NotificationsPage() {
  const preferences = buildNotificationPreferenceSummary({
    message: "daily_digest",
    recommendation: "muted",
  });
  const evidenceFeed = buildEvidenceTraceabilityFeed({
    items: [
      { title: "Biology lab reflection", status: "ready", source: "teacher" },
      { title: "Recommendation letter", status: "pending", source: "mentor" },
      { title: "Transcript update", status: "ready", source: "system" },
    ],
  });

  return (
    <main style={page}>
      <header style={header}>
        <p style={eyebrow}>Notifications</p>
        <h1 style={title}>Authorized changes that need your attention.</h1>
        <p style={lead}>This center displays permission-safe events from governed sources. A notification is a prompt to review context, not proof that an outcome occurred.</p>
      </header>
      <section style={panel} aria-labelledby="notification-state">
        <div style={sectionHead}>
          <h2 id="notification-state">Inbox</h2>
          <span style={badge}>2 items queued</span>
        </div>
        <div role="status" style={empty}>
          <strong>Two governance-backed updates are ready for review.</strong>
          <span>Playbook is not inventing messages; it is summarizing the latest evidence and preference-backed delivery state.</span>
          <Link href="/home" style={button}>Return home</Link>
        </div>
      </section>
      <section style={panel} aria-labelledby="notification-controls">
        <h2 id="notification-controls">Your controls</h2>
        <p style={copy}>Open a notification to review its source and resulting state. Marking an item read changes attention state only; it does not approve the underlying action.</p>
        <div style={traceGrid}>
          {evidenceFeed.latest.map((item) => (
            <article key={item.title} style={traceCard}>
              <strong style={traceTitle}>{item.title}</strong>
              <span style={traceMeta}>{item.status} · {item.source}</span>
            </article>
          ))}
        </div>
        <div style={preferenceGrid}>
          {preferences.map((preference) => (
            <article key={preference.key} style={preferenceCard}>
              <strong style={preferenceTitle}>{preference.label}</strong>
              <span style={preferenceMode}>{preference.mode}</span>
            </article>
          ))}
        </div>
        <Link href="/settings" style={textLink}>Manage notification preferences →</Link>
      </section>
      <aside style={boundary}><strong>Recovery:</strong> if you expected an alert, refresh this route or review Settings. Protected event details remain hidden when permission or consent is missing.</aside>
    </main>
  );
}
const page:React.CSSProperties={minHeight:"100vh",background:"#F8F7F4",padding:"clamp(22px,5vw,60px)",color:"#0F172A",fontFamily:"system-ui,sans-serif"}; const header:React.CSSProperties={maxWidth:900,margin:"0 auto 26px"}; const eyebrow:React.CSSProperties={color:"#C2410C",fontWeight:800,textTransform:"uppercase",letterSpacing:".15em",fontSize:11}; const title:React.CSSProperties={fontSize:"clamp(38px,6vw,64px)",lineHeight:1.04,margin:"12px 0"}; const lead:React.CSSProperties={fontSize:17,lineHeight:1.65,color:"#475569"}; const panel:React.CSSProperties={maxWidth:900,margin:"18px auto",background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24}; const sectionHead:React.CSSProperties={display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}; const badge:React.CSSProperties={background:"#F1F5F9",color:"#475569",borderRadius:99,padding:"6px 10px",fontSize:12,fontWeight:700}; const empty:React.CSSProperties={display:"grid",gap:10,background:"#FFF7ED",padding:20,borderRadius:14,color:"#475569"}; const button:React.CSSProperties={justifySelf:"start",background:"#F97316",color:"#fff",textDecoration:"none",padding:"11px 14px",borderRadius:10,fontWeight:800}; const copy:React.CSSProperties={color:"#475569",lineHeight:1.6}; const traceGrid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,margin:"14px 0"}; const traceCard:React.CSSProperties={display:"grid",gap:6,padding:14,borderRadius:14,border:"1px solid #E2E8F0",background:"#FFF7ED"}; const traceTitle:React.CSSProperties={fontSize:13,color:"#0F172A"}; const traceMeta:React.CSSProperties={fontSize:12,color:"#C2410C",fontWeight:700,textTransform:"capitalize"}; const preferenceGrid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12,margin:"14px 0 16px"}; const preferenceCard:React.CSSProperties={display:"grid",gap:6,padding:14,borderRadius:14,border:"1px solid #E2E8F0",background:"#F8FAFC"}; const preferenceTitle:React.CSSProperties={fontSize:13,color:"#0F172A",textTransform:"capitalize"}; const preferenceMode:React.CSSProperties={fontSize:12,color:"#C2410C",fontWeight:700,textTransform:"capitalize"}; const textLink:React.CSSProperties={color:"#C2410C",fontWeight:800,textDecoration:"none"}; const boundary:React.CSSProperties={maxWidth:900,margin:"18px auto",background:"#EFF6FF",borderLeft:"4px solid #2563EB",padding:18,lineHeight:1.6};
