"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AG_COURSES, AG_SUBJECT_NAMES } from "@/lib/agCourses";

const T={navy:"#0F172A",navy2:"#1E293B",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",blue:"#3B82F6",blueL:"#EFF6FF",green:"#10B981",greenL:"#ECFDF5",purple:"#8B5CF6",purpleL:"#EDE9FE",amber:"#F59E0B",amberL:"#FFFBEB",red:"#E24B4A",teal:"#0F6E56",tealL:"#E1F5EE",mono:"'Space Mono',monospace",sans:"'Hanken Grotesk',system-ui,sans-serif",anton:"'Anton',sans-serif"};

const RESOURCES=[
  {icon:"🎓",label:"FAFSA",url:"https://studentaid.gov/h/apply-for-aid/fafsa"},
  {icon:"🏫",label:"California Colleges",url:"https://www.californiacolleges.edu"},
  {icon:"💰",label:"Cal Grants",url:"https://www.csac.ca.gov"},
  {icon:"👶",label:"CalKIDS",url:"https://www.calkids.org"},
  {icon:"📚",label:"Common App",url:"https://www.commonapp.org"},
  {icon:"🏆",label:"NCAA Eligibility",url:"https://web3.ncaa.org/ecwr3/"},
  {icon:"💼",label:"CareerOneStop",url:"https://www.careeronestop.org"},
  {icon:"🌱",label:"AmeriCorps",url:"https://americorps.gov"},
];

const AG_SUBJECTS=[
  {key:"A",name:"History / Social Science",required:2},
  {key:"B",name:"English",required:4},
  {key:"C",name:"Math",required:3},
  {key:"D",name:"Lab Science",required:2},
  {key:"E",name:"Language Other Than English",required:2},
  {key:"F",name:"Visual & Performing Arts",required:1},
  {key:"G",name:"Elective",required:1},
];

function Confetti({active}:{active:boolean}){
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

export default function DashboardPage(){
  const router=useRouter();
  const [profile,setProfile]=useState<any>(null);
  const [loading,setLoading]=useState(true);
  const [showWelcome,setShowWelcome]=useState(false);
  const [confetti,setConfetti]=useState(false);
  const [tab,setTab]=useState("academics");
  const [view,setView]=useState("student");
  const [agProgress,setAgProgress]=useState<any[]>([]);
  const [collegeList,setCollegeList]=useState<any[]>([]);
  const [deadlines,setDeadlines]=useState<any[]>([]);
  const [activities,setActivities]=useState<any[]>([]);
  const [certificates,setCertificates]=useState<any[]>([]);
  const [showAddActivity,setShowAddActivity]=useState(false);
  const [newActivityType,setNewActivityType]=useState("");
  const [newActivityName,setNewActivityName]=useState("");
  const [newActivityHours,setNewActivityHours]=useState("");
  const [newActivityOrg,setNewActivityOrg]=useState("");
  const [addingActivity,setAddingActivity]=useState(false);
  const [editingAG,setEditingAG]=useState<string|null>(null);
  const [uploadingTranscript,setUploadingTranscript]=useState(false);
  const [transcriptResult,setTranscriptResult]=useState<string|null>(null);
  const [agKey,setAgKey]=useState(0);

  useEffect(()=>{
    (async()=>{
      const{data:u}=await supabase.auth.getUser();
      if(!u.user){router.replace("/login");return;}
      const{data:p}=await supabase.from("profiles").select("*").eq("id",u.user.id).single();
      if(!p||!p.onboarded){router.replace("/onboarding");return;}
      setProfile(p);

      // Load AG progress
      const{data:ag}=await supabase.from("ag_progress").select("*").eq("user_id",u.user.id);
      if(ag&&ag.length>0){
        setAgProgress(ag.map((a:any)=>({...a,years_completed:Number(a.years_completed),years_required:Number(a.years_required)})));
      } else {
        // Seed default AG rows
        const defaults=AG_SUBJECTS.map(s=>({user_id:u.user.id,subject:s.key,subject_name:s.name,years_required:s.required,years_completed:0,in_progress:false}));
        await supabase.from("ag_progress").insert(defaults);
        setAgProgress(defaults);
      }

      const{data:cl}=await supabase.from("college_list").select("*").eq("user_id",u.user.id).order("created_at");
      setCollegeList(cl||[]);

      const{data:dl}=await supabase.from("deadlines").select("*").eq("user_id",u.user.id).eq("completed",false).order("due_date").limit(5);
      setDeadlines(dl||[]);

      const isNew=sessionStorage.getItem("pb_new_user")||sessionStorage.getItem("pb_profile_created");
      if(isNew){
        setShowWelcome(true);setConfetti(true);
        sessionStorage.removeItem("pb_new_user");
        sessionStorage.removeItem("pb_profile_created");
        setTimeout(()=>setConfetti(false),6000);
        setTimeout(()=>setShowWelcome(false),8000);
      }
      setLoading(false);
    })();
  },[]);

  if(loading)return<div style={{minHeight:"100vh",background:T.cream,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.mono,fontSize:12,color:T.faint}}>Loading your playbook...</div>;

  const xp=profile?.xp||0;
  const level=Math.floor(xp/500)+1;
  const xpToNext=500-(xp%500);
  const coins=profile?.coin_balance||0;
  const streak=profile?.streak||1;
  const name=profile?.first_name||"Scholar";
  const isAthlete=profile?.role==="scholar-athlete";

  const updateAG=async(subject:string,field:string,value:any)=>{
    const updated=agProgress.map(a=>a.subject===subject?{...a,[field]:value}:a);
    setAgProgress([...updated]);
    setAgKey(k=>k+1);
    await supabase.from("ag_progress").update({[field]:value,updated_at:new Date().toISOString()}).eq("user_id",profile.id).eq("subject",subject);
  };

  const handleTranscriptUpload=async(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0];
    console.log("File selected:",file?.name,file?.type,file?.size);
    if(!file)return;
    setUploadingTranscript(true);
    console.log("Profile ID:",profile?.id);
    setTranscriptResult(null);
    try{
      const base64=await new Promise<string>((res,rej)=>{
        const reader=new FileReader();
        reader.onload=()=>res((reader.result as string).split(",")[1]);
        reader.onerror=rej;
        reader.readAsDataURL(file);
      });
      const mediaType=file.type==="application/pdf"?"application/pdf":file.type as any;
      const response=await fetch("/api/parse-transcript",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({base64,mediaType,userId:profile.id}),
      });
      const data=await response.json();
      console.log("Parse response:",JSON.stringify(data));
      const refreshed=await supabase.from("ag_progress").select("*").eq("user_id",profile.id);
      if(refreshed.data){
        const normalized=refreshed.data.map((a:any)=>({...a,years_completed:Number(a.years_completed),years_required:Number(a.years_required)}));
        setAgProgress([...normalized]);
        setAgKey(k=>k+1);
        setAgKey(k=>k+1);
      }
      if(data.agUpdates>0){
        setTranscriptResult(`Transcript parsed! Updated ${data.agUpdates} A-G subjects.`);
      } else {
        setTranscriptResult(data.message||"Transcript processed — please review your A-G progress below.");
      }
    }catch(err){
      setTranscriptResult("Upload failed. Please try again or update manually.");
    }
    setUploadingTranscript(false);
  };
  const agDone=agProgress.filter(a=>Number(a.years_completed)>=Number(a.years_required)).length;
  const agTotal=AG_SUBJECTS.length;
  const readiness=Math.round(((agDone/agTotal)*0.3+(xp>500?0.2:xp/500*0.2)+(profile?.dream_school?0.1:0)+(profile?.gpa?0.15:0)+(profile?.bio?0.1:0)+(profile?.avatar_url?0.15:0))*100);

  const TABS=[
    {key:"academics",label:"Academics",icon:"🎓"},
    {key:"college",label:"College",icon:"🏫"},
    {key:"aid",label:"Financial aid",icon:"💰"},
    {key:"career",label:"Career",icon:"💼"},
    ...(isAthlete?[{key:"athletic",label:"Athletic",icon:"🏆"}]:[]),
    {key:"community",label:"Community",icon:"🤝"},
  ];

  const card=(children:React.ReactNode,style?:any)=>(
    <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:12,padding:"14px 16px",...style}}>{children}</div>
  );
  const cardTitle=(title:string,sub?:string)=>(
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
      <span style={{fontSize:13,fontWeight:700,color:T.ink}}>{title}</span>
      {sub&&<span style={{fontSize:11,color:T.muted}}>{sub}</span>}
    </div>
  );

  return(
    <div style={{minHeight:"100vh",background:T.cream,fontFamily:T.sans,color:T.ink}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .pb-tab{cursor:pointer;transition:all 0.15s;}
        .pb-tab:hover{color:${T.orange}!important;}
        .pb-card-hover{transition:all 0.15s;cursor:pointer;}
        .pb-card-hover:hover{border-color:${T.orange}!important;transform:translateY(-1px);}
        .pb-toggle{cursor:pointer;transition:all 0.15s;}
        .pb-toggle:hover{background:${T.orangeL}!important;}
        a{text-decoration:none;}
      `}</style>

      <Confetti active={confetti}/>

      {/* Welcome modal */}
      {showWelcome&&(
        <div style={{position:"fixed",inset:0,zIndex:9999,background:"rgba(15,23,42,.88)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:T.surface,borderRadius:24,padding:"44px 40px",maxWidth:460,width:"100%",textAlign:"center",boxShadow:"0 24px 64px rgba(0,0,0,.3)"}}>
            <div style={{fontSize:72,marginBottom:20}}>🎉</div>
            <p style={{fontFamily:T.mono,fontSize:11,letterSpacing:"0.2em",textTransform:"uppercase",color:T.orange,marginBottom:12}}>Welcome to the network</p>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(32px,5vw,48px)",textTransform:"uppercase",color:T.ink,lineHeight:.9,marginBottom:16}}>Congrats,<br/><span style={{color:T.orange}}>{name}!</span></h1>
            <p style={{fontSize:14,color:T.muted,lineHeight:1.65,marginBottom:28}}>You are officially part of Playbook Series Inc. Your profile is live, your courses are ready, and your journey starts right now. <strong style={{color:T.ink}}>Run it. 🏀</strong></p>
            <div style={{display:"flex",gap:10,marginBottom:24}}>
              {[{icon:"⚡",label:"XP earned",val:xp},{icon:"💰",label:"Coins",val:coins},{icon:"📈",label:"Level",val:level}].map(({icon,label,val})=>(
                <div key={label} style={{background:T.surface2,border:`1px solid ${T.line}`,borderRadius:14,padding:"14px 12px",flex:1,textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{icon}</div>
                  <div style={{fontFamily:T.mono,fontSize:9,color:T.faint,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{label}</div>
                  <div style={{fontFamily:T.anton,fontSize:26,color:T.orange,lineHeight:1}}>{val}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setShowWelcome(false)} style={{fontFamily:T.mono,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:14,padding:"16px 32px",cursor:"pointer",width:"100%"}}>Let's go! →</button>
          </div>
        </div>
      )}

      <div style={{maxWidth:1080,padding:"28px 32px"}}>

        {/* Navy header */}
        <div style={{background:T.navy,borderRadius:16,padding:"18px 22px",marginBottom:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:T.orange,marginBottom:5}}>Your playbook</p>
              <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:"clamp(24px,3vw,38px)",textTransform:"uppercase",color:"#F8F7F4",lineHeight:.95}}>
                Welcome back, <span style={{color:T.orange}}>{name}!</span>
              </h1>
            </div>
            <div style={{width:46,height:46,borderRadius:"50%",background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.anton,fontSize:20,color:"#fff",flexShrink:0,overflow:"hidden"}}>
              {profile?.avatar_url?<img src={profile.avatar_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:(name[0]||"S")}
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:12}}>
            {[{label:"XP earned",val:xp,color:T.orange},{label:"Readiness",val:`${readiness}%`,color:T.green},{label:"Day streak",val:`${streak} days`,color:"#F8F7F4"},{label:"Coins",val:coins,color:T.amber}].map(({label,val,color})=>(
              <div key={label} style={{background:"rgba(255,255,255,.07)",borderRadius:8,padding:"8px 10px"}}>
                <div style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.45)",marginBottom:2}}>{label}</div>
                <div style={{fontFamily:T.anton,fontSize:22,color,lineHeight:1}}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{background:"rgba(255,255,255,.1)",borderRadius:999,height:5,overflow:"hidden",marginBottom:5}}>
            <div style={{background:`linear-gradient(90deg,${T.orange},${T.amber})`,height:"100%",width:`${Math.min(((xp%500)/500)*100,100)}%`,borderRadius:999}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between"}}>
            <span style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.4)"}}>Level {level}</span>
            <span style={{fontFamily:T.mono,fontSize:10,color:"rgba(248,247,244,.4)"}}>{xpToNext} XP to Level {level+1}</span>
          </div>
        </div>

        {/* Today's Action */}
        <div style={{background:T.orangeL,border:`0.5px solid #FED7AA`,borderRadius:12,padding:"12px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:36,height:36,borderRadius:9,background:T.orange,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontSize:18}}>⚡</span>
          </div>
          <div style={{flex:1}}>
            <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:"#9A3412",fontWeight:700,marginBottom:2}}>Today's action</div>
            <div style={{fontSize:13,fontWeight:600,color:"#7C2D12"}}>
              {!profile?.dream_school?"Add your dream school to your profile →":deadlines.length>0?`${deadlines[0].title} — due soon`:"Complete your FAFSA checklist to unlock financial aid"}
            </div>
          </div>
          <button onClick={()=>setTab("college")} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"7px 14px",cursor:"pointer",flexShrink:0,whiteSpace:"nowrap"}}>Do it now →</button>
        </div>

        {/* Student / Parent / Coach toggle */}
        <div style={{display:"flex",background:T.surface2,borderRadius:10,border:`0.5px solid ${T.line}`,overflow:"hidden",marginBottom:14}}>
          {[{key:"student",label:"Student",icon:"👤"},{key:"parent",label:"Parent",icon:"🏠"},{key:"coach",label:"Coach",icon:"📋"}].map(v=>(
            <button key={v.key} onClick={()=>setView(v.key)} style={{flex:1,padding:"9px 12px",fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:view===v.key?T.surface:"transparent",color:view===v.key?T.orange:T.muted,border:"none",cursor:"pointer",borderRadius:view===v.key?9:0,boxShadow:view===v.key?`0 0 0 0.5px ${T.line}`:"none",transition:"all 0.15s",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
              <span>{v.icon}</span>{v.label}
            </button>
          ))}
        </div>

        {/* STUDENT VIEW */}
        {view==="student"&&(
          <>
            {/* Tabs */}
            <div style={{display:"flex",borderBottom:`0.5px solid ${T.line}`,marginBottom:16,overflowX:"auto",gap:0}}>
              {TABS.map(t=>(
                <div key={t.key} className="pb-tab" onClick={()=>setTab(t.key)}
                  style={{padding:"9px 16px",fontSize:12,fontWeight:tab===t.key?700:400,color:tab===t.key?T.orange:T.muted,borderBottom:`2px solid ${tab===t.key?T.orange:"transparent"}`,whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:5,marginBottom:-0.5}}>
                  <span>{t.icon}</span>{t.label}
                </div>
              ))}
            </div>

            {/* ACADEMICS */}
            {tab==="academics"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  {card(<>
                    {cardTitle("College readiness score","Updated today")}
                    <div style={{fontFamily:T.anton,fontSize:44,color:T.green,lineHeight:1,marginBottom:4}}>{readiness}%</div>
                    <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Based on your profile completion and A-G progress</div>
                    <div style={{background:T.line,borderRadius:999,height:8,overflow:"hidden",marginBottom:12}}>
                      <div style={{background:T.green,height:"100%",width:`${readiness}%`,borderRadius:999}}/>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:6}}>
                      {[{label:"GPA on file",done:!!profile?.gpa},{label:"A-G in progress",done:agDone>0},{label:"Dream school set",done:!!profile?.dream_school},{label:"Profile photo",done:!!profile?.avatar_url},{label:"Bio complete",done:!!profile?.bio}].map(({label,done})=>(
                        <div key={label} style={{display:"flex",justifyContent:"space-between",fontSize:11}}>
                          <span style={{color:T.muted}}>{done?"✓":"✗"} {label}</span>
                          <span style={{color:done?T.green:T.red,fontWeight:700}}>{done?"Done":"Needed"}</span>
                        </div>
                      ))}
                    </div>
                  </>)}
                  {card(<>
                    {cardTitle("GPA","Current semester")}
                    <div style={{display:"flex",gap:16,alignItems:"baseline",marginBottom:12}}>
                      <div><div style={{fontFamily:T.anton,fontSize:36,color:T.green,lineHeight:1}}>{profile?.weighted_gpa||profile?.gpa||"—"}</div><div style={{fontSize:10,color:T.muted,marginTop:2}}>Weighted</div></div>
                      <div><div style={{fontFamily:T.anton,fontSize:36,color:T.ink,lineHeight:1}}>{profile?.unweighted_gpa||"—"}</div><div style={{fontSize:10,color:T.muted,marginTop:2}}>Unweighted</div></div>
                    </div>
                    {cardTitle("A-G requirements",`${agDone}/${agTotal} subjects`)}
                    <div key={agKey} style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:5}}>
                      {AG_SUBJECTS.map(s=>{
                        const prog=agProgress.find(a=>a.subject===s.key);
                        const done=prog&&Number(prog.years_completed)>=Number(prog.years_required);
                        const inProg=prog&&prog.in_progress&&!done;
                        const isEditing=editingAG===s.key;
                        return(
                          <div key={s.key}>
                            <div onClick={()=>setEditingAG(isEditing?null:s.key)}
                              style={{border:`1.5px solid ${done?T.green:inProg?T.amber:T.line}`,borderRadius:7,padding:"6px 7px",textAlign:"center",cursor:"pointer",transition:"all 0.15s",background:done?T.greenL:inProg?T.amberL:"transparent"}}>
                              <div style={{fontSize:13,fontWeight:700,color:done?T.green:T.ink,marginBottom:2}}>{s.key}</div>
                              <div style={{background:T.line,borderRadius:999,height:3,overflow:"hidden",marginBottom:3}}>
                                <div style={{background:done?T.green:inProg?T.amber:T.line,height:"100%",width:prog?`${Math.min((Number(prog.years_completed)/Number(prog.years_required))*100,100)}%`:"0%",borderRadius:999}}/>
                              </div>
                              <div style={{fontSize:9,color:T.faint}}>{prog?`${Number(prog.years_completed)}/${Number(prog.years_required)}yr`:"0yr"}</div>
                            </div>
                            {isEditing&&(
                              <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(15,23,42,.5)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}} onClick={()=>setEditingAG(null)}>
                                <div style={{background:T.surface,borderRadius:16,padding:"20px",width:"100%",maxWidth:480,boxShadow:"0 16px 48px rgba(0,0,0,.2)",maxHeight:"80vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
                                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                                    <div>
                                      <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.12em",textTransform:"uppercase",color:T.orange,marginBottom:2}}>Category {s.key}</div>
                                      <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{s.name}</div>
                                    </div>
                                    <button onClick={()=>setEditingAG(null)} style={{background:T.surface2,border:"none",borderRadius:999,width:28,height:28,cursor:"pointer",fontSize:14,color:T.muted}}>✕</button>
                                  </div>

                                  <div style={{marginBottom:14}}>
                                    <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:T.mono}}>Years completed ({s.required} required)</div>
                                    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                                      {Array.from({length:Math.max(s.required,4)+1},(_,i)=>i*0.5).filter(n=>n<=Math.max(s.required,4)).map(n=>(
                                        <button key={n} onClick={()=>{updateAG(s.key,"years_completed",n);}} 
                                          style={{minWidth:40,height:36,borderRadius:8,border:`1.5px solid ${Number(prog?.years_completed)===n?T.orange:T.line}`,background:Number(prog?.years_completed)===n?T.orangeL:"transparent",fontFamily:T.mono,fontSize:12,fontWeight:700,color:Number(prog?.years_completed)===n?T.orange:T.muted,cursor:"pointer",padding:"0 8px"}}>
                                          {n}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div style={{marginBottom:14}}>
                                    <div onClick={()=>updateAG(s.key,"in_progress",!prog?.in_progress)} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",padding:"10px 12px",borderRadius:9,border:`1.5px solid ${prog?.in_progress?T.orange:T.line}`,background:prog?.in_progress?T.orangeL:"transparent"}}>
                                      <div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${prog?.in_progress?T.orange:T.line}`,background:prog?.in_progress?T.orange:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                                        {prog?.in_progress&&<span style={{color:"#fff",fontSize:11}}>✓</span>}
                                      </div>
                                      <span style={{fontSize:13,color:prog?.in_progress?T.orange:T.muted}}>Currently taking a course in this category</span>
                                    </div>
                                  </div>

                                  <div style={{marginBottom:14}}>
                                    <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:T.mono}}>Courses taken</div>
                                    <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
                                      {(prog?.courses_taken||[]).map((c:string)=>(
                                        <span key={c} style={{display:"flex",alignItems:"center",gap:4,background:T.navy,color:"#F8F7F4",borderRadius:999,padding:"4px 10px",fontSize:11,fontWeight:600}}>
                                          {c}
                                          <button onClick={()=>{const updated=(prog?.courses_taken||[]).filter((x:string)=>x!==c);updateAG(s.key,"courses_taken",updated);}} style={{background:"none",border:"none",color:"rgba(248,247,244,.5)",cursor:"pointer",fontSize:12,padding:0,marginLeft:2}}>✕</button>
                                        </span>
                                      ))}
                                    </div>
                                    <select onChange={e=>{if(!e.target.value)return;const cur=prog?.courses_taken||[];if(!cur.includes(e.target.value)){updateAG(s.key,"courses_taken",[...cur,e.target.value]);}e.target.value="";}}
                                      style={{width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:9,padding:"10px 12px",fontSize:13,color:T.ink,fontFamily:T.sans,outline:"none",cursor:"pointer"}}>
                                      <option value="">+ Add a course...</option>
                                      {(AG_COURSES[s.key]||[]).filter((c:string)=>!(prog?.courses_taken||[]).includes(c)).map((c:string)=>(
                                        <option key={c} value={c}>{c}</option>
                                      ))}
                                      <option value="__other__">Other (type below)</option>
                                    </select>
                                  </div>

                                  <div style={{marginBottom:14}}>
                                    <div style={{fontSize:11,fontWeight:700,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.08em",fontFamily:T.mono}}>Current course (in progress)</div>
                                    <select value={prog?.current_course||""} onChange={e=>updateAG(s.key,"current_course",e.target.value||null)}
                                      style={{width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:9,padding:"10px 12px",fontSize:13,color:T.ink,fontFamily:T.sans,outline:"none",cursor:"pointer"}}>
                                      <option value="">None / not in progress</option>
                                      {(AG_COURSES[s.key]||[]).map((c:string)=>(
                                        <option key={c} value={c}>{c}</option>
                                      ))}
                                    </select>
                                  </div>

                                  <button onClick={()=>setEditingAG(null)} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:12,padding:"12px",cursor:"pointer",width:"100%"}}>
                                    Save & close →
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div style={{marginTop:10,display:"flex",gap:10,fontSize:10}}>
                      {[{color:T.green,label:"Complete"},{color:T.amber,label:"In progress"},{color:T.line,label:"Not started"}].map(({color,label})=>(
                        <div key={label} style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:8,height:8,borderRadius:2,background:color}}/><span style={{color:T.muted}}>{label}</span></div>
                      ))}
                    </div>
                    <div style={{marginTop:12,borderTop:`0.5px solid ${T.line}`,paddingTop:12}}>
                      <div style={{fontSize:11,color:T.muted,marginBottom:8}}>Click any subject to update manually, or upload your transcript to auto-fill.</div>
                      <label style={{display:"flex",alignItems:"center",gap:8,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:uploadingTranscript?T.surface2:T.navy,color:uploadingTranscript?T.muted:"#fff",border:"none",borderRadius:999,padding:"8px 14px",cursor:uploadingTranscript?"default":"pointer",width:"100%",justifyContent:"center"}}>
                        {uploadingTranscript?"Analyzing transcript...":"📄 Upload transcript (PDF or image)"}
                        <input type="file" accept=".pdf,image/*" onChange={handleTranscriptUpload} style={{display:"none"}} disabled={uploadingTranscript}/>
                      </label>
                      {transcriptResult&&<div style={{marginTop:8,fontSize:11,color:T.green,fontWeight:600,textAlign:"center"}}>{transcriptResult}</div>}
                    </div>
                  </>)}
                </div>

                {/* Courses */}
                {card(<>
                  {cardTitle("Continue learning",profile?.pillars?.length>0?"Based on your pillars":"All courses")}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                    {[{slug:"captains-mindset",title:"Captain's Mindset",icon:"★",color:T.orange,pillar:"Leadership"},{slug:"money-in-the-game",title:"Money in the Game",icon:"$",color:T.blue,pillar:"Finance"},{slug:"community-leader",title:"Community Leader",icon:"✓",color:T.green,pillar:"Civic"}].map(c=>(
                      <div key={c.slug} className="pb-card-hover" onClick={()=>router.push(`/courses/${c.slug}`)}
                        style={{background:T.surface2,border:`0.5px solid ${T.line}`,borderRadius:9,padding:"10px 12px"}}>
                        <div style={{width:32,height:32,borderRadius:8,background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,marginBottom:8}}>{c.icon}</div>
                        <div style={{fontSize:12,fontWeight:700,color:T.ink,marginBottom:2}}>{c.title}</div>
                        <div style={{fontFamily:T.mono,fontSize:9,color:c.color,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:6}}>{c.pillar}</div>
                        <div style={{background:T.line,borderRadius:999,height:3,overflow:"hidden"}}>
                          <div style={{background:c.color,height:"100%",width:"0%",borderRadius:999}}/>
                        </div>
                        <div style={{fontSize:10,color:T.faint,marginTop:3}}>Not started → Start</div>
                      </div>
                    ))}
                  </div>
                </>,{marginBottom:12})}

                {/* Resources */}
                {card(<>
                  {cardTitle("Essential resources")}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                    {RESOURCES.map(r=>(
                      <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"10px 8px",border:`0.5px solid ${T.line}`,borderRadius:9,textDecoration:"none",transition:"all 0.15s"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.orange;(e.currentTarget as HTMLElement).style.background=T.orangeL;}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.line;(e.currentTarget as HTMLElement).style.background="transparent";}}>
                        <span style={{fontSize:20}}>{r.icon}</span>
                        <span style={{fontFamily:T.mono,fontSize:9,fontWeight:700,color:T.muted,textAlign:"center",letterSpacing:"0.04em",textTransform:"uppercase"}}>{r.label}</span>
                      </a>
                    ))}
                  </div>
                </>)}
              </div>
            )}

            {/* COLLEGE */}
            {tab==="college"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  {card(<>
                    {cardTitle("Dream school")}
                    {profile?.dream_school?(
                      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
                        <div style={{width:40,height:40,borderRadius:10,background:T.orangeL,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>🎓</div>
                        <div><div style={{fontSize:15,fontWeight:700,color:T.ink}}>{profile.dream_school}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>Your target school</div></div>
                      </div>
                    ):(
                      <div style={{background:T.surface2,borderRadius:9,padding:"12px 14px",marginBottom:12,textAlign:"center"}}>
                        <div style={{fontSize:13,color:T.muted,marginBottom:8}}>No dream school set yet</div>
                        <button onClick={()=>router.push("/profile")} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"7px 14px",cursor:"pointer"}}>Add dream school →</button>
                      </div>
                    )}
                  </>)}
                  {card(<>
                    {cardTitle("Upcoming deadlines")}
                    {deadlines.length>0?(
                      deadlines.map(d=>{
                        const days=Math.ceil((new Date(d.due_date).getTime()-Date.now())/(1000*60*60*24));
                        const color=days<7?T.red:days<30?T.amber:T.green;
                        return(
                          <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`0.5px solid ${T.line}`}}>
                            <div style={{width:7,height:7,borderRadius:"50%",background:color,flexShrink:0}}/>
                            <div style={{fontFamily:T.mono,fontSize:11,fontWeight:700,color:T.muted,minWidth:44}}>{new Date(d.due_date).toLocaleDateString("en",{month:"short",day:"numeric"})}</div>
                            <div style={{fontSize:12,color:T.ink,flex:1}}>{d.title}</div>
                          </div>
                        );
                      })
                    ):(
                      <div style={{fontSize:12,color:T.muted,textAlign:"center",padding:"20px 0"}}>No deadlines added yet</div>
                    )}
                    <button onClick={()=>router.push("/profile")} style={{marginTop:10,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:"transparent",color:T.orange,border:`1px solid ${T.orange}`,borderRadius:999,padding:"6px 14px",cursor:"pointer",width:"100%"}}>+ Add deadline</button>
                  </>)}
                </div>
                {card(<>
                  {cardTitle("College list",`${collegeList.length} schools`)}
                  {collegeList.length>0?(
                    <div style={{display:"flex",flexDirection:"column",gap:7}}>
                      {collegeList.map(c=>{
                        const typeColor={reach:T.amber,match:T.blue,safety:T.green,dream:T.orange}[c.college_type]||T.muted;
                        const typeLabel={reach:"Reach",match:"Match",safety:"Safety",dream:"Dream"}[c.college_type]||c.college_type;
                        return(
                          <div key={c.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",border:`0.5px solid ${T.line}`,borderRadius:9}}>
                            <span style={{fontFamily:T.mono,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:999,background:typeColor+"18",color:typeColor}}>{typeLabel}</span>
                            <span style={{flex:1,fontSize:13,fontWeight:600,color:T.ink}}>{c.college_name}</span>
                            <span style={{fontSize:11,color:T.muted}}>{c.status}</span>
                          </div>
                        );
                      })}
                    </div>
                  ):(
                    <div style={{textAlign:"center",padding:"20px 0"}}>
                      <div style={{fontSize:13,color:T.muted,marginBottom:10}}>No colleges added yet</div>
                      <button onClick={()=>router.push("/profile")} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"8px 16px",cursor:"pointer"}}>Build your college list →</button>
                    </div>
                  )}
                </>)}
              </div>
            )}

            {/* FINANCIAL AID */}
            {tab==="aid"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  {card(<>
                    {cardTitle("FAFSA status")}
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
                      <div style={{width:10,height:10,borderRadius:"50%",background:T.amber}}/>
                      <div style={{fontSize:14,fontWeight:700,color:"#854F0B"}}>Not yet submitted</div>
                    </div>
                    <div style={{fontSize:11,color:T.muted,marginBottom:10}}>Federal deadline: Jun 30, 2025</div>
                    <div style={{background:T.orangeL,borderRadius:8,padding:"10px 12px",fontSize:12,color:"#7C2D12",lineHeight:1.5}}>Action needed: Gather FSA ID and tax documents, then submit at studentaid.gov</div>
                    <a href="https://studentaid.gov/h/apply-for-aid/fafsa" target="_blank" rel="noopener noreferrer" style={{display:"block",marginTop:10,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",borderRadius:999,padding:"8px 14px",textAlign:"center",textDecoration:"none"}}>Start FAFSA →</a>
                  </>)}
                  {card(<>
                    {cardTitle("Scholarships & grants")}
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      {[{label:"Cal Grant A",status:"Eligible",color:T.green,url:"https://www.csac.ca.gov"},{label:"CalKIDS",status:"Check eligibility",color:T.amber,url:"https://www.calkids.org"},{label:"Pell Grant",status:"Check eligibility",color:T.amber,url:"https://studentaid.gov"},{label:"Federal Work-Study",status:"With FAFSA",color:T.blue,url:"https://studentaid.gov"}].map(s=>(
                        <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" style={{display:"flex",justifyContent:"space-between",alignItems:"center",textDecoration:"none"}}>
                          <span style={{fontSize:13,color:T.ink}}>{s.label}</span>
                          <span style={{fontSize:11,color:s.color,fontWeight:700}}>{s.status} →</span>
                        </a>
                      ))}
                    </div>
                  </>)}
                </div>
                {card(<>
                  {cardTitle("Financial aid resources")}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                    {RESOURCES.filter(r=>["FAFSA","Cal Grants","CalKIDS","Common App"].includes(r.label)).map(r=>(
                      <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"12px 8px",border:`0.5px solid ${T.line}`,borderRadius:9,textDecoration:"none"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.orange;(e.currentTarget as HTMLElement).style.background=T.orangeL;}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.line;(e.currentTarget as HTMLElement).style.background="transparent";}}>
                        <span style={{fontSize:22}}>{r.icon}</span>
                        <span style={{fontFamily:T.mono,fontSize:9,fontWeight:700,color:T.muted,textAlign:"center"}}>{r.label}</span>
                      </a>
                    ))}
                  </div>
                </>)}
              </div>
            )}

            {/* CAREER */}
            {tab==="career"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  {card(<>
                    {cardTitle("Career goal")}
                    {profile?.ideal_profession?(
                      <>
                        <div style={{fontFamily:T.anton,fontSize:28,color:T.ink,lineHeight:1,marginBottom:4}}>{profile.ideal_profession}</div>
                        {profile?.desired_salary_range&&<div style={{fontSize:12,color:T.muted,marginBottom:12}}>Target salary: {profile.desired_salary_range}</div>}
                        <div style={{background:T.line,borderRadius:999,height:6,overflow:"hidden",marginBottom:4}}>
                          <div style={{background:T.purple,height:"100%",width:"40%",borderRadius:999}}/>
                        </div>
                        <div style={{fontSize:11,color:T.muted}}>Career readiness: 40%</div>
                      </>
                    ):(
                      <div style={{textAlign:"center",padding:"16px 0"}}>
                        <div style={{fontSize:13,color:T.muted,marginBottom:10}}>No career goal set yet</div>
                        <button onClick={()=>router.push("/profile")} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.purple,color:"#fff",border:"none",borderRadius:999,padding:"8px 16px",cursor:"pointer"}}>Set career goal →</button>
                      </div>
                    )}
                  </>)}
                  {card(<>
                    {cardTitle("Experience tracker")}
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                      {[
                        {label:"Internships",val:activities.filter(a=>a.activity_type==="internship").length,unit:"logged",color:activities.filter(a=>a.activity_type==="internship").length>0?T.green:T.red},
                        {label:"Volunteer hours",val:activities.filter(a=>a.activity_type==="volunteer").reduce((sum:number,a:any)=>sum+(Number(a.total_hours)||0),0),unit:"hrs",color:activities.filter(a=>a.activity_type==="volunteer").length>0?T.green:T.amber},
                        {label:"Clubs & activities",val:activities.filter(a=>a.activity_type==="club"||a.activity_type==="extracurricular").length,unit:"logged",color:activities.filter(a=>a.activity_type==="club"||a.activity_type==="extracurricular").length>0?T.green:T.amber},
                        {label:"Certifications",val:certificates.length,unit:"earned",color:certificates.length>0?T.green:T.red},
                      ].map(({label,val,unit,color})=>(
                        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`0.5px solid ${T.line}`}}>
                          <span style={{fontSize:13,color:T.ink}}>{label}</span>
                          <span style={{fontSize:12,fontWeight:700,color}}>{val} {unit}</span>
                        </div>
                      ))}
                    </div>
                    {activities.length>0&&(
                      <div style={{marginBottom:12}}>
                        {activities.slice(0,3).map((a:any)=>(
                          <div key={a.id} style={{fontSize:11,color:T.muted,padding:"4px 0",borderBottom:`0.5px solid ${T.line}`}}>
                            <span style={{fontWeight:600,color:T.ink}}>{a.activity_name}</span>
                            {a.organization&&<span> · {a.organization}</span>}
                            {a.total_hours&&<span> · {a.total_hours}hrs</span>}
                          </div>
                        ))}
                      </div>
                    )}
                    <button onClick={()=>setShowAddActivity(!showAddActivity)} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:showAddActivity?T.surface2:T.navy,color:showAddActivity?T.muted:"#fff",border:`1px solid ${T.line}`,borderRadius:999,padding:"8px 14px",cursor:"pointer",width:"100%",marginBottom:showAddActivity?10:0}}>
                      {showAddActivity?"Cancel":"+ Add experience"}
                    </button>
                    {showAddActivity&&(
                      <div style={{display:"flex",flexDirection:"column",gap:8}}>
                        <select value={newActivityType} onChange={e=>setNewActivityType(e.target.value)} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.ink,fontFamily:T.sans,outline:"none"}}>
                          <option value="">Activity type...</option>
                          {["internship","volunteer","club","extracurricular","job","award","leadership","other"].map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
                        </select>
                        <input placeholder="Activity name *" value={newActivityName} onChange={e=>setNewActivityName(e.target.value)} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.ink,fontFamily:T.sans,outline:"none"}}/>
                        <input placeholder="Organization (optional)" value={newActivityOrg} onChange={e=>setNewActivityOrg(e.target.value)} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.ink,fontFamily:T.sans,outline:"none"}}/>
                        <input placeholder="Total hours (optional)" type="number" value={newActivityHours} onChange={e=>setNewActivityHours(e.target.value)} style={{width:"100%",background:T.surface,border:`1.5px solid ${T.line}`,borderRadius:8,padding:"9px 12px",fontSize:13,color:T.ink,fontFamily:T.sans,outline:"none"}}/>
                        <button disabled={addingActivity||!newActivityName.trim()||!newActivityType} onClick={async()=>{
                          if(!newActivityName.trim()||!newActivityType||!profile?.id)return;
                          setAddingActivity(true);
                          const{data}=await supabase.from("student_activities").insert({student_id:profile.id,activity_type:newActivityType,activity_name:newActivityName.trim(),organization:newActivityOrg||null,total_hours:newActivityHours?Number(newActivityHours):null}).select().single();
                          if(data)setActivities((prev:any[])=>[data,...prev]);
                          setNewActivityType("");setNewActivityName("");setNewActivityOrg("");setNewActivityHours("");
                          setShowAddActivity(false);setAddingActivity(false);
                        }} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"9px 14px",cursor:"pointer",width:"100%",opacity:addingActivity||!newActivityName.trim()||!newActivityType?0.6:1}}>
                          {addingActivity?"Saving...":"Save experience →"}
                        </button>
                      </div>
                    )}
                  </>)}
                </div>
                {card(<>
                  {cardTitle("Career resources")}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:7}}>
                    {RESOURCES.filter(r=>["CareerOneStop","AmeriCorps","Common App","NCAA Eligibility"].includes(r.label)).map(r=>(
                      <a key={r.label} href={r.url} target="_blank" rel="noopener noreferrer"
                        style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"12px 8px",border:`0.5px solid ${T.line}`,borderRadius:9,textDecoration:"none"}}
                        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.orange;(e.currentTarget as HTMLElement).style.background=T.orangeL;}}
                        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor=T.line;(e.currentTarget as HTMLElement).style.background="transparent";}}>
                        <span style={{fontSize:22}}>{r.icon}</span>
                        <span style={{fontFamily:T.mono,fontSize:9,fontWeight:700,color:T.muted,textAlign:"center"}}>{r.label}</span>
                      </a>
                    ))}
                  </div>
                </>)}
              </div>
            )}

            {/* ATHLETIC */}
            {tab==="athletic"&&isAthlete&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  {card(<>
                    {cardTitle("Recruiting profile")}
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                      {[{label:"Status",val:profile?.recruiting_status||"Not set",highlight:!!profile?.recruiting_status},{label:"Target level",val:profile?.desired_college_level||"Not set",highlight:!!profile?.desired_college_level},{label:"Sport",val:profile?.sport?(profile.sport+(profile?.position?` · ${profile.position}`:"")):"Not set",highlight:!!profile?.sport},{label:"Highlight reel",val:profile?.highlight_reel_url?"Linked ✓":"Not added",highlight:!!profile?.highlight_reel_url}].map(({label,val,highlight})=>(
                        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:12,color:T.muted}}>{label}</span>
                          <span style={{fontSize:12,fontWeight:700,color:highlight?T.green:T.red}}>{val}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{background:T.greenL,borderRadius:8,padding:"8px 12px",fontSize:11,color:T.teal,fontWeight:600}}>NCAA eligibility: On track ✓</div>
                    <a href="https://web3.ncaa.org/ecwr3/" target="_blank" rel="noopener noreferrer" style={{display:"block",marginTop:8,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.navy,color:"#fff",borderRadius:999,padding:"7px 14px",textAlign:"center",textDecoration:"none"}}>Check NCAA eligibility →</a>
                  </>)}
                  {card(<>
                    {cardTitle("NIL profile")}
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:12}}>
                      {[{label:"Instagram",val:profile?.nil_instagram||"Not set"},{label:"TikTok",val:profile?.nil_tiktok||"Not set"},{label:"Followers",val:profile?.nil_follower_range||"Not set"},{label:"Brand interests",val:profile?.nil_brand_interests?.slice(0,2).join(", ")||"Not set"},{label:"Deal types",val:profile?.nil_deal_types?.slice(0,2).join(", ")||"Not set"},{label:"Worked with brands",val:profile?.nil_worked_with_brands?"Yes ✓":"Not yet"}].map(({label,val})=>(
                        <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{fontSize:12,color:T.muted}}>{label}</span>
                          <span style={{fontSize:12,color:T.ink,maxWidth:140,textAlign:"right",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{val}</span>
                        </div>
                      ))}
                    </div>
                    <button onClick={()=>router.push("/profile")} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.orange,color:"#fff",border:"none",borderRadius:999,padding:"8px 14px",cursor:"pointer",width:"100%"}}>Complete NIL profile →</button>
                  </>)}
                </div>
                {card(<>
                  {cardTitle("Coach & team info")}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                    {[{label:"Coach",val:profile?.coach_name||"Not set"},{label:"Coach email",val:profile?.coach_email||"Not set"},{label:"Team level",val:profile?.team_level||"Not set"},{label:"Travel team",val:profile?.travel_team||"Not set"},{label:"Jersey #",val:profile?.jersey_number||"Not set"},{label:"Height / Weight",val:profile?.height?(profile.height+(profile?.weight?` · ${profile.weight}lbs`:"")):"Not set"}].map(({label,val})=>(
                      <div key={label}>
                        <div style={{fontSize:10,color:T.faint,fontFamily:T.mono,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:3}}>{label}</div>
                        <div style={{fontSize:13,fontWeight:600,color:T.ink}}>{val}</div>
                      </div>
                    ))}
                  </div>
                </>)}
              </div>
            )}

            {/* COMMUNITY */}
            {tab==="community"&&(
              <div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                  {card(<>
                    {cardTitle("My mentors")}
                    <div style={{fontSize:12,color:T.muted,textAlign:"center",padding:"20px 0"}}>
                      <div style={{fontSize:24,marginBottom:8}}>🧭</div>
                      No mentors connected yet
                      <br/>
                      <button onClick={()=>router.push("/mentorship")} style={{marginTop:10,fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.navy,color:"#fff",border:"none",borderRadius:999,padding:"8px 16px",cursor:"pointer"}}>Find a mentor →</button>
                    </div>
                  </>)}
                  {card(<>
                    {cardTitle("Recent activity")}
                    <div style={{display:"flex",flexDirection:"column",gap:8}}>
                      <div style={{fontSize:12,color:T.muted,textAlign:"center",padding:"16px 0"}}>
                        <div style={{fontSize:24,marginBottom:8}}>📣</div>
                        <div style={{marginBottom:10}}>Join the conversation</div>
                        <div style={{display:"flex",gap:8,justifyContent:"center",flexWrap:"wrap"}}>
                          {[{icon:"📣",label:"Feed",path:"/feed"},{icon:"💬",label:"Messages",path:"/messages"},{icon:"🏆",label:"Leaderboard",path:"/leaderboard"},{icon:"📅",label:"Events",path:"/events"}].map(({icon,label,path})=>(
                            <button key={label} onClick={()=>router.push(path)} style={{fontFamily:T.mono,fontSize:10,fontWeight:700,letterSpacing:"0.05em",textTransform:"uppercase",background:T.navy,color:"#fff",border:"none",borderRadius:999,padding:"7px 12px",cursor:"pointer"}}>
                              {icon} {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>)}
                </div>
              </div>
            )}
          </>
        )}

        {/* PARENT VIEW */}
        {view==="parent"&&(
          <div>
            <div style={{background:"#FAEEDA",border:`0.5px solid #F59E0B`,borderRadius:12,padding:"14px 16px",marginBottom:12}}>
              <div style={{fontSize:13,fontWeight:700,color:"#854F0B",marginBottom:10}}>Alerts needing attention</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {!profile?.dream_school&&<div style={{fontSize:12,color:"#854F0B"}}>⚠ <strong>Dream school</strong> not set — help {name} add their target college.</div>}
                {agDone<agTotal&&<div style={{fontSize:12,color:"#854F0B"}}>⚠ <strong>A-G requirements</strong> — {agTotal-agDone} subjects still needed for UC/CSU eligibility.</div>}
                <div style={{fontSize:12,color:"#854F0B"}}>⚠ <strong>FAFSA</strong> not submitted — federal deadline approaching. Submit at studentaid.gov</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              {card(<>
                {cardTitle("Overall progress")}
                <div style={{fontFamily:T.anton,fontSize:40,color:T.green,lineHeight:1,marginBottom:4}}>{readiness}%</div>
                <div style={{fontSize:11,color:T.muted,marginBottom:8}}>College readiness score</div>
                <div style={{background:T.line,borderRadius:999,height:6,overflow:"hidden",marginBottom:12}}>
                  <div style={{background:T.green,height:"100%",width:`${readiness}%`,borderRadius:999}}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                  {[{label:"A-G status",val:`${agDone}/${agTotal}`},{label:"Courses",val:`${profile?.xp||0} XP`},{label:"Dream school",val:profile?.dream_school?"Set ✓":"Not set"},{label:"Profile",val:profile?.bio?"Complete":"Incomplete"}].map(({label,val})=>(
                    <div key={label} style={{fontSize:11}}><span style={{color:T.muted}}>{label}:</span> <strong>{val}</strong></div>
                  ))}
                </div>
              </>)}
              {card(<>
                {cardTitle("Upcoming deadlines")}
                {deadlines.length>0?deadlines.map(d=>(
                  <div key={d.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 0",borderBottom:`0.5px solid ${T.line}`}}>
                    <div style={{width:7,height:7,borderRadius:"50%",background:T.amber,flexShrink:0}}/>
                    <div style={{fontFamily:T.mono,fontSize:11,color:T.muted,minWidth:44}}>{new Date(d.due_date).toLocaleDateString("en",{month:"short",day:"numeric"})}</div>
                    <div style={{fontSize:12,color:T.ink}}>{d.title}</div>
                  </div>
                )):<div style={{fontSize:12,color:T.muted,padding:"12px 0"}}>No deadlines added yet</div>}
              </>)}
            </div>
          </div>
        )}

        {/* COACH VIEW */}
        {view==="coach"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:12}}>
              {[{label:"Scholar profile",val:name,sub:profile?.school||"School not set"},{label:"Sport",val:profile?.sport||"Not set",sub:profile?.position||""},{label:"Recruiting status",val:profile?.recruiting_status||"Not set",sub:profile?.desired_college_level||""}].map(({label,val,sub})=>(
                <div key={label} style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:12,padding:"14px 16px"}}>
                  <div style={{fontSize:11,color:T.muted,marginBottom:4,fontFamily:T.mono,textTransform:"uppercase",letterSpacing:"0.08em"}}>{label}</div>
                  <div style={{fontSize:16,fontWeight:700,color:T.ink}}>{val}</div>
                  {sub&&<div style={{fontSize:11,color:T.faint,marginTop:2}}>{sub}</div>}
                </div>
              ))}
            </div>
            {card(<>
              {cardTitle("Scholar overview")}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
                <div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:8}}>Academic</div>
                  {[{label:"GPA",val:profile?.gpa||"Not set"},{label:"A-G progress",val:`${agDone}/${agTotal} subjects`},{label:"Dream school",val:profile?.dream_school||"Not set"},{label:"College readiness",val:`${readiness}%`}].map(({label,val})=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`0.5px solid ${T.line}`}}>
                      <span style={{fontSize:12,color:T.muted}}>{label}</span>
                      <span style={{fontSize:12,fontWeight:700,color:T.ink}}>{val}</span>
                    </div>
                  ))}
                </div>
                {isAthlete&&<div>
                  <div style={{fontSize:12,color:T.muted,marginBottom:8}}>Athletic</div>
                  {[{label:"Sport",val:profile?.sport||"Not set"},{label:"Position",val:profile?.position||"Not set"},{label:"Height",val:profile?.height||"Not set"},{label:"Highlight reel",val:profile?.highlight_reel_url?"Linked ✓":"Not added"}].map(({label,val})=>(
                    <div key={label} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:`0.5px solid ${T.line}`}}>
                      <span style={{fontSize:12,color:T.muted}}>{label}</span>
                      <span style={{fontSize:12,fontWeight:700,color:T.ink}}>{val}</span>
                    </div>
                  ))}
                </div>}
              </div>
            </>)}
          </div>
        )}
      </div>
    </div>
  );
}
