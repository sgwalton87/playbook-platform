"use client";

import { buildScholarTimeline } from "@/lib/timeline";

type Props = {
  record: LegacyValue;
};

export default function ScholarTimeline({ record }: Props) {
  const events = buildScholarTimeline(record).slice(0, 8);

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24,marginBottom:14}}>
      <p style={{fontFamily:"'Space Mono', monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",marginBottom:12}}>
        Scholar Timeline
      </p>

      {events.length === 0 ? (
        <p style={{fontSize:13,color:"#94A3B8"}}>No timeline events yet.</p>
      ) : (
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {events.map((event:LegacyValue)=>(
            <div key={event.id} style={{borderLeft:"3px solid #F97316",paddingLeft:14}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                <strong style={{fontSize:14,color:"#0F172A"}}>{event.title}</strong>
                <span style={{fontSize:11,color:"#94A3B8",whiteSpace:"nowrap"}}>
                  {event.date ? new Date(event.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"}) : "—"}
                </span>
              </div>

              {event.description && (
                <p style={{fontSize:12,color:"#64748B",lineHeight:1.5,marginTop:4}}>
                  {event.description}
                </p>
              )}

              <span style={{display:"inline-block",marginTop:6,fontSize:10,color:event.verified?"#10B981":"#94A3B8"}}>
                {event.verified ? "✓ Verified" : "Community Signal"} · {event.type}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
