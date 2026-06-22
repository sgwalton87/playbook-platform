"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { addReward } from "@/lib/gamification";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",green:"#10B981",amber:"#F59E0B",purple:"#8B5CF6",mono:"'Space Mono', monospace",sans:"'Hanken Grotesk', system-ui, sans-serif",anton:"'Anton', sans-serif"};

const COURSES:Record<string,any>={
  "captains-mindset":{title:"Captain's Mindset",pillar:"Leadership",pillarColor:"#F97316",img:"https://images.unsplash.com/photo-1546519638405-a4c8b5bd3c5e?w=1200&q=80",desc:"Lead by example on and off the court with proven captaincy frameworks.",xpPerModule:50,coinsPerModule:10,modules:[
    {id:1,title:"What Makes a Captain?",duration:"12 min",type:"Video + Reading",desc:"Explore the difference between a player and a leader. Understand what captaincy really demands."},
    {id:2,title:"Accountability Starts With You",duration:"15 min",type:"Video + Quiz",desc:"Real leaders hold themselves first. Learn the accountability frameworks used by elite sports teams."},
    {id:3,title:"Building Trust With Your Team",duration:"18 min",type:"Video + Activity",desc:"Trust is the foundation of every great team. Learn how to build it intentionally."},
    {id:4,title:"Leading Through Adversity",duration:"14 min",type:"Video + Reflection",desc:"What separates good captains from great ones is how they perform when things go wrong."},
    {id:5,title:"Communication On and Off the Court",duration:"16 min",type:"Video + Quiz",desc:"Learn the communication skills that translate from the locker room to the classroom."},
    {id:6,title:"Your Leadership Playbook",duration:"20 min",type:"Final Project",desc:"Create your personal leadership plan. Submit it to earn your certificate."},
  ]},
  "money-in-the-game":{title:"Money in the Game",pillar:"Finance",pillarColor:"#3B82F6",img:"https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",desc:"Budgeting, saving, and NIL fundamentals built specifically for young athletes.",xpPerModule:50,coinsPerModule:10,modules:[
    {id:1,title:"Money 101 for Athletes",duration:"10 min",type:"Video + Reading",desc:"Why athletes lose money fast — and how to never be that story."},
    {id:2,title:"Build Your First Budget",duration:"18 min",type:"Interactive",desc:"A step-by-step budget built for your real life as a student athlete."},
    {id:3,title:"Saving vs Investing",duration:"15 min",type:"Video + Quiz",desc:"What's the difference and when should you do which?"},
    {id:4,title:"NIL Basics for Under-18",duration:"20 min",type:"Video + Reading",desc:"Name, Image, Likeness explained simply. What you can and can't do before 18."},
    {id:5,title:"Taxes — Yes, Athletes Pay Them",duration:"14 min",type:"Video + Quiz",desc:"Don't get caught off guard. Learn what you owe and why."},
    {id:6,title:"Credit Scores Explained",duration:"12 min",type:"Video + Reading",desc:"What is a credit score, why does it matter, and how do you build one?"},
    {id:7,title:"Avoiding Financial Traps",duration:"16 min",type:"Video + Activity",desc:"The most common money mistakes young athletes make — and how to dodge every one."},
    {id:8,title:"Your Financial Game Plan",duration:"22 min",type:"Final Project",desc:"Build your complete financial plan. Submit to earn your Finance certificate card."},
  ]},
  "mind-of-an-athlete":{title:"Mind of an Athlete",pillar:"SEL",pillarColor:"#8B5CF6",img:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",desc:"Build resilience and manage pressure with social-emotional tools.",xpPerModule:50,coinsPerModule:10,modules:[
    {id:1,title:"Understanding Your Emotions",duration:"12 min",type:"Video + Reflection",desc:"Elite athletes feel everything — they just know how to process it."},
    {id:2,title:"Pressure and Performance",duration:"15 min",type:"Video + Activity",desc:"Why pressure breaks some athletes and fuels others."},
    {id:3,title:"Building Resilience",duration:"14 min",type:"Video + Quiz",desc:"Resilience isn't about never falling. It's about how fast you get back up."},
    {id:4,title:"Identity Beyond the Sport",duration:"18 min",type:"Video + Reflection",desc:"What happens when the game ends? Build an identity that goes beyond your jersey number."},
    {id:5,title:"Your Mental Performance Plan",duration:"20 min",type:"Final Project",desc:"Create your personal mental performance toolkit. Submit to earn your SEL certificate."},
  ]},
};

function CertCard({title,pillar,color}:{title:string;pillar:string;color:string}) {
  return(
    <div style={{position:"relative",borderRadius:14,padding:2,background:"linear-gradient(135deg,#F59E0B,#F97316,#8B5CF6,#3B82F6,#10B981)",boxShadow:"0 8px 32px rgba(0,0,0,.2)",width:160,flexShrink:0}}>
      <div style={{background:T.navy,borderRadius:12,padding:"16px 14px",minHeight:200,display:"flex",flexDirection:"column",alignItems:"center"}}>
        <div style={{display:"flex",justifyContent:"space-between",width:"100%",marginBottom:12}}>
          <span style={{fontFamily:T.mono,fontSize:8,color:"rgba(255,255,255,.4)",letterSpacing:"0.1em"}}>ERA 1/4</span>
          <span style={{fontFamily:T.mono,fontSize:8,background:T.orange,color:"#fff",padding:"2px 6px",borderRadius:4}}>UNCOMMON</span>
        </div>
        <div style={{width:56,height:56,borderRadius:"50%",background:"rgba(255,255,255,.06)",border:`2px solid ${color}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,marginBottom:12}}>🎓</div>
        <div style={{fontFamily:T.anton,fontSize:11,color,textTransform:"uppercase",textAlign:"center",letterSpacing:"0.04em",marginBottom:4}}>{title}</div>
        <div style={{fontFamily:T.mono,fontSize:8,color:"rgba(255,255,255,.3)",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>{pillar}</div>
        <div style={{marginTop:"auto",paddingTop:8,width:"100%",borderTop:"1px solid rgba(255,255,255,.08)",textAlign:"center"}}>
          <div style={{fontFamily:T.mono,fontSize:7,color:"rgba(255,255,255,.2)",letterSpacing:"0.08em"}}>PLAYBOOK SERIES · VALIDATED</div>
        </div>
      </div>
    </div>
  );
}

export default function CourseModulePage() {
  const router=useRouter();
  const params=useParams();
  const slug=params?.slug as string;
  const course=COURSES[slug];
  const [completedIds,setCompletedIds]=useState<number[]>([]);
  const [toast,setToast]=useState<string|null>(null);
  const [userId,setUserId]=useState<string|null>(null);
  const [claimed,setClaimed]=useState(false);
  const [authed,setAuthed]=useState(false);

  useEffect(()=>{
    (async()=>{
      const{data:u}=await supabase.auth.getUser();
      if(!u.user){router.replace("/login");return;}
      setUserId(u.user.id);
      // Load saved progress from Supabase
      const{data:p}=await supabase.from("profiles").select("course_progress").eq("id",u.user.id).single();
      if(p?.course_progress?.[slug]){
        // Build array of completed module ids
        const done=p.course_progress[slug];
        setCompletedIds(Array.from({length:done},(_,i)=>i+1));
      }
      setAuthed(true);
    })();
  },[slug]);

  useEffect(()=>{if(!toast)return;const t=setTimeout(()=>setToast(null),5000);return()=>clearTimeout(t);},[toast]);

  const completeModule=async(moduleId:number)=>{
    if(!userId||completedIds.includes(moduleId))return;
    const newCompleted=[...completedIds,moduleId];
    setCompletedIds(newCompleted);
    // Save to Supabase course_progress column
    const{data:p}=await supabase.from("profiles").select("course_progress").eq("id",userId).single();
    const existing=p?.course_progress||{};
    await supabase.from("profiles").update({course_progress:{...existing,[slug]:newCompleted.length}}).eq("id",userId);
    // Award XP and coins
    await addReward(userId,{coins:course.coinsPerModule,xp:course.xpPerModule});
    if(newCompleted.length===course.modules.length){
      setToast(`🎓 Course complete! Certificate unlocked · +${course.xpPerModule*course.modules.length} XP total`);
    } else {
      setToast(`⚡ +${course.xpPerModule} XP · +${course.coinsPerModule} coins — Module ${moduleId} complete!`);
    }
  };

  const fireConfetti = async () => {
    const confetti = (await import("canvas-confetti")).default;

    confetti({
      particleCount: 160,
      spread: 95,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 120,
        origin: { y: 0.7 },
      });
    }, 250);
  };

  const claimCert=async()=>{
    if(!userId || !course)return;

    setClaimed(true);

    await fireConfetti();

    const allModules = course.modules.map((m:any)=>m.id);

    const { error: progressError } = await supabase
      .from("course_progress")
      .upsert(
        {
          user_id: userId,
          course_slug: slug,
          completed_modules: allModules,
          completed: true,
          completed_at: new Date().toISOString(),
        },
        { onConflict: "user_id,course_slug" }
      );

    if(progressError){
      alert(progressError.message);
      setClaimed(false);
      return;
    }

    const { data: existingCert } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", userId)
      .eq("course_slug", slug)
      .maybeSingle();

    if(!existingCert){
      const { error: certError } = await supabase
        .from("certificates")
        .insert({
          user_id: userId,
          course_slug: slug,
          certificate_name: `${course.title} Certificate`,
          issued_at: new Date().toISOString(),
        });

      if(certError){
        alert(certError.message);
        setClaimed(false);
        return;
      }
    }

    await supabase.from("feed_posts").insert({
      user_id: userId,
      post_type: "course_completed",
      title: `🎓 Completed ${course.title}`,
      body: `Certificate unlocked for ${course.title}.`,
      visibility: "public",
    });

    setToast("🏆 Certificate added to your profile, transcript, and certificate vault!");
    setTimeout(()=>router.push("/certificates"),2500);
  };

  if(!course)return(
    <div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:12,color:T.faint}}>
      Course not found. <button onClick={()=>router.push("/courses")} style={{marginLeft:10,color:T.orange,background:"none",border:"none",cursor:"pointer",fontFamily:T.mono}}>← Back</button>
    </div>
  );

  const totalModules=course.modules.length;
  const completedCount=completedIds.length;
  const pct=Math.round((completedCount/totalModules)*100);
  const isComplete=completedCount===totalModules;
  const nextModuleId=course.modules.find((m:any)=>!completedIds.includes(m.id))?.id;

  if(!authed)return<div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:12,color:T.faint}}>Loading…</div>;

  return(
    <div style={{minHeight:"100vh",background:T.cream,fontFamily:T.sans,color:T.ink}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}::selection{background:${T.orange};color:#fff;}.pb-mod:hover{border-color:${T.orange}!important;}img{display:block;}`}</style>

      {toast&&<div style={{position:"fixed",top:20,right:20,zIndex:9999,background:T.navy,color:"#F8F7F4",padding:"13px 18px",borderRadius:14,fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.04em",boxShadow:"0 8px 32px rgba(15,23,42,.35)",maxWidth:380,lineHeight:1.5}}>{toast}</div>}

      {/* Hero */}
      <div style={{position:"relative",height:260,overflow:"hidden"}}>
        <img src={course.img} alt={course.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,rgba(15,23,42,.3) 0%,rgba(15,23,42,.88) 100%)"}}/>
        <div style={{position:"absolute",inset:0,padding:"24px 36px",display:"flex",flexDirection:"column",justifyContent:"space-between"}}>
          <button onClick={()=>router.push("/courses")} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:"rgba(255,255,255,.12)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,.2)",color:"#F8F7F4",borderRadius:999,padding:"8px 16px",cursor:"pointer",alignSelf:"flex-start"}}>← Back to courses</button>
          <div>
            <span style={{fontFamily:T.mono,fontSize:9,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",background:course.pillarColor,color:"#fff",padding:"4px 10px",borderRadius:999,display:"inline-block",marginBottom:10}}>{course.pillar}</span>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(28px,5vw,52px)",textTransform:"uppercase",color:"#F8F7F4",lineHeight:.95,marginBottom:8}}>{course.title}</h1>
            <p style={{fontSize:13,color:"rgba(248,247,244,.7)",maxWidth:"52ch",lineHeight:1.6}}>{course.desc}</p>
          </div>
        </div>
      </div>

      <div style={{maxWidth:960,margin:"0 auto",padding:"24px 36px"}}>

        {/* Progress bar */}
        <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"18px 22px",marginBottom:18}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:10}}>
            <div>
              <span style={{fontSize:14,fontWeight:700,color:T.ink}}>Your progress</span>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.muted,marginLeft:12}}>{completedCount}/{totalModules} modules complete</span>
            </div>
            <div style={{display:"flex",gap:14}}>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.orange}}>+{course.xpPerModule*completedCount} XP earned</span>
              <span style={{fontFamily:T.mono,fontSize:11,color:T.amber}}>+{course.coinsPerModule*completedCount} coins</span>
            </div>
          </div>
          <div style={{background:T.line,borderRadius:999,height:8,overflow:"hidden",marginBottom:6}}>
            <div style={{background:`linear-gradient(90deg,${T.orange},${T.amber})`,height:"100%",width:`${pct}%`,borderRadius:999,transition:"width 0.6s ease"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{pct}% complete</span>
            {!isComplete&&<span style={{fontFamily:T.mono,fontSize:10,color:T.orange}}>+{course.xpPerModule*(totalModules-completedCount)} XP remaining</span>}
          </div>
        </div>

        {/* Certificate claim */}
        {isComplete&&(
          <div style={{background:T.navy,borderRadius:18,padding:"24px 28px",marginBottom:18,display:"grid",gridTemplateColumns:"1fr auto",gap:24,alignItems:"center",overflow:"hidden",position:"relative"}}>
            <div style={{position:"absolute",top:-30,right:180,width:120,height:120,borderRadius:"50%",background:T.orange,opacity:.08,pointerEvents:"none"}}/>
            <div>
              <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:T.orange,marginBottom:10}}>🏆 Course complete!</div>
              <h3 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(20px,3vw,30px)",textTransform:"uppercase",color:"#F8F7F4",lineHeight:1,marginBottom:12}}>Claim your certificate</h3>
              <p style={{fontSize:13,color:"rgba(248,247,244,.55)",lineHeight:1.6,maxWidth:"44ch",marginBottom:18}}>
                You've completed all {totalModules} modules. Your certificate card is ready — it will appear on your profile and transcript.
              </p>
              {!claimed?(
                <button onClick={claimCert} style={{fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"13px 24px",cursor:"pointer"}}>
                  Claim certificate → Profile
                </button>
              ):(
                <span style={{fontFamily:T.mono,fontSize:12,color:T.green,fontWeight:700}}>✓ Certificate claimed — redirecting…</span>
              )}
            </div>
            <CertCard title={course.title} pillar={course.pillar} color={course.pillarColor}/>
          </div>
        )}

        <div style={{display:"grid",gridTemplateColumns:"1fr 260px",gap:20}}>
          {/* Modules */}
          <div>
            <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:14}}>Modules</p>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {course.modules.map((mod:any)=>{
                const done=completedIds.includes(mod.id);
                const isNext=mod.id===nextModuleId;
                const locked=!done&&!isNext&&mod.id>1&&!completedIds.includes(mod.id-1);
                return(
                  <div key={mod.id} className="pb-mod"
                    style={{background:T.surface,border:`1.5px solid ${done?T.green+"44":isNext?T.orange+"44":T.line}`,borderRadius:14,padding:"16px 18px",transition:"border-color 0.15s",opacity:locked?.5:1}}>
                    <div style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                      <div style={{width:40,height:40,borderRadius:"50%",background:done?T.green:isNext?T.orange:T.line,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,fontSize:16,color:"#fff",fontWeight:700,fontFamily:T.mono,transition:"background 0.2s"}}>
                        {done?"✓":locked?"🔒":mod.id}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4,flexWrap:"wrap",gap:6}}>
                          <h3 style={{fontSize:14,fontWeight:700,color:done?T.muted:T.ink}}>{mod.title}</h3>
                          <div style={{display:"flex",gap:8,flexShrink:0}}>
                            <span style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{mod.duration}</span>
                            <span style={{fontFamily:T.mono,fontSize:9,color:T.muted,background:T.surface2,padding:"2px 7px",borderRadius:999,border:`1px solid ${T.line}`}}>{mod.type}</span>
                          </div>
                        </div>
                        <p style={{fontSize:13,color:T.muted,lineHeight:1.55,marginBottom:done?0:12}}>{mod.desc}</p>
                        {!done&&!locked&&(
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                            <div style={{display:"flex",gap:10}}>
                              <span style={{fontFamily:T.mono,fontSize:10,color:T.orange}}>+{course.xpPerModule} XP</span>
                              <span style={{fontFamily:T.mono,fontSize:10,color:T.amber}}>+{course.coinsPerModule} coins</span>
                            </div>
                            <button onClick={()=>completeModule(mod.id)}
                              style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:isNext?T.orange:T.surface2,color:isNext?"#fff":T.muted,border:`1px solid ${isNext?T.orange:T.line}`,borderRadius:999,padding:"8px 16px",cursor:"pointer",transition:"all 0.15s"}}>
                              {isNext?"Start module →":"Complete →"}
                            </button>
                          </div>
                        )}
                        {done&&<div style={{fontFamily:T.mono,fontSize:10,color:T.green,fontWeight:700}}>✓ Completed · +{course.xpPerModule} XP earned</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div style={{background:T.navy,borderRadius:16,padding:"16px 18px"}}>
              <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.orange,marginBottom:14}}>Course rewards</p>
              {[{icon:"⚡",label:"XP per module",value:`+${course.xpPerModule}`},{icon:"💰",label:"Coins per module",value:`+${course.coinsPerModule}`},{icon:"⭐",label:"Total XP",value:`+${course.xpPerModule*totalModules}`},{icon:"🎓",label:"Certificate card",value:"On completion"},{icon:"🏅",label:"Badge unlock",value:"On completion"}].map(r=>(
                <div key={r.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,.07)"}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:14}}>{r.icon}</span>
                    <span style={{fontSize:12,color:"rgba(248,247,244,.5)"}}>{r.label}</span>
                  </div>
                  <span style={{fontFamily:T.mono,fontSize:11,color:T.orange,fontWeight:700}}>{r.value}</span>
                </div>
              ))}
            </div>
            <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:16,padding:"14px 16px"}}>
              <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.muted,marginBottom:12}}>Certificate preview</p>
              <div style={{display:"flex",justifyContent:"center",opacity:isComplete?1:0.35,transition:"opacity 0.4s"}}>
                <CertCard title={course.title} pillar={course.pillar} color={course.pillarColor}/>
              </div>
              {!isComplete&&<p style={{fontFamily:T.mono,fontSize:10,color:T.faint,textAlign:"center",marginTop:10}}>Complete all modules to unlock</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
