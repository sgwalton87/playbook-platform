"use client";

import { buildTrustReport } from "@/lib/trust";

type Props = {
  record: LegacyValue;
};

export default function TrustScoreCard({ record }: Props) {
  const report = buildTrustReport(record);

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24,marginBottom:14}}>
      <p style={{fontFamily:"'Space Mono', monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",marginBottom:12}}>
        Trust Engine
      </p>

      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:18,marginBottom:16}}>
        <div>
          <h2 style={{fontFamily:"'Anton', sans-serif",fontSize:32,fontWeight:400,textTransform:"uppercase",color:"#0F172A",lineHeight:1}}>
            Trust Score
          </h2>
          <p style={{fontSize:13,color:"#64748B",marginTop:6}}>
            Measures evidence, verification, outcomes, and impact.
          </p>
        </div>

        <div style={{fontFamily:"'Anton', sans-serif",fontSize:44,color:"#F97316",lineHeight:1}}>
          {report.score}%
        </div>
      </div>

      <div style={{height:10,background:"#EEF2F7",borderRadius:999,overflow:"hidden",marginBottom:16}}>
        <div style={{height:"100%",width:`${report.score}%`,background:"#10B981",borderRadius:999}} />
      </div>

      <p style={{fontSize:12,color:"#64748B",marginBottom:12}}>
        Current trust level: <strong style={{color:"#0F172A",textTransform:"capitalize"}}>{report.level}</strong>
      </p>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
        {report.signals.map((signal)=>(
          <div key={signal.id} style={{border:"1px solid #E2E8F0",borderRadius:14,padding:12}}>
            <div style={{fontSize:12,fontWeight:700,color:"#0F172A"}}>{signal.label}</div>
            <div style={{fontSize:11,color:"#64748B",marginTop:4}}>
              +{signal.points} pts · {signal.verified ? "Verified" : "Signal"}
            </div>
          </div>
        ))}
      </div>

      {report.missing.length > 0 && (
        <div style={{fontSize:12,color:"#64748B",lineHeight:1.6}}>
          <strong style={{color:"#0F172A"}}>Ways to strengthen trust:</strong>
          <ul style={{margin:"8px 0 0 18px"}}>
            {report.missing.slice(0,4).map((item)=>(
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
