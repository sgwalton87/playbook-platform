"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

type Activity = { title?: string; deliverable?: string; instructions?: string[]; estimated_minutes?: number };
type Checkpoint = { type?: string; prompt?: string; question?: string; options?: string[] };
type Interaction = { type?: string; label?: string; prompt?: string; min?: number; max?: number };
type ModuleResponse = { activity_response: unknown; interaction_responses: Record<string, unknown>; checkpoint_selected_index: number | null; checkpoint_passed: boolean | null } | null;
type Module = {
  module_key: string; position: number; title: string; duration_minutes: number; module_type: string; summary: string; content: string;
  completion_mode: "acknowledge" | "reflection"; required: boolean; learning_objectives: string[]; activity: Activity | null;
  knowledge_checkpoint: Checkpoint | null; interactions: Interaction[];
  progress: { reflection: string | null; completed_at: string } | null; response: ModuleResponse;
};
type Course = { slug:string; title:string; description:string; pillar:string; image_url:string|null; xp_per_module:number; coins_per_module:number; course_xp_bonus:number; course_coin_bonus:number; certificate_name:string };
type CourseResponse = { course?:Course; modules?:Module[]; credential?:{id:string;credential_name:string;issued_at:string}|null; error?:string };

type Draft = { activity: string; interactions: Record<string,string>; checkpointIndex: number | null; reflection: string };
const emptyDraft = ():Draft => ({ activity:"", interactions:{}, checkpointIndex:null, reflection:"" });

async function getCourse(slug:string):Promise<CourseResponse>{
  const response=await fetch(`/api/learning/courses/${encodeURIComponent(slug)}`,{cache:"no-store"});
  const result=await response.json() as CourseResponse;
  if(!response.ok) throw new Error(result.error||"Course could not be loaded.");
  return result;
}

export default function CoursePage(){
  const params=useParams<{slug:string}>(); const slug=String(params?.slug||"");
  const[course,setCourse]=useState<Course|null>(null); const[modules,setModules]=useState<Module[]>([]); const[credential,setCredential]=useState<CourseResponse["credential"]>(null);
  const[openModule,setOpenModule]=useState<string|null>(null); const[drafts,setDrafts]=useState<Record<string,Draft>>({});
  const[loading,setLoading]=useState(true); const[busy,setBusy]=useState<string|null>(null); const[message,setMessage]=useState("Loading course…"); const[error,setError]=useState("");

  function hydrate(result:CourseResponse){
    const items=result.modules||[]; setCourse(result.course||null); setModules(items); setCredential(result.credential||null);
    setOpenModule(current=>current||items.find(module=>!module.progress)?.module_key||items[0]?.module_key||null);
    setDrafts(current=>{const next={...current}; for(const module of items){if(!next[module.module_key]) next[module.module_key]=emptyDraft();} return next;});
    setMessage(result.credential?"Course complete. Credential issued.":"Course progress is current.");
  }
  async function load(){setError("");const result=await getCourse(slug);hydrate(result);setLoading(false);}
  useEffect(()=>{if(!slug)return;let active=true;void getCourse(slug).then(result=>{if(active)hydrate(result);}).catch(cause=>{if(active)setError(cause instanceof Error?cause.message:"Course could not be loaded.");}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[slug]);

  function updateDraft(moduleKey:string,patch:Partial<Draft>){setDrafts(current=>({...current,[moduleKey]:{...(current[moduleKey]||emptyDraft()),...patch}}));}
  async function saveWork(module:Module){
    const draft=drafts[module.module_key]||emptyDraft(); setBusy(`${module.module_key}:work`); setError("");
    try{
      const response=await fetch(`/api/learning/courses/${encodeURIComponent(slug)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({action:"save-work",moduleKey:module.module_key,activityResponse:draft.activity||null,interactionResponses:draft.interactions,checkpointIndex:draft.checkpointIndex})});
      const result=await response.json() as {assessment?:{checkpoint_required?:boolean;checkpoint_passed?:boolean;checkpoint_explanation?:string|null};error?:string};
      if(!response.ok)throw new Error(result.error||"Module work could not be saved.");
      if(result.assessment?.checkpoint_required&&!result.assessment.checkpoint_passed){setError("That checkpoint answer is not correct yet. Review the lesson and try again.");}
      else setMessage(result.assessment?.checkpoint_explanation||"Your module work is saved and the checkpoint is complete.");
      await load();
    }catch(cause){setError(cause instanceof Error?cause.message:"Module work could not be saved.");}finally{setBusy(null);}
  }
  async function complete(module:Module){
    if(module.progress)return; const draft=drafts[module.module_key]||emptyDraft(); const reflection=draft.reflection.trim();
    if(module.completion_mode==="reflection"&&reflection.length<20){setError("Write a meaningful reflection of at least 20 characters before completing this module.");return;}
    setBusy(`${module.module_key}:complete`);setError("");
    try{
      const response=await fetch(`/api/learning/courses/${encodeURIComponent(slug)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({moduleKey:module.module_key,reflection:reflection||null})});
      const result=await response.json() as {outcome?:{course_completed?:boolean;coins_awarded?:number;xp_awarded?:number};error?:string};
      if(!response.ok)throw new Error(result.error||"Module could not be completed.");
      const outcome=result.outcome; setMessage(outcome?.course_completed?`Course complete. +${outcome.xp_awarded||0} XP and +${outcome.coins_awarded||0} coins were issued idempotently.`:`Module complete. +${outcome?.xp_awarded||0} XP and +${outcome?.coins_awarded||0} coins were issued.`); await load();
    }catch(cause){setError(cause instanceof Error?cause.message:"Module could not be completed.");}finally{setBusy(null);}
  }

  const completedCount=modules.filter(module=>module.progress).length, requiredCount=modules.length;
  const percent=requiredCount?Math.round(completedCount/requiredCount*100):0;
  const totalMinutes=useMemo(()=>modules.reduce((total,module)=>total+module.duration_minutes,0),[modules]);
  if(loading)return <PlaybookPage><div style={state}>Loading canonical course…</div></PlaybookPage>;
  if(!course)return <PlaybookPage><PlaybookCard eyebrow="Learning" title="Course not found"><Link href="/courses">Return to Courses</Link></PlaybookCard></PlaybookPage>;

  return <PlaybookPage>
    <PlaybookHero eyebrow={`${course.pillar} · Canonical Learning`} title={course.title} subtitle={course.description}/>
    <PlaybookMetrics><PlaybookMetric label="Progress" value={`${percent}%`}/><PlaybookMetric label="Modules" value={`${completedCount}/${requiredCount}`}/><PlaybookMetric label="Learning time" value={`${totalMinutes} min`}/><PlaybookMetric label="Credential" value={credential?"Earned":"Locked"}/></PlaybookMetrics>
    <div role="status" aria-live="polite" style={status}>{message}</div>{error&&<div role="alert" style={alert}>{error}</div>}
    {course.image_url&&<div style={heroMedia}><Image unoptimized fill src={course.image_url} alt="" style={{objectFit:"cover"}}/></div>}
    {credential&&<PlaybookCard eyebrow="Credential issued" title={credential.credential_name}><p style={copy}>Issued {new Date(credential.issued_at).toLocaleDateString()}. This credential is backed by durable completion evidence.</p><div style={buttonRow}><Link href="/certificates" style={primaryLink}>Open credential vault</Link><Link href="/badges" style={secondaryLink}>View badges</Link></div></PlaybookCard>}
    <section style={sectionHeader}><p style={eyebrow}>Course modules</p><h2 style={heading}>Learn → practice → prove → reflect</h2><p style={copy}>Leadership-quality modules preserve objectives, applied work, interactions, knowledge checks, and durable completion evidence.</p></section>
    <PlaybookGrid min={360}>{modules.map(module=>{
      const open=openModule===module.module_key; const draft=drafts[module.module_key]||emptyDraft(); const hasRichWork=Boolean(module.activity||module.interactions?.length||module.knowledge_checkpoint); const checkpointPassed=!module.knowledge_checkpoint||module.response?.checkpoint_passed===true;
      return <PlaybookCard key={module.module_key} eyebrow={`Module ${module.position} · ${module.module_type}`} title={module.title}>
        <div style={moduleMeta}><PlaybookPill>{module.duration_minutes} min</PlaybookPill>{hasRichWork&&<PlaybookPill>Applied learning</PlaybookPill>}{module.knowledge_checkpoint&&<PlaybookPill>{checkpointPassed?"Checkpoint passed":"Checkpoint required"}</PlaybookPill>}{module.progress&&<PlaybookPill>Completed</PlaybookPill>}</div>
        <p style={copy}>{module.summary}</p><button onClick={()=>setOpenModule(open?null:module.module_key)} style={secondaryButton}>{open?"Hide lesson":"Open lesson"}</button>
        {open&&<div style={lesson}>
          {module.learning_objectives?.length>0&&<section><h3 style={miniHeading}>Learning objectives</h3><ul style={list}>{module.learning_objectives.map(objective=><li key={objective}>{objective}</li>)}</ul></section>}
          <section><h3 style={miniHeading}>Lesson</h3><p style={lessonCopy}>{module.content}</p></section>
          {module.activity&&<section style={workBlock}><h3 style={miniHeading}>{module.activity.title||"Applied activity"}</h3>{module.activity.instructions?.length&&<ol style={list}>{module.activity.instructions.map(step=><li key={step}>{step}</li>)}</ol>}{module.activity.deliverable&&<p style={copy}><strong>Deliverable:</strong> {module.activity.deliverable}</p>} {!module.progress&&<textarea aria-label={`${module.title} activity response`} value={draft.activity} onChange={event=>updateDraft(module.module_key,{activity:event.target.value})} rows={4} style={textarea} placeholder="Record your activity work or reflection here."/>}</section>}
          {module.interactions?.length>0&&<section style={workBlock}><h3 style={miniHeading}>Interactive practice</h3>{module.interactions.map((interaction,index)=>{const key=String(index);const label=interaction.label||interaction.prompt||`Interaction ${index+1}`;return <label key={key} style={reflectionLabel}>{label}{interaction.type?.includes("slider")?<input type="range" min={interaction.min??1} max={interaction.max??5} value={draft.interactions[key]||String(interaction.min??1)} onChange={event=>updateDraft(module.module_key,{interactions:{...draft.interactions,[key]:event.target.value}})}/>:<textarea value={draft.interactions[key]||""} onChange={event=>updateDraft(module.module_key,{interactions:{...draft.interactions,[key]:event.target.value}})} rows={3} style={textarea}/>}</label>;})}</section>}
          {module.knowledge_checkpoint&&<fieldset style={workBlock}><legend style={miniHeading}>Knowledge checkpoint</legend><p style={lessonCopy}>{module.knowledge_checkpoint.prompt||module.knowledge_checkpoint.question}</p>{module.knowledge_checkpoint.options?.map((option,index)=><label key={option} style={optionRow}><input type="radio" name={`${module.module_key}-checkpoint`} checked={draft.checkpointIndex===index} onChange={()=>updateDraft(module.module_key,{checkpointIndex:index})}/>{option}</label>)}</fieldset>}
          {!module.progress&&hasRichWork&&<button type="button" onClick={()=>void saveWork(module)} disabled={busy===`${module.module_key}:work`} style={secondaryButton}>{busy===`${module.module_key}:work`?"Saving work…":module.response?"Update module work":"Save module work"}</button>}
          {module.progress?<div style={completedBox}><strong>Completed {new Date(module.progress.completed_at).toLocaleString()}</strong>{module.progress.reflection&&<p style={copy}>Your reflection: {module.progress.reflection}</p>}</div>:<><label style={reflectionLabel}>Final reflection<textarea value={draft.reflection} onChange={event=>updateDraft(module.module_key,{reflection:event.target.value})} minLength={20} maxLength={4000} rows={5} style={textarea} placeholder="What did you learn, decide, or plan to do next?"/></label><button onClick={()=>void complete(module)} disabled={busy===`${module.module_key}:complete`} style={primaryButton}>{busy===`${module.module_key}:complete`?"Recording…":"Complete module"}</button></>}
        </div>}
      </PlaybookCard>;
    })}</PlaybookGrid>
    <div style={buttonRow}><Link href="/courses" style={secondaryLink}>← All courses</Link><Link href="/store" style={secondaryLink}>Reward Store</Link></div>
  </PlaybookPage>;
}

const state:React.CSSProperties={maxWidth:1180,margin:"0 auto",padding:30,borderRadius:20,background:"#FFFFFF",color:"#64748B"};
const status:React.CSSProperties={maxWidth:1180,margin:"0 auto 14px",color:"#334155"};
const alert:React.CSSProperties={maxWidth:1180,margin:"0 auto 14px",padding:13,borderRadius:12,background:"#FEF2F2",border:"1px solid #FCA5A5",color:"#991B1B"};
const heroMedia:React.CSSProperties={position:"relative",maxWidth:1180,minHeight:280,margin:"0 auto 22px",borderRadius:"28px 8px 28px 8px",overflow:"hidden",background:"#E2E8F0"};
const sectionHeader:React.CSSProperties={maxWidth:1180,margin:"30px auto 16px"}; const eyebrow:React.CSSProperties={margin:0,color:"#EA580C",fontSize:11,fontWeight:950,letterSpacing:".14em",textTransform:"uppercase"}; const heading:React.CSSProperties={margin:"7px 0",color:"#0F172A",fontSize:"clamp(28px,4vw,42px)"};
const moduleMeta:React.CSSProperties={display:"flex",gap:7,flexWrap:"wrap",marginBottom:12}; const copy:React.CSSProperties={color:"#64748B",lineHeight:1.6}; const lesson:React.CSSProperties={marginTop:15,padding:18,borderRadius:16,background:"#F8FAFC",border:"1px solid #E2E8F0",display:"grid",gap:18}; const lessonCopy:React.CSSProperties={color:"#334155",lineHeight:1.75,fontSize:16,whiteSpace:"pre-line"};
const miniHeading:React.CSSProperties={margin:"0 0 8px",color:"#0F172A",fontSize:18}; const list:React.CSSProperties={margin:"8px 0 0",paddingLeft:22,color:"#475569",lineHeight:1.7}; const workBlock:React.CSSProperties={padding:15,borderRadius:14,background:"#FFFFFF",border:"1px solid #E2E8F0"}; const optionRow:React.CSSProperties={display:"flex",gap:9,alignItems:"flex-start",margin:"9px 0",color:"#334155"};
const completedBox:React.CSSProperties={padding:13,borderRadius:12,background:"#ECFDF5",border:"1px solid #A7F3D0",color:"#065F46"}; const reflectionLabel:React.CSSProperties={display:"grid",gap:7,color:"#0F172A",fontWeight:850}; const textarea:React.CSSProperties={width:"100%",resize:"vertical",border:"1px solid #CBD5E1",borderRadius:12,padding:12,background:"#FFFFFF",color:"#0F172A",fontWeight:500};
const buttonRow:React.CSSProperties={maxWidth:1180,margin:"18px auto",display:"flex",gap:9,flexWrap:"wrap"}; const baseButton:React.CSSProperties={borderRadius:999,padding:"10px 14px",fontWeight:900,cursor:"pointer"}; const primaryButton:React.CSSProperties={...baseButton,border:0,background:"#F97316",color:"#FFFFFF"}; const secondaryButton:React.CSSProperties={...baseButton,border:"1px solid #CBD5E1",background:"#FFFFFF",color:"#0F172A"}; const primaryLink:React.CSSProperties={display:"inline-block",padding:"10px 14px",borderRadius:999,background:"#F97316",color:"#FFFFFF",textDecoration:"none",fontWeight:900}; const secondaryLink:React.CSSProperties={...primaryLink,background:"#FFFFFF",color:"#0F172A",border:"1px solid #CBD5E1"};