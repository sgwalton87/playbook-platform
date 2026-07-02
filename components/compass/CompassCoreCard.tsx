"use client";

import { buildCompassReport } from "@/lib/compass";
import { useMemo } from "react";

export default function CompassCoreCard({ courses = [], trustScore = 40 }: { courses?: any[]; trustScore?: number }) {
  const report = useMemo(() => buildCompassReport({ courses, trustScore }), [courses, trustScore]);

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24}}>
      <p style={{fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",fontWeight:800}}>
        Compass AI Core
      </p>

      <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start"}}>
        <div>
          <h1 style={{fontSize:36,lineHeight:1,color:"#0F172A",margin:"8px 0"}}>
            {report.headline}
          </h1>
          <p style={{fontSize:14,color:"#64748B",lineHeight:1.6}}>
            {report.summary}
          </p>
        </div>

        <div style={{fontSize:46,fontWeight:900,color:"#F97316"}}>
          {report.score}%
        </div>
      </div>

      <div style={{display:"grid",gap:12,marginTop:22}}>
        {report.recommendations.map(rec => (
          <div key={rec.id} style={{border:"1px solid #E2E8F0",borderRadius:18,padding:16}}>
            <div style={{fontSize:11,fontWeight:900,color:"#F97316",textTransform:"uppercase"}}>
              {rec.priority} priority
            </div>
            <h3 style={{fontSize:18,color:"#0F172A",margin:"4px 0"}}>
              {rec.title}
            </h3>
            <p style={{fontSize:13,color:"#64748B",lineHeight:1.5}}>
              {rec.explanation}
            </p>
            <ul style={{fontSize:12,color:"#64748B",margin:"8px 0 0 18px"}}>
              {rec.nextSteps.slice(0,3).map(step => <li key={step}>{step}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
