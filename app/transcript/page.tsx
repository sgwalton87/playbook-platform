cat > app/page.tsx << 'ENDOFFILE'
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
const BG="#F7F4EF",INK="#0A0A0A",MUTED="#6B6B6B",FAINT="#444",LLINE="#E8E8E8",ORANGE="#E8420A",BLUE="#0057FF",MONO="'Space Mono', monospace",SANS="'Hanken Grotesk', system-ui, sans-serif",ANTON="'Anton', sans-serif";
const TICKER="RUN IT! ★ SCHOLAR-ATHLETES AGES 11–18 ★ OAKLAND, CALIFORNIA ★ ON & OFF THE COURT ★ THE ED-TECH SOLUTION ★ ";
const PILLARS=[{num:"01",title:"Leadership",desc:"Captaincy, accountability, and the confidence to lead a locker room and a classroom.",icon:"★",color:ORANGE},{num:"02",title:"Financial Lit.",desc:"Money management, NIL basics, and building wealth that outlasts a career.",icon:"$",color:BLUE},{num:"03",title:"Academic",desc:"Study habits, eligibility, and staying on track for graduation and college.",icon:"✓",color:"#00C37A"},{num:"04",title:"Social-Emotional",desc:"Identity, resilience, and mental wellness through every transition.",icon:"♥",color:"#9B59B6"}];
const STATS=[{value:"1,200+",label:"Scholars in network"},{value:"4",label:"Core pillars"},{value:"92%",label:"Report more confidence"},{value:"18",label:"Partner schools"}];
const PROGRAMS=[{tag:"Leadership",title:"Leadership Labs",desc:"Workshops, guest speakers, and certificates."},{tag:"Finance",title:"Financial Game Plan",desc:"Budgeting and investing — gamified."},{tag:"Academic",title:"Scholar-Athlete Academy",desc:"Tutoring, college prep, and mentorship."},{tag:"Civic",title:"Civic Engagement",desc:"Youth-led projects and advocacy awards."},{tag:"Network",title:"Mentorship Circles",desc:"Group mentorship and life guidance."}];
const STEPS=[{num:"1",title:"Join the network",desc:"Create a profile, connect with teammates, mentors, and coaches across the platform."},{num:"2",title:"Run the courses",desc:"Work through e-learning modules built around the four pillars at your own pace."},{num:"3",title:"Level up",desc:"Earn badges, track growth, and unlock workforce-readiness opportunities."}];
const TEAM=[{name:"Coach J. Reed",role:"Founder & ED",img:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80"},{name:"M. Alvarez",role:"Head of Curriculum",img:"https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=600&q=80"},{name:"T. Okafor",role:"Community Lead",img:"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80"},{name:"S. Nguyen",role:"Product & Tech",img:"https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600&q=80"}];
const POSTS=[{cat:"Leadership",img:"https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=900&q=80",title:"Why captains are made, not born",excerpt:"The habits that turn a talented player into a trusted leader."},{cat:"Finance",img:"https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=900&q=80",title:"NIL 101 for the under-18 athlete",excerpt:"What athletes and families need to know before signing anything."},{cat:"Wellness",img:"https://images.unsplash.com/photo-1519861531473-9200262188bf?w=900&q=80",title:"Handling the pressure of the big game",excerpt:"Simple mental tools scholar-athletes can use in the clutch."}];
export default function HomePage() {
  const router=useRouter();
  const [authed,setAuthed]=useState(false);
  const [menu,setMenu]=useState(false);
  useEffect(()=>{
    supabase.auth.getUser().then(({data})=>{if(data.user)setAuthed(true);});
    const {data:l}=supabase.auth.onAuthStateChange((_e,s)=>setAuthed(!!s?.user));
    return ()=>l.subscription.unsubscribe();
  },[]);
  const scrollTo=(id:string)=>{setMenu(false);document.getElementById(id)?.scrollIntoView({behavior:"smooth"});};
  const pad="clamp(20px,5vw,80px)";
  const inner={maxWidth:"1320px",margin:"0 auto",padding:`0 ${pad}`};
  return (
    <div style={{background:BG,color:INK,fontFamily:SANS,overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::selection{background:${ORANGE};color:#fff;}
        @keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .pb-link:hover{color:${INK}!important;}
        .pb-pillar{transition:all 0.18s;}.pb-pillar:hover{border-color:${ORANGE}!important;transform:translateY(-3px);}
        .pb-prog{transition:background 0.15s;}.pb-prog:hover{background:#E8E2D9!important;}
        .pb-post{transition:transform 0.18s;}.pb-post:hover{transform:translateY(-3px);}
        .pb-step:hover{border-color:${ORANGE}!important;}
        a{text-decoration:none;color:inherit;}
        @media(max-width:900px){
          .hg{grid-template-columns:1fr!important;}
          .pg{grid-template-columns:1fr 1fr!important;}
          .sg{grid-template-columns:1fr 1fr!important;}
          .stg{grid-template-columns:1fr!important;}
          .tg{grid-template-columns:1fr 1fr!important;}
          .bog{grid-template-columns:1fr!important;}
          .cg{grid-template-columns:1fr!important;}
          .fg{grid-template-columns:1fr 1fr!important;}
          .dnav{display:none!important;}
        }
      `}</style>

      <header style={{position:"sticky",top:0,zIndex:100,background:`${BG}f0`,backdropFilter:"blur(20px)",borderBottom:`1px solid ${LLINE}`}}>
        <div style={{...inner,display:"flex",alignItems:"center",justifyContent:"space-between",gap:20,padding:`13px ${pad}`}}>
          <div onClick={()=>router.push("/")} style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer",flexShrink:0}}>
            <div style={{width:34,height:34,borderRadius:8,background:ORANGE,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:ANTON,fontSize:18,color:"#fff"}}>P</span>
            </div>
            <div>
              <div style={{fontFamily:ANTON,fontSize:16,color:INK,letterSpacing:"0.04em",lineHeight:1}}>PLAYBOOK</div>
              <div style={{fontFamily:MONO,fontSize:7,letterSpacing:"0.3em",color:ORANGE}}>SERIES INC.</div>
            </div>
          </div>
          <nav className="dnav" style={{display:"flex",alignItems:"center",gap:2}}>
            {["About","Pillars","Programs","Impact","Team","Blog"].map(n=>(
              <button key={n} className="pb-link" onClick={()=>scrollTo(n.toLowerCase())}
                style={{fontFamily:MONO,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:"transparent",border:"none",color:MUTED,cursor:"pointer",padding:"8px 12px",borderRadius:6}}>
                {n}
              </button>
            ))}
          </nav>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            {authed?(
              <button onClick={()=>router.push("/dashboard")}
                style={{fontFamily:MONO,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:ORANGE,color:"#fff",border:"none",borderRadius:999,padding:"11px 20px",cursor:"pointer"}}>
                Dashboard →
              </button>
            ):(
              <>
                <button onClick={()=>router.push("/login")}
                  style={{fontFamily:MONO,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:"transparent",color:INK,border:`1.5px solid ${LLINE}`,borderRadius:999,padding:"10px 16px",cursor:"pointer"}}>
                  Log in
                </button>
                <button onClick={()=>router.push("/login")}
                  style={{fontFamily:MONO,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:ORANGE,color:"#fff",border:"none",borderRadius:999,padding:"11px 20px",cursor:"pointer"}}>
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <div style={{background:ORANGE,overflow:"hidden",whiteSpace:"nowrap",padding:"8px 0"}}>
        <div style={{display:"inline-flex",animation:"ticker 28s linear infinite"}}>
          {[TICKER,TICKER].map((t,i)=><span key={i} style={{fontFamily:ANTON,fontSize:12,letterSpacing:"0.2em",color:"#fff",padding:"0 24px"}}>{t}</span>)}
        </div>
      </div>

      <section id="top" style={{...inner,padding:`clamp(56px,8vw,112px) ${pad}`}}>
        <div className="hg" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"clamp(32px,6vw,80px)",alignItems:"center"}}>
          <div style={{animation:"fadeUp 0.6s ease both"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,fontFamily:MONO,fontSize:10,letterSpacing:"0.22em",textTransform:"uppercase",color:ORANGE,marginBottom:22}}>
              <span style={{width:22,height:1.5,background:ORANGE,display:"inline-block"}}/> The ed-tech solution
            </div>
            <h1 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(48px,7vw,96px)",lineHeight:0.9,textTransform:"uppercase",color:INK,marginBottom:22}}>
              THRIVE ON<br/><span style={{color:ORANGE}}>&</span> OFF<br/>THE COURT.
            </h1>
            <p style={{fontSize:"clamp(15px,1.5vw,18px)",lineHeight:1.65,color:MUTED,maxWidth:"38ch",marginBottom:32}}>
              The only platform combining social networking with e-learning to build the next generation of scholar-athlete leaders.
            </p>
            <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:44}}>
              <button onClick={()=>router.push("/login")}
                style={{fontFamily:MONO,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:ORANGE,color:"#fff",border:"none",borderRadius:999,padding:"15px 28px",cursor:"pointer"}}>
                Join the network →
              </button>
              <button onClick={()=>scrollTo("video")}
                style={{fontFamily:MONO,fontSize:12,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:"transparent",color:INK,border:`1.5px solid ${LLINE}`,borderRadius:999,padding:"14px 24px",cursor:"pointer"}}>
                ▶ Watch the film
              </button>
            </div>
            <div style={{display:"flex",gap:32}}>
              {[["4","Pillars"],["11–18","Ages served"],["510","Oakland"]].map(([v,l])=>(
                <div key={l}>
                  <div style={{fontFamily:ANTON,fontSize:30,color:INK,lineHeight:1}}>{v}</div>
                  <div style={{fontFamily:MONO,fontSize:9,letterSpacing:"0.14em",textTransform:"uppercase",color:MUTED,marginTop:4}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{position:"relative",animation:"fadeUp 0.6s 0.15s ease both"}}>
            <div style={{borderRadius:20,overflow:"hidden",aspectRatio:"4/5",background:LLINE,position:"relative"}}>
              <img src="https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=1000&q=80" alt="Scholar-athletes" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
              <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg,transparent 50%,rgba(10,10,10,.7) 100%)"}}/>
              <div style={{position:"absolute",left:16,bottom:16,right:16,background:"rgba(10,10,10,.65)",backdropFilter:"blur(12px)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:"13px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontFamily:ANTON,fontSize:14,color:"#fff",letterSpacing:"0.04em"}}>RUN IT!</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,.5)"}}>Network + courses in one app</div>
                </div>
                <button onClick={()=>scrollTo("video")} style={{width:36,height:36,borderRadius:"50%",background:ORANGE,border:"none",color:"#fff",fontSize:14,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>▶</button>
              </div>
            </div>
            <div style={{position:"absolute",top:28,left:-20,background:"#fff",border:`1px solid ${LLINE}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}>
              <div style={{width:28,height:28,borderRadius:7,background:ORANGE,flexShrink:0}}/>
              <div>
                <div style={{fontSize:12,fontWeight:800,color:INK}}>+1,200 scholars</div>
                <div style={{fontSize:10,color:MUTED}}>in the network</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="video" style={{...inner,padding:`0 ${pad} clamp(56px,8vw,112px)`}}>
        <div style={{marginBottom:24}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:ORANGE,marginBottom:10}}>The film</div>
          <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(28px,4vw,52px)",textTransform:"uppercase",color:INK,lineHeight:0.95}}>Run it. Watch it.</h2>
        </div>
        <div style={{position:"relative",borderRadius:20,overflow:"hidden",background:"#111",border:"1px solid #222",aspectRatio:"16/9"}}>
          <video controls playsInline poster="https://images.unsplash.com/photo-1543807535-eceef0bc6599?w=1400&q=80"
            style={{width:"100%",height:"100%",objectFit:"cover",display:"block"}}>
            <source src="/assets/playbook-promo.mp4" type="video/mp4"/>
            Your browser does not support video playback.
          </video>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:14,flexWrap:"wrap",gap:8}}>
          <p style={{fontSize:13,color:MUTED}}>An introduction to The Playbook Platform — where scholar-athletes learn, connect, and lead.</p>
          <button onClick={()=>router.push("/login")} style={{fontFamily:MONO,fontSize:11,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:"transparent",border:"none",color:ORANGE,cursor:"pointer"}}>
            Join the network →
          </button>
        </div>
      </section>

      <section style={{borderTop:`1px solid ${LLINE}`,borderBottom:`1px solid ${LLINE}`,padding:`20px ${pad}`}}>
        <div style={{...inner,display:"flex",alignItems:"center",gap:"clamp(20px,4vw,56px)",flexWrap:"wrap",justifyContent:"space-between"}}>
          <span style={{fontFamily:MONO,fontSize:9,letterSpacing:"0.18em",textTransform:"uppercase",color:MUTED}}>Trusted by</span>
          {["OUSD","East Bay","NCAA Prep","YMCA","Title I"].map(p=>(
            <span key={p} style={{fontFamily:ANTON,fontSize:"clamp(14px,1.6vw,20px)",letterSpacing:"0.06em",color:"#BBB",textTransform:"uppercase"}}>{p}</span>
          ))}
        </div>
      </section>

      <section id="about" style={{...inner,padding:`clamp(56px,8vw,112px) ${pad}`}}>
        <div style={{display:"grid",gridTemplateColumns:"0.85fr 1.15fr",gap:"clamp(32px,5vw,80px)",alignItems:"start"}}>
          <div>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:ORANGE,marginBottom:14}}>01 / Who we are</div>
            <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(28px,3.8vw,52px)",lineHeight:1.0,textTransform:"uppercase",color:INK}}>More than a game plan</h2>
          </div>
          <div>
            <p style={{fontSize:"clamp(16px,1.5vw,20px)",lineHeight:1.6,color:INK,marginBottom:18}}>Playbook Series, Inc. is an Oakland-based ed-tech nonprofit that meets young people where they already are — in the game.</p>
            <p style={{fontSize:"clamp(14px,1.2vw,16px)",lineHeight:1.7,color:MUTED,marginBottom:28}}>We combine the connection of social networking with the rigor of e-learning, supporting scholar-athletes through adolescence and into the workforce. The result: confident leaders, on and off the court.</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {["Social networking","E-learning","Mentorship","Workforce-ready"].map(tag=>(
                <span key={tag} style={{fontSize:12,fontWeight:600,color:INK,border:`1.5px solid ${LLINE}`,padding:"8px 14px",borderRadius:999}}>{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pillars" style={{background:"#0A0A0A",borderTop:"1px solid #1A1A1A"}}>
        <div style={{...inner,padding:`clamp(56px,8vw,112px) ${pad}`}}>
          <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:44}}>
            <div>
              <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:ORANGE,marginBottom:14}}>02 / The framework</div>
              <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(28px,3.8vw,52px)",lineHeight:1.0,textTransform:"uppercase",color:"#F7F4EF"}}>Four pillars of the playbook</h2>
            </div>
            <p style={{fontSize:14,color:"#666",maxWidth:"38ch",lineHeight:1.65}}>Every course, mentor session, and challenge maps to one of four pillars that build the whole person.</p>
          </div>
          <div className="pg" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {PILLARS.map(p=>(
              <div key={p.num} className="pb-pillar" style={{background:"#111",border:"1px solid #1F1F1F",borderRadius:16,padding:"24px 20px 26px",cursor:"pointer"}}>
                <div style={{fontFamily:ANTON,fontSize:"clamp(40px,4vw,56px)",color:"#1A1A1A",lineHeight:1,marginBottom:18}}>{p.num}</div>
                <div style={{width:42,height:42,borderRadius:10,background:p.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,color:p.color,marginBottom:14}}>{p.icon}</div>
                <h3 style={{fontFamily:ANTON,fontWeight:400,fontSize:17,textTransform:"uppercase",color:"#F7F4EF",marginBottom:8}}>{p.title}</h3>
                <p style={{fontSize:13,lineHeight:1.6,color:"#666"}}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="programs" style={{...inner,padding:`clamp(56px,8vw,112px) ${pad}`}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:36}}>
          <div>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:ORANGE,marginBottom:14}}>03 / The programs</div>
            <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(28px,3.8vw,52px)",lineHeight:1.0,textTransform:"uppercase",color:INK}}>Real skills. Real mentors.</h2>
          </div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {PROGRAMS.map(p=>(
            <div key={p.title} className="pb-prog" style={{background:"#F0ECE5",border:`1px solid ${LLINE}`,borderRadius:14,padding:"18px 18px",cursor:"pointer"}}>
              <span style={{fontFamily:MONO,fontSize:9,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase",background:ORANGE+"18",color:ORANGE,padding:"3px 8px",borderRadius:999,display:"inline-block",marginBottom:12}}>{p.tag}</span>
              <h3 style={{fontFamily:ANTON,fontWeight:400,fontSize:17,textTransform:"uppercase",color:INK,marginBottom:6}}>{p.title}</h3>
              <p style={{fontSize:12,color:MUTED,lineHeight:1.55}}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="impact" style={{background:ORANGE}}>
        <div style={{...inner,padding:`clamp(56px,8vw,100px) ${pad}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:"rgba(255,255,255,.6)",marginBottom:14}}>04 / The scoreboard</div>
          <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(28px,4vw,52px)",textTransform:"uppercase",color:"#fff",marginBottom:48,maxWidth:"20ch",lineHeight:1}}>Real growth, on the record.</h2>
          <div className="sg" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:24}}>
            {STATS.map(s=>(
              <div key={s.label} style={{borderTop:"2px solid rgba(255,255,255,.3)",paddingTop:16}}>
                <div style={{fontFamily:ANTON,fontSize:"clamp(40px,5vw,68px)",color:"#fff",lineHeight:0.92}}>{s.value}</div>
                <div style={{fontSize:13,fontWeight:600,color:"rgba(255,255,255,.75)",marginTop:10}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{...inner,padding:`clamp(56px,8vw,112px) ${pad}`}}>
        <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:ORANGE,marginBottom:14}}>05 / The play</div>
        <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(28px,3.8vw,52px)",textTransform:"uppercase",color:INK,marginBottom:40,lineHeight:1}}>How the network runs</h2>
        <div className="stg" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {STEPS.map(s=>(
            <div key={s.num} className="pb-step" style={{background:"#F0ECE5",border:`1px solid ${LLINE}`,borderRadius:14,padding:"24px 22px",transition:"border-color 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
                <div style={{width:40,height:40,borderRadius:10,background:ORANGE,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ANTON,fontSize:18,color:"#fff"}}>{s.num}</div>
                <h3 style={{fontFamily:ANTON,fontWeight:400,fontSize:17,textTransform:"uppercase",color:INK}}>{s.title}</h3>
              </div>
              <p style={{fontSize:13,lineHeight:1.65,color:MUTED}}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="team" style={{background:"#F0ECE5",borderTop:`1px solid ${LLINE}`,borderBottom:`1px solid ${LLINE}`}}>
        <div style={{...inner,padding:`clamp(56px,8vw,112px) ${pad}`}}>
          <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:ORANGE,marginBottom:14}}>06 / The coaches</div>
          <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(28px,3.8vw,52px)",textTransform:"uppercase",color:INK,marginBottom:40,lineHeight:1}}>Built by the team</h2>
          <div className="tg" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14}}>
            {TEAM.map(m=>(
              <div key={m.name} style={{background:"#fff",border:`1px solid ${LLINE}`,borderRadius:16,overflow:"hidden"}}>
                <div style={{aspectRatio:"1/1",overflow:"hidden"}}>
                  <img src={m.img} alt={m.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
                <div style={{padding:"16px 16px 18px"}}>
                  <h3 style={{fontSize:15,fontWeight:800,color:INK,marginBottom:3}}>{m.name}</h3>
                  <p style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.06em",textTransform:"uppercase",color:ORANGE}}>{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="blog" style={{...inner,padding:`clamp(56px,8vw,112px) ${pad}`}}>
        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:24,flexWrap:"wrap",marginBottom:36}}>
          <div>
            <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:ORANGE,marginBottom:14}}>07 / From the bench</div>
            <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(28px,3.8vw,52px)",textTransform:"uppercase",color:INK,lineHeight:1}}>Latest from the blog</h2>
          </div>
        </div>
        <div className="bog" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14}}>
          {POSTS.map(b=>(
            <div key={b.title} className="pb-post" style={{background:"#F0ECE5",border:`1px solid ${LLINE}`,borderRadius:16,overflow:"hidden",cursor:"pointer"}}>
              <div style={{aspectRatio:"16/9",overflow:"hidden"}}>
                <img src={b.img} alt={b.title} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
              </div>
              <div style={{padding:"16px 18px 20px"}}>
                <div style={{fontFamily:MONO,fontSize:9,letterSpacing:"0.08em",textTransform:"uppercase",color:ORANGE,marginBottom:8}}>{b.cat}</div>
                <h3 style={{fontSize:16,fontWeight:800,color:INK,marginBottom:6,lineHeight:1.3}}>{b.title}</h3>
                <p style={{fontSize:12,color:MUTED,lineHeight:1.55}}>{b.excerpt}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="join" style={{...inner,padding:`0 ${pad} clamp(56px,8vw,112px)`}}>
        <div style={{background:"#0A0A0A",borderRadius:24,padding:"clamp(40px,6vw,80px) clamp(24px,5vw,72px)"}}>
          <div className="cg" style={{display:"grid",gridTemplateColumns:"1.2fr 0.8fr",gap:40,alignItems:"center"}}>
            <div>
              <div style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.2em",textTransform:"uppercase",color:ORANGE,marginBottom:16}}>Ready to elevate?</div>
              <h2 style={{fontFamily:ANTON,fontWeight:400,fontSize:"clamp(32px,4.5vw,64px)",textTransform:"uppercase",color:"#F7F4EF",lineHeight:0.95,marginBottom:18}}>Get in the game today</h2>
              <p style={{fontSize:15,color:"#666",maxWidth:"40ch",lineHeight:1.65}}>Join a growing network of scholars, entrepreneurs, and mentors. Earn coins, unlock resources, make an impact.</p>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              <button onClick={()=>router.push("/login")}
                style={{fontFamily:MONO,fontSize:13,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:ORANGE,color:"#fff",border:"none",borderRadius:12,padding:"17px",cursor:"pointer"}}>
                Sign up free →
              </button>
              <button onClick={()=>router.push("/login")}
                style={{fontFamily:MONO,fontSize:13,fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",background:"transparent",color:"#F7F4EF",border:"1.5px solid #333",borderRadius:12,padding:"16px",cursor:"pointer"}}>
                Log in
              </button>
              <p style={{fontSize:11,color:"#555",textAlign:"center"}}>Free to join · scholar-athletes ages 11–18</p>
            </div>
          </div>
        </div>
      </section>

      <footer style={{borderTop:`1px solid ${LLINE}`,padding:`clamp(32px,4vw,56px) ${pad} 28px`}}>
        <div style={{...inner}}>
          <div className="fg" style={{display:"grid",gridTemplateColumns:"1.4fr 1fr 1fr 1fr",gap:32,marginBottom:36}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
                <div style={{width:30,height:30,borderRadius:7,background:ORANGE,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontFamily:ANTON,fontSize:15,color:"#fff"}}>P</span>
                </div>
                <div>
                  <div style={{fontFamily:ANTON,fontSize:14,color:INK}}>PLAYBOOK</div>
                  <div style={{fontFamily:MONO,fontSize:7,letterSpacing:"0.3em",color:ORANGE}}>SERIES INC.</div>
                </div>
              </div>
              <p style={{fontSize:13,lineHeight:1.65,color:MUTED,maxWidth:"30ch"}}>Combining social networking with e-learning to help scholar-athletes thrive. Oakland, CA.</p>
            </div>
            {[{head:"Platform",links:["Join the Network","Explore Courses","The Four Pillars","For Schools"]},{head:"Company",links:["About Us","Our Team","Blog","Contact"]},{head:"Connect",links:["Instagram","TikTok","LinkedIn","YouTube"]}].map(col=>(
              <div key={col.head}>
                <div style={{fontFamily:MONO,fontSize:9,letterSpacing:"0.16em",textTransform:"uppercase",color:MUTED,marginBottom:14}}>{col.head}</div>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {col.links.map(l=><a key={l} href="#" style={{fontSize:13,color:MUTED}}>{l}</a>)}
                </div>
              </div>
            ))}
          </div>
          <div style={{borderTop:`1px solid ${LLINE}`,paddingTop:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
            <span style={{fontSize:12,color:MUTED}}>© 2025 Playbook Series, Inc. All rights reserved.</span>
            <span style={{fontFamily:MONO,fontSize:10,letterSpacing:"0.12em",color:ORANGE}}>RUN IT! ★</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
ENDOFFILE