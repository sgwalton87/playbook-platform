"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AG_SUBJECT_NAMES, AG_REQUIREMENTS } from "@/lib/agCourses";
import { PlaybookStoryBanner, PlaybookQuote } from "@/components/brand-story";
import { PLAYBOOK_QUOTES, PLAYBOOK_STORY_IMAGES } from "@/lib/brand-story";
import TranscriptUploadCard from "@/components/transcript/TranscriptUploadCard";
import {
  buildScholarRecord,
  type CommunityExperience,
  type RawCommunityActivity,
  type ScholarRecord,
} from "@/lib/scholar";

const T={navy:"#0F172A",cream:"#F8F7F4",surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",faint:"#94A3B8",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",green:"#10B981",greenL:"#ECFDF5",amber:"#F59E0B",red:"#E24B4A",blue:"#3B82F6",purple:"#8B5CF6",mono:"'Space Mono',monospace",sans:"'Hanken Grotesk',system-ui,sans-serif",anton:"'Anton',sans-serif"};

export default function TranscriptPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [scholarRecord, setScholarRecord] = useState<ScholarRecord | null>(null);
  const [agProgress, setAgProgress] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [activities, setActivities] = useState<RawCommunityActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { router.replace("/login"); return; }
      const [{ data: p }, { data: ag }, { data: certs }, { data: acts }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).single(),
        supabase.from("ag_progress").select("*").eq("user_id", u.user.id).order("updated_at", { ascending: false }),
        supabase.from("certificates").select("*").eq("user_id", u.user.id),
        supabase.from("student_activities").select("*").eq("student_id", u.user.id),
      ]);
      setProfile(p);
      const record = buildScholarRecord({ profile: p, agProgress: ag || [], certificates: certs || [], activities: acts || [] });
      setScholarRecord(record);
      setAgProgress(record.academics.agProgress.map((a)=>({
        subject: a.subject,
        years_completed: a.yearsCompleted,
        years_required: a.yearsRequired,
        in_progress: a.inProgress,
        courses_taken: a.coursesTaken,
        current_course: a.currentCourse,
      })));
      setCertificates(certs||[]);
      setActivities((acts || []) as RawCommunityActivity[]);
      setLoading(false);
    })();
  }, []);

  if (loading) return <><div style={{padding:"28px 32px",fontFamily:T.mono,fontSize:12,color:T.faint}}>Loading transcript...</div></>;

  const academic = scholarRecord?.academics;
  const agDone = academic?.agSummary.subjectsMet ?? agProgress.filter(a => a.years_completed >= a.years_required).length;
  const communityActivities = scholarRecord?.community.activities ?? [];

  return (
    <>
<>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');*,*::before,*::after{box-sizing:border-box;}@media print{.no-print{display:none!important;}}`}</style>
      <div style={{marginBottom:24}}>
        <PlaybookStoryBanner
          eyebrow="The Playbook Transcript"
          title="Your record is the map."
          body={PLAYBOOK_QUOTES.transcript}
          imageSrc={PLAYBOOK_STORY_IMAGES.academic}
          imageAlt="Scholars preparing for college and opportunity"
        />
      </div>

      <div style={{display:"flex",gap:24,alignItems:"flex-start",width:"100%"}}>

        <div className="no-print" style={{width:260,flexShrink:0,display:"flex",flexDirection:"column",gap:14,position:"sticky",top:28}}>
          {academic?.dreamSchool&&(
            <div style={{background:T.navy,borderRadius:14,padding:"16px"}}>
              <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(248,247,244,.4)",marginBottom:8}}>Dream school</div>
              <div style={{fontSize:14,fontWeight:700,color:"#F8F7F4",marginBottom:4}}>🎓 {academic?.dreamSchool}</div>
              {academic?.intendedMajor&&<div style={{fontSize:12,color:"rgba(248,247,244,.5)"}}>Intended major: {academic?.intendedMajor}</div>}
            </div>
          )}
          <div style={{background:T.navy,borderRadius:16,padding:"18px 16px",color:"#F8F7F4"}}>
            <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:"rgba(248,247,244,.4)",marginBottom:10}}>College readiness</div>
            <div style={{fontFamily:T.anton,fontSize:52,color:agDone===7?T.green:T.orange,lineHeight:1,marginBottom:4}}>{Math.round((agDone/7)*100)}%</div>
            <div style={{fontSize:12,color:"rgba(248,247,244,.5)",marginBottom:12}}>{agDone}/7 A-G subjects met</div>
            <div style={{background:"rgba(255,255,255,.1)",borderRadius:999,height:6,overflow:"hidden"}}>
              <div style={{background:agDone===7?T.green:T.orange,height:"100%",width:`${Math.round((agDone/7)*100)}%`,borderRadius:999}}/>
            </div>
          </div>
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:14,padding:"16px"}}>
            <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:12}}>Academic stats</div>
            {[{label:"Weighted GPA",val:academic?.weightedGpa||academic?.gpa||"—",color:T.green},{label:"Unweighted GPA",val:academic?.unweightedGpa||"—",color:T.blue},{label:"SAT Score",val:academic?.sat.total||"—",color:T.purple},{label:"ACT Score",val:academic?.act.composite||"—",color:T.amber},{label:"Grad year",val:academic?.graduationYear||"—",color:T.orange}].map(({label,val,color})=>(
              <div key={label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`0.5px solid ${T.line}`}}>
                <span style={{fontSize:12,color:T.muted}}>{label}</span>
                <span style={{fontFamily:T.mono,fontSize:13,fontWeight:700,color}}>{val}</span>
              </div>
            ))}
          </div>
          <div style={{background:T.surface,border:`0.5px solid ${T.line}`,borderRadius:14,padding:"16px"}}>
            <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:12}}>UC/CSU A-G Requirements</div>
            {[{letter:"A",name:"History",req:2},{letter:"B",name:"English",req:4},{letter:"C",name:"Math",req:3},{letter:"D",name:"Science",req:2},{letter:"E",name:"Language",req:2},{letter:"F",name:"Arts",req:1},{letter:"G",name:"Elective",req:1}].map(({letter,name,req})=>{
              const years=agProgress.find(a=>a.subject===letter)?.years_completed||0;
              const done=Number(years)>=req;
              const pct=Math.min((Number(years)/req)*100,100);
              return(
                <div key={letter} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                    <span style={{fontSize:11,color:T.ink}}><strong style={{color:done?T.green:T.orange}}>{letter}</strong> — {name}</span>
                    <span style={{fontFamily:T.mono,fontSize:10,color:done?T.green:T.muted}}>{Number(years)}/{req}yr</span>
                  </div>
                  <div style={{background:T.line,borderRadius:999,height:4,overflow:"hidden"}}>
                    <div style={{background:done?T.green:T.orange,height:"100%",width:`${pct}%`,borderRadius:999}}/>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{background:T.orangeL,border:`0.5px solid #FED7AA`,borderRadius:14,padding:"16px"}}>
            <div style={{fontFamily:T.mono,fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:T.orange,marginBottom:10}}>💡 Tips for success</div>
            {[agDone<7?"Complete all A-G requirements to qualify for UC and CSU.":null,!academic?.weightedGpa&&!academic?.gpa?"Add your GPA to strengthen your application.":null,"Request transcripts early — colleges need official copies.","A-G courses must be completed with a C or better to count."].filter(Boolean).slice(0,4).map((tip,i)=>(
              <div key={i} style={{display:"flex",gap:8,fontSize:11,color:"#7C2D12",lineHeight:1.5,marginBottom:6}}>
                <span style={{flexShrink:0}}>→</span><span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{flex:1,minWidth:0}}>
          <TranscriptUploadCard onParsed={() => window.location.reload()} />
          <div className="no-print" style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
            <h1 style={{fontFamily:T.anton,fontWeight:400,fontSize:28,textTransform:"uppercase",color:T.ink}}>Academic Transcript</h1>
            <button onClick={()=>window.print()} style={{fontFamily:T.mono,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:T.navy,color:"#fff",border:"none",borderRadius:12,padding:"10px 20px",cursor:"pointer"}}>🖨 Print / Save PDF</button>
          </div>
          <div style={{background:T.navy,borderRadius:16,padding:"24px 28px",marginBottom:20,color:"#F8F7F4"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:T.orange,marginBottom:6}}>Official Academic Record</div>
                <h2 style={{fontFamily:T.anton,fontWeight:400,fontSize:32,textTransform:"uppercase",lineHeight:.95,marginBottom:4}}>{profile?.full_name||`${profile?.first_name||""} ${profile?.last_name||""}`.trim()||"Student"}</h2>
                <div style={{fontSize:13,color:"rgba(248,247,244,.6)"}}>{academic?.school||"School not set"} · Class of {academic?.graduationYear||"—"}</div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:12,color:"rgba(248,247,244,.5)",marginBottom:4}}>Cumulative GPA</div>
                <div style={{fontFamily:T.anton,fontSize:36,color:T.orange,lineHeight:1}}>{academic?.weightedGpa||academic?.gpa||"—"}</div>
                <div style={{fontSize:11,color:"rgba(248,247,244,.4)"}}>Weighted</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:16}}>
              {[{label:"Student ID",val:profile?.id?.slice(0,8).toUpperCase()||"—"},{label:"Date of Birth",val:profile?.date_of_birth?new Date(profile.date_of_birth).toLocaleDateString("en",{month:"short",day:"numeric",year:"numeric"}):"—"},{label:"District",val:profile?.school_district||"—"},{label:"A-G Status",val:`${agDone}/7 complete`}].map(({label,val})=>(
                <div key={label} style={{background:"rgba(255,255,255,.07)",borderRadius:8,padding:"8px 10px"}}>
                  <div style={{fontFamily:T.mono,fontSize:9,color:"rgba(248,247,244,.4)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:2}}>{label}</div>
                  <div style={{fontSize:12,fontWeight:600}}>{val}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{flex:1,height:1,background:T.line}}/>
              <span style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.muted,padding:"0 12px"}}>A-G Education Requirements</span>
              <div style={{flex:1,height:1,background:T.line}}/>
            </div>
            <div style={{border:`0.5px solid ${T.line}`,borderRadius:12,overflow:"hidden"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{background:T.navy,color:"#F8F7F4"}}>
                    <th style={{padding:"10px 14px",textAlign:"left",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,width:30}}>Cat.</th>
                    <th style={{padding:"10px 14px",textAlign:"left",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Subject Area</th>
                    <th style={{padding:"10px 14px",textAlign:"left",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Courses Completed</th>
                    <th style={{padding:"10px 14px",textAlign:"center",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,width:70}}>Years</th>
                    <th style={{padding:"10px 14px",textAlign:"center",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,width:80}}>Required</th>
                    <th style={{padding:"10px 14px",textAlign:"center",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700,width:90}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {["A","B","C","D","E","F","G"].map((key,i)=>{
                    const prog=agProgress.find(a=>a.subject===key);
                    const required=AG_REQUIREMENTS[key]||1;
                    const completed=prog?.years_completed||0;
                    const done=completed>=required;
                    const inProg=prog?.in_progress&&!done;
                    const courses=prog?.courses_taken||[];
                    const currentCourse=prog?.current_course;
                    return(
                      <tr key={key} style={{borderBottom:`0.5px solid ${T.line}`,background:i%2===0?T.surface:T.surface2}}>
                        <td style={{padding:"12px 14px",fontFamily:T.mono,fontWeight:700,fontSize:15,color:done?T.green:inProg?T.amber:T.muted}}>{key}</td>
                        <td style={{padding:"12px 14px",fontWeight:600,color:T.ink}}>{AG_SUBJECT_NAMES[key]}</td>
                        <td style={{padding:"12px 14px",color:T.muted,fontSize:12}}>
                          {courses.length>0?(
                            <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                              {courses.map((c:string)=><span key={c} style={{background:T.navy,color:"#F8F7F4",borderRadius:999,padding:"2px 8px",fontSize:11,fontWeight:500}}>{c}</span>)}
                              {currentCourse&&<span style={{background:T.orangeL,color:T.orange,borderRadius:999,padding:"2px 8px",fontSize:11,fontWeight:500}}>{currentCourse} (in progress)</span>}
                            </div>
                          ):(
                            <span style={{color:T.faint,fontStyle:"italic"}}>{inProg&&currentCourse?currentCourse+" (in progress)":"No courses logged yet"}</span>
                          )}
                        </td>
                        <td style={{padding:"12px 14px",textAlign:"center",fontFamily:T.mono,fontWeight:700,fontSize:14,color:done?T.green:inProg?T.amber:T.ink}}>{completed}</td>
                        <td style={{padding:"12px 14px",textAlign:"center",fontFamily:T.mono,fontSize:13,color:T.muted}}>{required}</td>
                        <td style={{padding:"12px 14px",textAlign:"center"}}>
                          {done?<span style={{background:T.greenL,color:T.green,borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:T.mono}}>✓ Met</span>:inProg?<span style={{background:T.orangeL,color:T.amber,borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:T.mono}}>In progress</span>:<span style={{background:T.surface2,color:T.faint,borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:T.mono}}>Needed</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{background:T.surface2,borderTop:`1px solid ${T.line}`}}>
                    <td colSpan={3} style={{padding:"10px 14px",fontFamily:T.mono,fontSize:11,fontWeight:700,color:T.ink}}>TOTAL A-G COMPLETION</td>
                    <td style={{padding:"10px 14px",textAlign:"center",fontFamily:T.mono,fontWeight:700,color:T.orange}}>{agProgress.reduce((sum,a)=>sum+Number(a.years_completed),0)}</td>
                    <td style={{padding:"10px 14px",textAlign:"center",fontFamily:T.mono,color:T.muted}}>15</td>
                    <td style={{padding:"10px 14px",textAlign:"center"}}><span style={{fontFamily:T.mono,fontSize:11,fontWeight:700,color:agDone===7?T.green:T.amber}}>{agDone}/7 met</span></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          {certificates.length>0&&(
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{flex:1,height:1,background:T.line}}/>
                <span style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.muted,padding:"0 12px"}}>Playbook Certifications</span>
                <div style={{flex:1,height:1,background:T.line}}/>
              </div>
              <div style={{border:`0.5px solid ${T.line}`,borderRadius:12,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:T.navy,color:"#F8F7F4"}}><th style={{padding:"10px 14px",textAlign:"left",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Certificate</th><th style={{padding:"10px 14px",textAlign:"left",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Issued</th><th style={{padding:"10px 14px",textAlign:"center",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Status</th></tr></thead>
                  <tbody>{certificates.map((c:any,i:number)=><tr key={c.id} style={{borderBottom:`0.5px solid ${T.line}`,background:i%2===0?T.surface:T.surface2}}><td style={{padding:"12px 14px",fontWeight:600,color:T.ink}}>{c.certificate_name||c.course_slug}</td><td style={{padding:"12px 14px",color:T.muted,fontFamily:T.mono,fontSize:12}}>{c.issued_at?new Date(c.issued_at).toLocaleDateString("en",{month:"long",day:"numeric",year:"numeric"}):"—"}</td><td style={{padding:"12px 14px",textAlign:"center"}}><span style={{background:T.greenL,color:T.green,borderRadius:999,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:T.mono}}>✓ Earned</span></td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
          {activities.length>0&&(
            <div style={{marginBottom:24}}>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{flex:1,height:1,background:T.line}}/>
                <span style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.16em",textTransform:"uppercase",color:T.muted,padding:"0 12px"}}>Activities & Experience</span>
                <div style={{flex:1,height:1,background:T.line}}/>
              </div>
              <div style={{border:`0.5px solid ${T.line}`,borderRadius:12,overflow:"hidden"}}>
                <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                  <thead><tr style={{background:T.navy,color:"#F8F7F4"}}><th style={{padding:"10px 14px",textAlign:"left",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Activity</th><th style={{padding:"10px 14px",textAlign:"left",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Type</th><th style={{padding:"10px 14px",textAlign:"left",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Organization</th><th style={{padding:"10px 14px",textAlign:"center",fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",fontWeight:700}}>Hours</th></tr></thead>
                  <tbody>{activities.map((a:any,i:number)=><tr key={a.id} style={{borderBottom:`0.5px solid ${T.line}`,background:i%2===0?T.surface:T.surface2}}><td style={{padding:"12px 14px",fontWeight:600,color:T.ink}}>{a.activity_name}</td><td style={{padding:"12px 14px",color:T.muted,textTransform:"capitalize"}}>{a.activity_type}</td><td style={{padding:"12px 14px",color:T.muted}}>{a.organization||"—"}</td><td style={{padding:"12px 14px",textAlign:"center",fontFamily:T.mono,fontWeight:700,color:T.ink}}>{a.total_hours||"—"}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
          )}
          <div style={{borderTop:`0.5px solid ${T.line}`,paddingTop:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>Generated by Playbook Series Inc. · playbookseriesinc.org</div>
            <div style={{fontFamily:T.mono,fontSize:10,color:T.faint}}>{new Date().toLocaleDateString("en",{month:"long",day:"numeric",year:"numeric"})}</div>
          </div>
        </div>
      </div>
    </>
    </>
  );
}
