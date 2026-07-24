"use client";

import type { ScholarRecord } from "@/lib/scholar";

const T={surface:"#FFFFFF",line:"#E2E8F0",muted:"#64748B",faint:"#94A3B8",mono:"'Space Mono', monospace"};

type Props={ record:ScholarRecord; };

export default function AboutCard({record}:Props){
  const identity=record.identity;
  return(
    <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:20,padding:"20px 24px"}}>
      <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:12}}>About</p>
      <p style={{fontSize:13,color:T.muted,lineHeight:1.65}}>{identity.bio || "No bio added yet."}</p>
      {identity.location && <p style={{fontSize:12,color:T.faint,marginTop:8}}>📍 {identity.location}</p>}
    </div>
  );
}
