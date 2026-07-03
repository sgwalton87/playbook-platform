"use client";

import { getStudioEventFeed } from "@/lib/studio/tools";

export default function EventMonitor() {
  const events = getStudioEventFeed();

  return (
    <main style={page}>
      <p style={eyebrow}>Event Monitor</p>
      <h1 style={pageTitle}>Live Event Bus simulation.</h1>

      <section style={card}>
        {events.map(event => (
          <div key={event.event} style={eventRow}>
            <span style={dot(event.status)} />
            <div>
              <strong>{event.event}</strong>
              <p style={body}>{event.detail}</p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function dot(status: string): React.CSSProperties {
  return {
    width: 13,
    height: 13,
    borderRadius: 999,
    background: status === "complete" ? "#10B981" : "#F59E0B",
    marginTop: 4,
    flex: "0 0 auto",
  };
}

const page: React.CSSProperties = {padding:30,background:"#F8F7F4",minHeight:"100vh"};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 16px 40px rgba(15,23,42,.06)",display:"grid",gap:16};
const eventRow: React.CSSProperties = {display:"flex",gap:12,color:"#0F172A"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const pageTitle: React.CSSProperties = {fontSize:42,lineHeight:1,color:"#0F172A",margin:"8px 0 22px"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B",margin:"4px 0 0"};
