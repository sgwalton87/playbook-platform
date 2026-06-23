"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const T={navy:"#0F172A",navy2:"#1E293B",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",green:"#10B981",purple:"#8B5CF6",amber:"#F59E0B",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};
const COURSE_MAP:Record<string,any>={
  leadership:{slug:"captains-mindset",title:"Captain's Mindset",desc:"Lead by example on and off the court.",color:T.orange,pillar:"Leadership",icon:"★",modules:6},
  finance:{slug:"money-in-the-game",title:"Money in the Game",desc:"Budgeting, saving, and NIL fundamentals.",color:T.blue,pillar:"Finance",icon:"$",modules:8},
  civic:{slug:"community-leader",title:"Community Leader",desc:"Youth-led projects and advocacy.",color:T.green,pillar:"Civic",icon:"✓",modules:6},
  sel:{slug:"mind-of-an-athlete",title:"Mind of an Athlete",desc:"Build resilience and manage pressure.",color:T.purple,pillar:"SEL",icon:"♥",modules:5},
};
const RESOURCES=[
  {icon:"🎓",label:"FAFSA",desc:"Federal student aid application",url:"https://studentaid.gov/h/apply-for-aid/fafsa",color:T.blue},
  {icon:"🏫",label:"California Colleges",desc:"Explore CA colleges",url:"https://www.californiacolleges.edu",color:T.green},
  {icon:"💰",label:"Cal Grants / CSAC",desc:"California financial aid",url:"https://www.csac.ca.gov",color:T.orange},
  {icon:"👶",label:"CalKIDS",desc:"College savings for CA students",url:"https://www.calkids.org",color:T.purple},
  {icon:"📚",label:"Common App",desc:"Apply to colleges in one place",url:"https://www.commonapp.org",color:T.amber},
  {icon:"🏆",label:"NCAA Eligibility",desc:"Play college sports eligibility",url:"https://web3.ncaa.org/ecwr3/",color:T.blue},
  {icon:"💼",label:"CareerOneStop",desc:"Career exploration tools",url:"https://www.careeronestop.org",color:T.green},
  {icon:"🌱",label:"AmeriCorps",desc:"National service and education awards",url:"https://americorps.gov",color:T.orange},
];

function Confetti({active}:{active:boolean}) {
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    if(!active)return;
    const c=ref.current;if(!c)return;
    const ctx=c.getContext("2d");if(!ctx)return;
    c.width=window.innerWidth;c.height=window.innerHeight;
    const pieces=Array.from({length:200},()=>({x:Math.random()*c.width,y:Math.random()*c.height-c.height,w:Math.random()*12+4,h:Math.random()*7+3,color:["#F97316","#3B82F6","#10B981","#8B5CF6","#F59E0B","#EC4899","#fff"][Math.floor(Math.random()*7)],rot:Math.random()*360,speed:Math.random()*4+2,rs:Math.random()*6-3}));
    let frame:number;const start=Date.now();
    const draw=()=>{
      if(Date.now()-start>6000){cancelAnimationFrame(frame);ctx.clearRect(0,0,c.width,c.height);return;}
      ctx.clearRect(0,0,c.width,c.height);
      pieces.forEach(p=>{p.y+=p.speed;p.rot+=p.rs;if(p.y>c.height+20){p.y=-20;p.x=Math.random()*c.width;}ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot*Math.PI/180);ctx.fillStyle=p.color;ctx.fillRect(-p.w/2,-p.h/2,p.w,p.h);ctx.restore();});
      frame=requestAnimationFrame(draw);
    };
    draw();return()=>cancelAnimationFrame(frame);
  },[active]);
  if(!active)return null;
  return<canvas ref={ref} style={{position:"fixed",inset:0,zIndex:9998,pointerEvents:"none"}}/>;
}

export default function DashboardPage() {
  const router=useRouter();
  const [profile,setProfile]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [showWelcome,setShowWelcome]=useState(false);
  const [confetti,setConfetti]=useState(false);
  const [progress,setProgress]=useState<Record<string,number>>({});

  useEffect(()=>{
    (async()=>{
      const{data:u}=await supabase.auth.getUser();
      if(!u.user){router.replace("/login");return;}
      const{data:p}=await supabase.from("profiles").select("*").eq("id",u.user.id).single();
      if(!p||!p.onboarded){router.replace("/onboarding");return;}
      setProfile(p);
      if(p.course_progress)setProgress(p.course_progress);
      const isNew=sessionStorage.getItem("pb_new_user");
      if(isNew){setShowWelcome(true);setConfetti(true);sessionStorage.removeItem("pb_new_user");setTimeout(()=>setConfetti(false),6000);setTimeout(()=>setShowWelcome(false),8000);}
      setLoading(false);
    })();
  },[]);

  if(loading)return<div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:12,color:T.faint}}>Loading...</div>;

  const pillars:string[]=profile?.pillars||[];
  const suggested=pillars.length>0?pillars.map((p:string)=>COURSE_MAP[p]).filter(Boolean):Object.values(COURSE_MAP);
  const xp=profile?.xp||0;const level=Math.floor(xp/500)+1;const coins=profile?.coin_balance||0;const name=profile?.first_name||"Scholar";

  return(
    <div style={{minHeight:"100vh",background:T.cream,fontFamily:T.sans,color:T.ink}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}::selection{background:${T.orange};color:#fff;}.pb-c{transition:all 0.15s;}.pb-c:hover{border-color:${T.orange}!important;transform:translateY(-2px);}.pb-r:hover{border-color:${T.orange}!important;background:${T.orangeL}!important;}`}</style>
      <Confetti active={confetti}/>

      {showWelcome&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(15,23,42,.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:T.surface,borderRadius:24,padding:"40px 36px",maxWidth:460,width:"100%",textAlign:"center"}}>
            <div style={{fontSize:64,marginBottom:16}}>🎉</div>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T.orange,marginBottom:10}}>Welcome to the network</p>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(28px,5vw,44px)",textTransform:"uppercase",color:T.ink,lineHeight:.95,marginBottom:16}}>Congrats,<br/><span style={{color:T.orange}}>{name}!</span></h1>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.65,marginBottom:24}}>You are officially part of Playbook Series Inc. Your profile is live, your courses are ready, and your journey starts right now. Run it. 🏀</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",marginBottom:20}}>
              {[{icon:"⚡",label:"XP",val:xp},{icon:"💰",label:"Coins",val:coins},{icon:"📈",label:"Level",val:level}].map(({icon,label,val})=>(
                <div key={label} style={{background:T.surface2,border:`1px solid ${T.line}`,borderRadius:12,padding:"12px 14px",flex:1}}>
                  <div style={{fontSize:20,marginBottom:4}}>{icon}</div>
                  <div style={{fontFamily:T.mono,fontSize:9,color:T.faint,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
                  <div style={{fontFamily:T.anton,fontSize:22,color:T.orange}}>{val}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowWelcome(false)} style={{fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:12,padding:"14px 28px",cursor:"pointer",width:"100%"}}>Let's go! →</button>
          </div>
        </div>
      )}

      <div style={{padding:"32px 36px",maxWidth:1080}}>
        <div style={{marginBottom:20}}>
          <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Your playbook</p>
          <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(32px,4vw,52px)",textTransform:"uppercase",color:T.ink,lineHeight:.95}}>Welcome back,<br/><span style={{color:T.orange}}>{name}!</span></h1>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:18}}>
          {[{icon:"⚡",label:"XP earned",value:xp,color:T.orange},{icon:"💰",label:"Coins",value:coins,color:T.amber},{icon:"📈",label:"Level",value:level,color:T.blue},{icon:"🔥",label:"Day streak",value:profile?.streak||1,color:T.green}].map(({icon,label,value,color})=>(
            <div key={label} style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
              <div style={{fontSize:22,marginBottom:6}}>{icon}</div>
              <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,marginBottom:3}}>{label}</div>
              <div style={{fontFamily:T.anton,fontSize:28,color,lineHeight:1}}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{background:T.navy,borderRadius:14,padding:"14px 20px",marginBottom:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
            <span style={{fontFamily:T.mono,fontSize:10,color:T.orange,letterSpacing:"0.12em",textTransform:"uppercase"}}>Level {level} · {500-(xp%500)} XP to Level {level+1}</span>
            <span style={{fontFamily:T.mono,fontSize:11,fontWeight:700,color:"#F8F7F4"}}>{xp} XP total</span>
          </div>
          <div style={{background:"rgba(255,255,255,.1)",borderRadius:999,height:6,overflow:"hidden"}}>
            <div style={{background:`linear-gradient(90deg,${T.orange},${T.amber})`,height:"100%",width:`${((xp%500)/500)*100}%`,borderRadius:999}}/>
          </div>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 300px",gap:20}}>
          <div>
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div>
                  <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:4}}>{pillars.length>0?"Based on your interests":"Start your journey"}</p>
                  <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:22,textTransform:"uppercase",color:T.ink,lineHeight:1}}>Suggested courses</h2>
                </div>
                <button onClick={()=>router.push("/courses")} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"transparent",border:`1px solid ${T.line}`,color:T.muted,borderRadius:999,padding:"8px 14px",cursor:"pointer"}}>View all →</button>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {suggested.slice(0,4).map((course:any)=>{
                  const done=progress[course.slug]||0;const pct=Math.round((done/course.modules)*100);
                  return(
                    <div key={course.slug} className="pb-c" onClick={()=>router.push(`/courses/${course.slug}`)}
                      style={{background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:14,padding:"16px 18px",cursor:"pointer",display:"flex",gap:14,alignItems:"center"}}>
                      <div style={{width:46,height:46,borderRadius:12,background:course.color+"18",border:`2px solid ${course.color}33`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>{course.icon}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"}}>
                          <span style={{fontSize:14,fontWeight:700,color:T.ink}}>{course.title}</span>
                          <span style={{fontFamily:T.mono,fontSize:9,fontWeight:700,background:course.color+"18",color:course.color,padding:"2px 7px",borderRadius:999,letterSpacing:"0.06em",textTransform:"uppercase"}}>{course.pillar}</span>
                        </div>
                        <p style={{fontSize:12,color:T.muted,lineHeight:1.5,marginBottom:done>0?8:0}}>{course.desc}</p>
                        {done>0&&(<div><div style={{background:T.line,borderRadius:999,height:4,overflow:"hidden",marginBottom:3}}><div style={{background:course.color,height:"100%",width:`${pct}%`,borderRadius:999}}/></div><span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{done}/{course.modules} modules · {pct}%</span></div>)}
                      </div>
                      <span style={{fontSize:13,fontWeight:700,color:course.color,flexShrink:0}}>{done===0?"Start →":done===course.modules?"Review →":"Continue →"}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:6}}>Essential resources</p>
              <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:22,textTransform:"uppercase",color:T.ink,lineHeight:1,marginBottom:14}}>Tools for your future</h2>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {RESOURCES.map(r=>(
                  <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer" className="pb-r"
                    style={{display:"flex",gap:12,alignItems:"center",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:12,padding:"14px 16px",textDecoration:"none",transition:"all 0.15s"}}>
                    <div style={{width:36,height:36,borderRadius:9,background:r.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{r.icon}</div>
                    <div><div style={{fontSize:13,fontWeight:700,color:T.ink,marginBottom:2}}>{r.label}</div><div style={{fontSize:11,color:T.muted,lineHeight:1.4}}>{r.desc}</div></div>
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{background:T.navy,borderRadius:16,padding:"18px 16px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:T.orange,opacity:.1}}/>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.anton,fontSize:16,color:"#fff",flexShrink:0,overflow:"hidden"}}>
                  {profile?.avatar_url?<img src={profile.avatar_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(name[0]||"S")}
                </div>
                <div><div style={{fontSize:13,fontWeight:700,color:"#F8F7F4"}}>{profile?.full_name||name}</div><div style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.5)"}}>@{profile?.username||"scholar"}</div></div>
              </div>
              {profile?.school&&<div style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.5)",marginBottom:3}}>🏫 {profile.school}</div>}
              {profile?.sport&&<div style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.5)",marginBottom:12}}>🏅 {profile.sport}{profile?.position?` · ${profile.position}`:""}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>router.push("/profile")} style={{flex:1,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:10,padding:"10px",cursor:"pointer"}}>Edit profile</button>
                <button onClick={()=>profile?.username&&router.push(`/u/${profile.username}`)} style={{flex:1,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"transparent",color:"rgba(248,247,244,.6)",border:"1px solid rgba(255,255,255,.15)",borderRadius:10,padding:"10px",cursor:"pointer"}}>Public page</button>
              </div>
            </div>

            {pillars.length>0&&(
              <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
                <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.muted,marginBottom:10}}>Your pillars</p>
                {pillars.map((p:string)=>{const c=COURSE_MAP[p];if(!c)return null;return(
                  <div key={p} onClick={()=>router.push(`/courses/${c.slug}`)} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:`1px solid ${T.line}`,cursor:"pointer"}}>
                    <div style={{width:26,height:26,borderRadius:7,background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>{c.icon}</div>
                    <span style={{flex:1,fontSize:13,fontWeight:600,color:T.ink}}>{c.pillar}</span>
                    <span style={{fontSize:12,color:c.color}}>→</span>
                  </div>
                );})}
              </div>
            )}

            <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:14,padding:"14px 16px"}}>
              <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.muted,marginBottom:10}}>Quick links</p>
              {[{icon:"📚",label:"Courses",path:"/courses"},{icon:"🎓",label:"Certificates",path:"/certificates"},{icon:"📣",label:"Feed",path:"/feed"},{icon:"🏆",label:"Leaderboard",path:"/leaderboard"},{icon:"🧭",label:"Mentorship",path:"/mentorship"},{icon:"📊",label:"Analytics",path:"/analytics"}].map(({icon,label,path})=>(
                <button key={label} onClick={()=>router.push(path)} style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"8px 0",borderBottom:`1px solid ${T.line}`,background:"none",border_bottom:`1px solid ${T.line}`,cursor:"pointer",fontFamily:T.sans,fontSize:13,color:T.ink,textAlign:"left" as const}}>
                  <span style={{fontSize:15,flexShrink:0}}>{icon}</span><span style={{flex:1,fontWeight:500}}>{label}</span><span style={{color:T.orange,fontSize:12}}>→</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
