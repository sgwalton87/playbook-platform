"use client";

export default function ScholarTimeline({ timeline }: { timeline: string[] }) {
  return (
    <section style={card}>
      <p style={eyebrow}>Scholar Timeline</p>
      <h2 style={title}>The learner story is building</h2>

      <div style={line}>
        {timeline.map((item, i) => (
          <div key={item} style={step}>
            <div style={dot}>{i + 1}</div>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}

const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const title: React.CSSProperties = {fontSize:26,lineHeight:1.1,color:"#0F172A",margin:"8px 0"};
const line: React.CSSProperties = {display:"grid",gap:12,marginTop:18};
const step: React.CSSProperties = {display:"flex",alignItems:"center",gap:12,color:"#0F172A",fontSize:14};
const dot: React.CSSProperties = {width:30,height:30,borderRadius:999,background:"#10B981",color:"#fff",display:"grid",placeItems:"center",fontWeight:900};
