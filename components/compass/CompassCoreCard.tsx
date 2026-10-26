"use client";

import { buildCompassReport } from "@/lib/compass";
import { useMemo } from "react";

export default function CompassCoreCard({ courses = [], trustScore = 0, dataState = "ready" }: { courses?: LegacyValue[]; trustScore?: number; dataState?: "loading" | "ready" | "error" }) {
  const report = useMemo(() => buildCompassReport({ courses, trustScore }), [courses, trustScore]);

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:"clamp(16px,4vw,24px)",minWidth:0,maxWidth:"100%",boxSizing:"border-box",overflowWrap:"anywhere"}}>
      <p style={{fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",fontWeight:800}}>
        Compass guidance · provisional
      </p>

      {dataState === "loading" && <p role="status">Connecting your verified academic record…</p>}
      {dataState === "error" && <p role="alert">Compass could not load your private record. No sample record has been substituted.</p>}
      {dataState === "ready" && courses.length === 0 && (
        <p role="status" style={{color:"#475569",lineHeight:1.6}}>
          No verified course evidence is connected yet. Add a transcript or academic evidence to start building verified guidance.
        </p>
      )}

      {dataState === "ready" && courses.length > 0 && <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr)",gap:12,alignItems:"start"}}>
        <div>
          <h1 style={{fontSize:"clamp(27px,7vw,36px)",lineHeight:1.12,color:"#0F172A",margin:"8px 0",overflowWrap:"anywhere"}}>
            {report.headline}
          </h1>
          <p style={{fontSize:14,color:"#64748B",lineHeight:1.6}}>
            This is provisional guidance from recorded course information, not a verified academic score. {report.summary}
          </p>
        </div>

        <div style={{fontSize:14,fontWeight:700,color:"#64748B"}}>
          <span style={{fontSize:14,fontWeight:700,color:"#64748B"}}>Score pending verified evidence</span>
        </div>
      </div>}

      {dataState === "ready" && courses.length > 0 && <div style={{display:"grid",gap:12,marginTop:22}}>
        {report.recommendations.filter(rec => !/active matches|review matched opportunities/i.test(rec.title+" "+rec.explanation)).map(rec => (
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
      </div>}
    </section>
  );
}
