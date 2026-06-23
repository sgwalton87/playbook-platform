"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",green:"#10B981",amber:"#F59E0B",purple:"#8B5CF6",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};
const ALL=[
  {slug:"college-application-playbook",title:"College Application Playbook",pillar:"College",color:T.blue,era:"ERA 1/5",rarity:"UNCOMMON",rarityColor:T.orange,gradient:"linear-gradient(135deg,#0EA5E9,#3B82F6,#8B5CF6,#10B981)"},
  {slug:"captains-mindset",title:"Captain's Mindset",pillar:"Leadership",color:T.orange,era:"ERA 2/5",rarity:"UNCOMMON",rarityColor:T.orange,gradient:"linear-gradient(135deg,#F59E0B,#F97316,#8B5CF6,#3B82F6)"},
  {slug:"social-emotional-foundations",title:"Social-Emotional Foundations",pillar:"SEL",color:T.purple,era:"ERA 3/5",rarity:"UNCOMMON",rarityColor:T.orange,gradient:"linear-gradient(135deg,#8B5CF6,#EC4899,#3B82F6,#8B5CF6)"},
  {slug:"nil-readiness-for-athletes",title:"NIL Readiness for Athletes",pillar:"NIL",color:T.amber,era:"ERA 4/5",rarity:"RARE",rarityColor:T.amber,gradient:"linear-gradient(135deg,#F59E0B,#F97316,#10B981,#3B82F6)"},
  {slug:"civic-engagement-for-young-leaders",title:"Civic Engagement for Young Leaders",pillar:"Civic",color:T.green,era:"ERA 5/5",rarity:"RARE",rarityColor:T.amber,gradient:"linear-gradient(135deg,#10B981,#3B82F6,#F59E0B,#10B981)"},
  {slug:"money-in-the-game",title:"Money in the Game",pillar:"Finance",color:T.blue,era:"BONUS",rarity:"COMMON",rarityColor:"#94A3B8",gradient:"linear-gradient(135deg,#3B82F6,#8B5CF6,#10B981,#3B82F6)"},
  {slug:"mind-of-an-athlete",title:"Mind of an Athlete",pillar:"SEL",color:T.purple,era:"BONUS",rarity:"UNCOMMON",rarityColor:T.orange,gradient:"linear-gradient(135deg,#8B5CF6,#EC4899,#3B82F6,#8B5CF6)"},
];

function Card({cert,earned,size="lg"}:{cert:typeof ALL[0];earned:boolean;size?:"sm"|"lg"}) {
  const w=size==="lg"?220:150;const iconSize=size==="lg"?72:48;const titleSize=size==="lg"?13:9;const subSize=size==="lg"?9:7;const pad=size==="lg"?"22px 18px":"14px 12px";const minH=size==="lg"?280:190;
  return(
    <div style={{position:"relative",borderRadius:size==="lg"?20:14,padding:3,background:earned?cert.gradient:"linear-gradient(135deg,#1E293B,#334155)",boxShadow:earned?"0 16px 48px rgba(0,0,0,.3)":"0 4px 16px rgba(0,0,0,.15)",width:w,flexShrink:0}}>
      <div style={{background:T.navy,borderRadius:size==="lg"?17:11,padding:pad,minHeight:minH,display:"flex",flexDirection:"column",alignItems:"center",opacity:earned?1:0.4}}>
        <div style={{display:"flex",justifyContent:"space-between",width:"100%",marginBottom:size==="lg"?16:10}}>
          <span style={{fontFamily:T.mono,fontSize:subSize,color:"rgba(255,255,255,.4)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{cert.era}</span>
          <span style={{fontFamily:T.mono,fontSize:subSize,background:cert.rarityColor,color:cert.rarity==="COMMON"?"#0F172A":"#fff",padding:"2px 7px",borderRadius:4,fontWeight:700}}>{cert.rarity}</span>
        </div>
        <div style={{width:iconSize,height:iconSize,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:`2px solid ${earned?cert.color:"#334155"}`,boxShadow:earned?`0 0 20px ${cert.color}44`:"none",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size==="lg"?34:22,marginBottom:size==="lg"?16:10}}>
          {earned?"🎓":"🔒"}
        </div>
        <div style={{fontFamily:T.anton,fontSize:titleSize,color:earned?cert.color:"#475569",textTransform:"uppercase",textAlign:"center",letterSpacing:"0.04em",marginBottom:4,lineHeight:1.2}}>{cert.title}</div>
        <div style={{fontFamily:T.mono,fontSize:subSize,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"0.12em",marginBottom:size==="lg"?14:10}}>{cert.pillar}</div>
        {size==="lg"&&<div style={{display:"flex",gap:4,marginBottom:12}}>{["★","★","☆","☆","☆"].map((s,i)=><span key={i} style={{fontSize:11,color:earned?cert.rarityColor:"#334155"}}>{s}</span>)}</div>}
        <div style={{marginTop:"auto",paddingTop:size==="lg"?12:8,width:"100%",borderTop:"1px solid rgba(255,255,255,.08)",textAlign:"center"}}>
          <div style={{fontFamily:T.mono,fontSize:subSize-1,color:"rgba(255,255,255,.2)",letterSpacing:"0.08em",textTransform:"uppercase"}}>PLAYBOOK SERIES VALIDATED</div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesPage() {
  const router=useRouter();
  const [earnedSlugs,setEarnedSlugs]=useState<string[]>([]);
  const [earnedDates,setEarnedDates]=useState<Record<string,string>>({});
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const{data:u}=await supabase.auth.getUser();
      if(!u.user){router.replace("/login");return;}
      const{data:certs}=await supabase.from("certificates").select("course_slug,issued_at").eq("user_id",u.user.id).order("issued_at",{ascending:false});
      if(certs){
        setEarnedSlugs(certs.map(c=>c.course_slug));
        const dates:Record<string,string>={};
        certs.forEach(c=>{dates[c.course_slug]=new Date(c.issued_at).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"});});
        setEarnedDates(dates);
      }
      setLoading(false);
    })();
  },[]);

  const earned=ALL.filter(c=>earnedSlugs.includes(c.slug));
  const locked=ALL.filter(c=>!earnedSlugs.includes(c.slug));

  if(loading)return<div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:12,color:T.faint}}>Loading</div>;

  return(
    <div style={{minHeight:"100vh",background:T.cream,fontFamily:T.sans,color:T.ink}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}::selection{background:${T.orange};color:#fff;}.pb-cert{transition:transform 0.2s ease;}.pb-cert:hover{transform:translateY(-8px) rotate(-1deg)!important;}.pb-locked:hover{transform:translateY(-4px)!important;cursor:pointer;}`}</style>
      <div style={{padding:"32px 36px",maxWidth:1000}}>
        <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Your collection</p>
        <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(32px,4vw,48px)",textTransform:"uppercase",color:T.ink,lineHeight:.95,marginBottom:20}}>Certificate <span style={{color:T.orange}}>Cards</span></h1>
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:28}}>
          {[{icon:"🎓",label:"Earned",value:earned.length,color:T.green},{icon:"🔒",label:"Remaining",value:locked.length,color:T.muted},{icon:"⭐",label:"Total possible",value:ALL.length,color:T.orange}].map(({icon,label,value,color})=>(
            <div key={label} style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:14,padding:"16px 18px",display:"flex",alignItems:"center",gap:12}}>
              <div style={{fontSize:26}}>{icon}</div>
              <div>
                <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.12em",textTransform:"uppercase",color:T.muted,marginBottom:3}}>{label}</div>
                <div style={{fontFamily:T.anton,fontSize:28,fontWeight:400,color,lineHeight:1}}>{value}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{marginTop:36,background:T.navy,borderRadius:20,padding:"24px 28px"}}>
          <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:16}}>How certificates work</p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
            {[{icon:"📚",title:"Complete a course",desc:"Finish all modules to unlock your certificate."},{icon:"🎓",title:"Claim your card",desc:"One click saves it to your profile transcript and public page instantly."},{icon:"✨",title:"Community sees it",desc:"Your achievement posts to the network automatically when you claim."}].map(({icon,title,desc})=>(
              <div key={title} style={{background:"rgba(255,255,255,.05)",borderRadius:14,padding:"16px 14px"}}>
                <div style={{fontSize:26,marginBottom:10}}>{icon}</div>
                <div style={{fontSize:13,fontWeight:700,color:"#F8F7F4",marginBottom:6}}>{title}</div>
                <div style={{fontSize:12,color:"rgba(248,247,244,.4)",lineHeight:1.65}}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {earned.length>0?(
          <div style={{marginBottom:36}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{height:2,flex:1,background:T.orange,opacity:.3}}/>
              <span style={{fontFamily:T.anton,fontSize:18,textTransform:"uppercase",color:T.orange,letterSpacing:"0.04em"}}>Earned Certificates</span>
              <div style={{height:2,flex:1,background:T.orange,opacity:.3}}/>
            </div>
            <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
              {earned.map(c=>(
                <div key={c.slug} className="pb-cert">
                  <Card cert={c} earned size="lg"/>
                  <div style={{marginTop:14,textAlign:"center"}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:3}}>{c.title}</div>
                    <div style={{fontFamily:T.mono,fontSize:9,color:T.muted,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:4}}>{c.pillar} · {c.rarity}</div>
                    {earnedDates[c.slug]&&<div style={{fontFamily:T.mono,fontSize:9,color:T.faint,marginBottom:8}}>Earned {earnedDates[c.slug]}</div>}
                    <button onClick={()=>{const text=`I just earned the "${c.title}" certificate on @PlaybookSeriesInc! #ScholarAthlete #RunIt`;window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,"_blank");}} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"8px 16px",cursor:"pointer"}}>Share</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ):(
          <div style={{background:T.navy,borderRadius:20,padding:"28px 28px",marginBottom:32}}>
            <div style={{display:"flex",alignItems:"center",gap:20,flexWrap:"wrap"}}>
              <div style={{display:"flex",gap:12}}>{ALL.map((c,i)=><div key={c.slug} style={{transform:`rotate(${(i-1.5)*4}deg)`}}><Card cert={c} earned={false} size="sm"/></div>)}</div>
              <div style={{flex:1,minWidth:220}}>
                <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.orange,marginBottom:10}}>No certificates yet</div>
                <h3 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(20px,3vw,28px)",textTransform:"uppercase",color:"#F8F7F4",lineHeight:1,marginBottom:10}}>Complete a course to unlock your first card</h3>
                <p style={{fontSize:13,color:"rgba(248,247,244,.45)",lineHeight:1.65,marginBottom:18}}>Each certificate appears on your profile and public page automatically.</p>
                <button onClick={()=>router.push("/courses")} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"12px 22px",cursor:"pointer"}}>Go to courses</button>
              </div>
            </div>
          </div>
        )}
        {locked.length>0&&(
          <div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{height:1,flex:1,background:T.line}}/>
              <span style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.muted}}>Complete the course to unlock</span>
              <div style={{height:1,flex:1,background:T.line}}/>
            </div>
            <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
              {locked.map(c=>(
                <div key={c.slug} className="pb-locked" onClick={()=>router.push(`/courses/${c.slug}`)}>
                  <Card cert={c} earned={false} size="lg"/>
                  <div style={{marginTop:12,textAlign:"center"}}>
                    <div style={{fontSize:12,fontWeight:600,color:T.muted,marginBottom:2}}>{c.title}</div>
                    <div style={{fontFamily:T.mono,fontSize:9,color:T.faint,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6}}>{c.pillar} · {c.rarity}</div>
                    <div style={{fontFamily:T.mono,fontSize:9,color:T.orange,fontWeight:700}}>Start course</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
