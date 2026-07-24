"use client";

import ProfileAvatar from "@/components/ProfileAvatar";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",green:"#10B981",purple:"#8B5CF6",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};

export default function PortfolioHero({scholarRecord,onDashboard}:{scholarRecord:LegacyValue;onDashboard:()=>void}) {
  const identity = scholarRecord?.identity || {};
  const intelligence = scholarRecord?.intelligence || {};
  const completion = intelligence?.completion?.percent || 0;

  const name = identity.fullName || `${identity.firstName||""} ${identity.lastName||""}`.trim() || "Scholar";
  const role = identity.role === "scholar_athlete" ? "Scholar Athlete" : identity.role || "Scholar";

  return (
    <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:24,overflow:"hidden",marginBottom:14,boxShadow:"0 18px 45px rgba(15,23,42,.08)"}}>
      <div style={{height:150,background:identity.bannerUrl?`url(${identity.bannerUrl}) center/cover`:`linear-gradient(135deg,${T.navy},${T.orange},${T.purple})`,position:"relative"}} />
      <div style={{padding:"0 28px 26px",position:"relative"}}>
        <div style={{marginTop:-58,display:"flex",alignItems:"flex-end",gap:20,flexWrap:"wrap"}}>
          <div style={{padding:5,borderRadius:"50%",background:T.surface,boxShadow:"0 16px 38px rgba(15,23,42,.22)"}}>
            <div style={{padding:4,borderRadius:"50%",background:`linear-gradient(135deg,${T.orange},${T.purple})`}}>
              <ProfileAvatar src={identity.avatarUrl} name={name} size={120}/>
            </div>
          </div>

          <div style={{flex:1,minWidth:240,paddingTop:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6}}>
              <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:36,textTransform:"uppercase",color:T.ink,lineHeight:1}}>
                {name}
              </h1>
              <span style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",background:T.orangeL,color:T.orange,border:`1px solid ${T.orange}22`,borderRadius:999,padding:"6px 10px"}}>
                {role}
              </span>
            </div>

            <p style={{fontFamily:T.mono,fontSize:11,color:T.orange,marginBottom:5}}>
              @{identity.username || "username"}
            </p>

            <p style={{fontSize:13,color:T.muted}}>
              {identity.school || "School not listed"} {identity.graduationYear ? `· Class of ${identity.graduationYear}` : ""}
            </p>
          </div>

          <button onClick={onDashboard} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"transparent",border:`1.5px solid ${T.line}`,color:T.muted,borderRadius:999,padding:"9px 16px",cursor:"pointer"}}>
            ← Dashboard
          </button>
        </div>

        <div style={{marginTop:22,background:T.surface2,borderRadius:16,padding:14}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted}}>
              Portfolio Strength
            </span>
            <span style={{fontFamily:T.anton,fontSize:24,color:T.orange}}>
              {completion}%
            </span>
          </div>
          <div style={{height:10,background:T.line,borderRadius:999,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${completion}%`,background:`linear-gradient(90deg,${T.orange},${T.purple})`,borderRadius:999}} />
          </div>
        </div>
      </div>
    </div>
  );
}
