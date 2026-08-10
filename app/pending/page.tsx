"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",green:"#10B981",red:"#DC2626",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};
const ROLE_LABELS:Record<string,string>={"scholar":"Scholar","scholar-athlete":"Scholar-Athlete","transition-youth":"Transition-Aged Youth","mentor":"K-12 Mentor / Counselor / Advisor","coach":"Coach","college-admin":"College Administrator","other":"Other"};

export default function PendingPage() {
  const router=useRouter();
  const [profile,setProfile]=useState<LegacyValue>(null);
  const [daysLeft,setDaysLeft]=useState<number|null>(null);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    (async()=>{
      const{data:u}=await supabase.auth.getUser();
      if(!u.user){router.replace("/login");return;}
      const{data:p}=await supabase.from("profiles").select("*").eq("id",u.user.id).single();
      if(!p){router.replace("/login");return;}
      if(p.verification_status==="approved"){router.replace("/dashboard");return;}
      setProfile(p);
      if(p.verification_expires_at){
        const ms=new Date(p.verification_expires_at).getTime()-Date.now();
        setDaysLeft(Math.max(0,Math.ceil(ms/(1000*60*60*24))));
      }
      setLoading(false);
    })();
  },[router]);

  if(loading)return<div data-visual-canon="PGDS-001" style={{minHeight:"100vh",background:"#06172D",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:12,color:"#C7D5E5"}}>Preparing your Playbook…</div>;

  return(
    <div data-visual-canon="PGDS-001" style={{minHeight:"100vh",background:"radial-gradient(circle at 78% 12%,rgba(255,91,31,.2),transparent 28%),linear-gradient(135deg,#06172D,#081D38 56%,#031023)",fontFamily:T.sans,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",padding:"40px 20px"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>
      <div style={{width:"100%",maxWidth:520}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,justifyContent:"center"}}>
          <div style={{width:36,height:36,borderRadius:9,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{fontFamily:T.anton,fontSize:20,color:"#fff"}}>P</span></div>
          <div><div style={{fontFamily:T.anton,fontSize:18,color:T.ink}}>PLAYBOOK</div><div style={{fontFamily:T.mono,fontSize:7,letterSpacing:"0.3em",color:T.orange}}>SERIES INC.</div></div>
        </div>
        {profile?.verification_status==="rejected"?(
          <div style={{background:T.surface,border:"1px solid #FCA5A5",borderRadius:20,padding:"32px 28px",textAlign:"center"}}>
            <div style={{fontSize:48,marginBottom:16}}>❌</div>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink,marginBottom:12,lineHeight:1}}>Verification denied</h1>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.65,marginBottom:24}}>Unfortunately your account was not approved. Contact us if you believe this is an error.</p>
            <a href="mailto:stephishawalton@gmail.com" style={{display:"inline-block",fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",borderRadius:999,padding:"12px 22px",textDecoration:"none"}}>Contact us</a>
          </div>
        ):(
          <div>
            <div style={{background:T.navy,borderRadius:20,padding:"28px",marginBottom:14,position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:T.orange,opacity:.08}}/>
              <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:T.orange,marginBottom:12}}>Verification pending</div>
              <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(24px,4vw,36px)",textTransform:"uppercase",color:"#F8F7F4",lineHeight:1,marginBottom:12}}>Almost there, {profile?.first_name}!</h1>
              <p style={{fontSize:14,color:"rgba(248,247,244,.6)",lineHeight:1.65,marginBottom:20}}>Your <strong style={{color:"#F8F7F4"}}>{ROLE_LABELS[profile?.role]||profile?.role}</strong> account is pending verification. Check your email for next steps.</p>
              {daysLeft!==null&&(
                <div style={{display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,.06)",borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontFamily:T.anton,fontSize:36,color:daysLeft<3?T.orange:T.green,lineHeight:1}}>{daysLeft}</div>
                  <div><div style={{fontSize:13,fontWeight:700,color:"#F8F7F4"}}>days remaining</div><div style={{fontSize:12,color:"rgba(248,247,244,.5)"}}>Request expires after 14 days</div></div>
                </div>
              )}
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"20px 22px",marginBottom:14}}>
              <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>While you wait you can</p>
              {[{icon:"📚",label:"Browse courses",path:"/courses",desc:"View course catalog (read-only)"},{icon:"👤",label:"Complete your profile",path:"/profile",desc:"Finish setting up your profile"},{icon:"🔔",label:"View notifications",path:"/notifications",desc:"See platform updates"}].map(({icon,label,path,desc})=>(
                <div key={label} onClick={()=>router.push(path)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 0",borderBottom:`1px solid ${T.line}`,cursor:"pointer"}}>
                  <div style={{fontSize:22,flexShrink:0}}>{icon}</div>
                  <div style={{flex:1}}><div style={{fontSize:14,fontWeight:600,color:T.ink}}>{label}</div><div style={{fontSize:12,color:T.muted}}>{desc}</div></div>
                  <span style={{color:T.orange}}>→</span>
                </div>
              ))}
            </div>
            <div style={{background:T.orangeL,border:`1px solid ${T.orange}22`,borderRadius:12,padding:"14px 16px",marginBottom:14}}>
              <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:T.orange,marginBottom:8}}>Restricted until verified</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>{["Posting to feed","Direct messages","Adding connections","Full dashboard"].map(r=><span key={r} style={{fontSize:12,color:T.muted,background:T.surface,border:`1px solid ${T.line}`,borderRadius:999,padding:"4px 10px"}}>🔒 {r}</span>)}</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <a href="mailto:stephishawalton@gmail.com" style={{flex:1,fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",borderRadius:12,padding:"13px",textDecoration:"none",textAlign:"center",display:"block"}}>Contact us</a>
              <button onClick={async()=>{await supabase.auth.signOut();router.replace("/login");}} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"transparent",color:T.muted,border:`1.5px solid ${T.line}`,borderRadius:12,padding:"13px 20px",cursor:"pointer"}}>Sign out</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
