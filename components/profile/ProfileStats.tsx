"use client";

import type { ScholarRecord } from "@/lib/scholar";

const T = {surface:"#FFFFFF",line:"#E2E8F0",ink:"#0F172A",muted:"#64748B",mono:"'Space Mono', monospace",anton:"'Anton', sans-serif"};

type Props = { record:ScholarRecord; };

export default function ProfileStats({record}:Props){
  const stats=[
    {icon:"⚡",label:"XP",value:record.stats.xp},
    {icon:"💰",label:"Coins",value:record.stats.coins},
    {icon:"🎓",label:"Certs",value:record.stats.certificates},
    {icon:"🏅",label:"Badges",value:record.stats.badges},
    {icon:"💬",label:"Posts",value:record.stats.posts},
  ];
  return(
    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:14}}>
      {stats.map(({icon,label,value})=>(
        <div key={label} style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:14,padding:"14px"}}>
          <div style={{fontSize:20,marginBottom:6}}>{icon}</div>
          <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,marginBottom:3}}>{label}</div>
          <div style={{fontFamily:T.anton,fontSize:26,color:T.ink,lineHeight:1}}>{value}</div>
        </div>
      ))}
    </div>
  );
}
