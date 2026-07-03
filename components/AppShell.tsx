"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProfileAvatar from "@/components/ProfileAvatar";

const NAV=[
  {label:"Demo",href:"/demo",icon:"🎤"},
  {label:"Journey",href:"/journey",icon:"🚀"},
  {label:"Home",href:"/home",icon:"✨"},
  {label:"Dashboard",href:"/dashboard",icon:"🏠"},
  {label:"Profile",href:"/profile",icon:"👤"},
  {label:"Feed",href:"/feed",icon:"💬"},
  {label:"Opportunities",href:"/opportunities",icon:"🧭"},
  {label:"Courses",href:"/courses",icon:"📚"},
  {label:"Transcript",href:"/transcript",icon:"🎓"},
  {label:"Certificates",href:"/certificates",icon:"🎖️"},
  {label:"Notifications",href:"/notifications",icon:"🔔"},
  {label:"Connections",href:"/connections",icon:"🤝"},
  {label:"Mentorship",href:"/mentorship",icon:"🧭"},
  {label:"Events",href:"/events",icon:"📅"},
  {label:"Leaderboard",href:"/leaderboard",icon:"🏆"},
  {label:"Messages",href:"/messages",icon:"✉️"},
  {label:"Analytics",href:"/analytics",icon:"📊"},
  {label:"Store",href:"/store",icon:"🛒"},
  {label:"Badges",href:"/badges",icon:"🏅"},
];

export default function AppShell({children,title="Playbook"}:{children:React.ReactNode;title?:string}) {
  const router=useRouter();
  const pathname=usePathname();
  const [profile,setProfile]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [open,setOpen]=useState(true);
  const NAVY="#0F172A",NAVY2="#1E293B",CREAM="#F8F7F4",MUTED="rgba(248,247,244,.55)",LINE="rgba(255,255,255,.10)",ORANGE="#F97316",BG="#F8F7F4",INK="#0F172A";
  const W=open?285:68;

  useEffect(()=>{
    (async()=>{
      const{data}=await supabase.auth.getUser();
      if(!data.user){router.replace("/login");return;}
      const{data:p}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
      if(!p){router.replace("/onboarding");return;}
      setProfile(p);setLoading(false);
    })();
  },[router]);

  const logout=async()=>{await supabase.auth.signOut();router.replace("/login");};
  const goPublic=()=>{if(profile?.username)router.push(`/u/${profile.username}`);else router.push("/profile");};

  if(loading)return<div style={{minHeight:"100vh",background:BG,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Space Mono',monospace",fontSize:12,color:"#94A3B8"}}>Loading...</div>;

  return(
    <div style={{minHeight:"100vh",background:BG,color:INK,display:"flex",fontFamily:"'Hanken Grotesk',system-ui,sans-serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *{box-sizing:border-box;}button{font-family:inherit;}a{color:inherit;text-decoration:none;}
        ::-webkit-scrollbar{width:3px;}::-webkit-scrollbar-thumb{background:#334155;border-radius:999px;}
        .pb-nb:hover{background:${NAVY2}!important;color:${CREAM}!important;}
        .pb-hm:hover{background:${NAVY2}!important;}
      `}</style>

      <aside style={{width:W,flexShrink:0,background:NAVY,color:CREAM,position:"fixed",top:0,left:0,height:"100vh",zIndex:50,display:"flex",flexDirection:"column",transition:"width 0.22s cubic-bezier(.4,0,.2,1)",overflow:"hidden",borderRight:`1px solid ${LINE}`}}>

        {/* Hamburger + logo */}
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 14px 12px",borderBottom:`1px solid ${LINE}`,flexShrink:0}}>
          <button onClick={()=>setOpen(!open)} className="pb-hm"
            style={{width:36,height:36,borderRadius:8,background:"transparent",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4,flexShrink:0,padding:0,transition:"background 0.15s"}}>
            <span style={{width:16,height:2,background:CREAM,borderRadius:999,display:"block"}}/>
            <span style={{width:16,height:2,background:CREAM,borderRadius:999,display:"block"}}/>
            <span style={{width:16,height:2,background:CREAM,borderRadius:999,display:"block"}}/>
          </button>
          {open&&(
            <div onClick={()=>router.push("/dashboard")} style={{cursor:"pointer",display:"flex",alignItems:"center",gap:10,overflow:"hidden"}}>
              <img src="/assets/pb-logo-framed.png" alt="Playbook" onError={e=>{(e.target as HTMLImageElement).style.display="none"}}
                style={{width:42,height:42,borderRadius:10,objectFit:"cover",border:`2px solid ${ORANGE}`,flexShrink:0}}/>
              <div style={{overflow:"hidden"}}>
                <div style={{fontFamily:"'Space Mono',monospace",fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:ORANGE,whiteSpace:"nowrap"}}>Playbook Series</div>
                <div style={{fontFamily:"Anton,sans-serif",fontSize:22,lineHeight:1,textTransform:"uppercase",color:CREAM,whiteSpace:"nowrap"}}>PLAYBOOK</div>
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div onClick={goPublic} style={{display:"flex",alignItems:"center",gap:10,padding:open?"12px 14px":"10px 14px",borderBottom:`1px solid ${LINE}`,cursor:"pointer",flexShrink:0}}>
          <div style={{flexShrink:0}}>
            <ProfileAvatar src={profile?.avatar_url} name={`${profile?.first_name||""} ${profile?.last_name||""}`} size={38}/>
          </div>
          {open&&(
            <div style={{overflow:"hidden"}}>
              <div style={{fontSize:13,fontWeight:700,color:CREAM,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{profile?.first_name||"Scholar"}</div>
              <div style={{fontSize:11,color:MUTED,whiteSpace:"nowrap"}}>View public profile</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{flex:1,overflowY:"auto",overflowX:"hidden",padding:"8px"}}>
          {NAV.map(({label,href,icon})=>{
            const active=pathname===href||pathname?.startsWith(href+"/");
            return(
              <button key={href} onClick={()=>router.push(href)}
                className={active?"":"pb-nb"}
                style={{width:"100%",textAlign:"left",padding:open?"11px 12px":"11px 14px",borderRadius:12,border:"none",background:active?ORANGE:"transparent",color:active?"#fff":MUTED,cursor:"pointer",fontWeight:700,fontSize:13,display:"flex",alignItems:"center",gap:10,marginBottom:2,transition:"all 0.12s",justifyContent:open?"flex-start":"center",whiteSpace:"nowrap"}}>
                <span style={{fontSize:17,flexShrink:0}}>{icon}</span>
                {open&&<span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sign out */}
        <div style={{padding:"8px",borderTop:`1px solid ${LINE}`,flexShrink:0}}>
          <button onClick={logout} className="pb-nb"
            style={{width:"100%",padding:open?"11px 12px":"11px 14px",borderRadius:12,border:"none",background:"transparent",color:MUTED,cursor:"pointer",fontWeight:700,fontSize:11,display:"flex",alignItems:"center",gap:10,justifyContent:open?"flex-start":"center",whiteSpace:"nowrap",letterSpacing:"0.05em",textTransform:"uppercase",transition:"background 0.12s"}}>
            <span style={{fontSize:14}}>↗</span>{open&&"Sign out"}
          </button>
        </div>
      </aside>

      <main className="app-main" style={{marginLeft:W,flex:1,minHeight:"100vh",transition:"margin-left 0.22s cubic-bezier(.4,0,.2,1)"}}>
        {children}
      </main>
    </div>
  );
}
