"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const FLAGSHIP = [
  { id:"college-application-playbook", title:"College Application Playbook", pillar:"College", color:"#0EA5E9", emoji:"🎓", img:"https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80", desc:"Build your college list, prepare applications, connect FAFSA, CalKIDS, and scholarship milestones.", modules:6 },
  { id:"captains-mindset", title:"Captain's Mindset", pillar:"Leadership", color:"#F97316", emoji:"★", img:"https://images.unsplash.com/photo-1546519638405-a4c8b5bd3c5e?w=800&q=80", desc:"Lead by example on and off the court with proven captaincy frameworks.", modules:6 },
  { id:"money-in-the-game", title:"Money in the Game", pillar:"Finance", color:"#3B82F6", emoji:"$", img:"https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80", desc:"Budgeting, saving, and NIL fundamentals built for young athletes.", modules:8 },
  { id:"mind-of-an-athlete", title:"Mind of an Athlete", pillar:"SEL", color:"#8B5CF6", emoji:"♥", img:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80", desc:"Build resilience and manage pressure with social-emotional tools.", modules:5 },
  { id:"community-leader", title:"Community Leader", pillar:"Civic", color:"#10B981", emoji:"✓", img:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80", desc:"Youth-led projects and advocacy for leaders who create change.", modules:6, comingSoon:true },
];


const COMING_SOON = [
  {
    id:"social-emotional-foundations",
    title:"Social-Emotional Foundations",
    pillar:"SEL",
    color:"#8B5CF6",
    emoji:"♥",
    img:"https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80",
    desc:"Build emotional intelligence, self-awareness, and resilience.",
    modules:6,
    comingSoon:true
  },
  {
    id:"nil-readiness-for-athletes",
    title:"NIL Readiness for Athletes",
    pillar:"NIL",
    color:"#F59E0B",
    emoji:"💰",
    img:"https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=800&q=80",
    desc:"Learn personal branding, NIL opportunities, contracts, and compliance.",
    modules:6,
    comingSoon:true
  },
  {
    id:"civic-engagement-for-young-leaders",
    title:"Civic Engagement for Young Leaders",
    pillar:"Civic",
    color:"#10B981",
    emoji:"🏛️",
    img:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&q=80",
    desc:"Develop advocacy skills and learn how to create change in your community.",
    modules:6,
    comingSoon:true
  }
];

export default function CoursesPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<Record<string,number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) { router.replace("/login"); return; }
      const { data: progressRows } = await supabase
        .from("course_progress")
        .select("course_slug, completed_modules, completed")
        .eq("user_id", u.user.id);

      const nextProgress: Record<string, number> = {};

      (progressRows || []).forEach((row: LegacyValue) => {
        if (row.completed) {
          const course = FLAGSHIP.find((c) => c.id === row.course_slug);
          nextProgress[row.course_slug] = course?.modules || row.completed_modules?.length || 1;
        } else {
          nextProgress[row.course_slug] = row.completed_modules?.length || 0;
        }
      });

      setProgress(nextProgress);
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div style={{ minHeight:"100vh", background:"#F8F7F4", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Space Mono', monospace", fontSize:12, color:"#94A3B8" }}>Loading courses…</div>;

  const inProgress = FLAGSHIP.filter(c => progress[c.id] > 0 && progress[c.id] < c.modules && !c.comingSoon);
  return (
    <>
      <div style={{ fontFamily:"'Hanken Grotesk', system-ui, sans-serif", color:"#0F172A" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        ::selection{background:#F97316;color:#fff;}
        .pb-card:hover{border-color:#F97316!important;transform:translateY(-3px);}
        img{display:block;}
      `}</style>

      <div style={{
        padding:"26px 40px 60px",
        maxWidth:1180,
        margin:"0 auto"
      }}>

        {/* Playbook page hero */}
        <section style={{
          background:"#0F172A",
          borderRadius:32,
          padding:"38px 36px",
          marginBottom:18,
          boxShadow:"0 18px 42px rgba(15,23,42,.10)"
        }}>
          <p style={{
            fontFamily:"'Space Mono', monospace",
            fontSize:10,
            letterSpacing:"0.2em",
            textTransform:"uppercase",
            color:"#F97316",
            marginBottom:14,
            fontWeight:900
          }}>
            Courses
          </p>

          <h1 style={{
            fontFamily:"'Hanken Grotesk', system-ui, sans-serif",
            fontWeight:900,
            fontSize:"clamp(36px,5vw,56px)",
            color:"#F8F7F4",
            lineHeight:1.02,
            letterSpacing:"-.04em",
            marginBottom:18
          }}>
            Build skills for school, life, leadership, and your future.
          </h1>

          <p style={{
            fontSize:18,
            lineHeight:1.55,
            color:"rgba(248,247,244,.78)",
            maxWidth:760,
            marginBottom:22
          }}>
            Learn at your pace, earn XP and Playbook Coins, unlock certificates,
            and add verified accomplishments to your Playbook story.
          </p>

          <div style={{
            display:"flex",
            gap:10,
            flexWrap:"wrap"
          }}>
            <button
              onClick={() => {
                const next = inProgress[0];
                if (next) router.push(`/courses/${next.id}`);
              }}
              disabled={inProgress.length === 0}
              style={{
                background:"#F97316",
                color:"#fff",
                border:"none",
                borderRadius:999,
                padding:"12px 18px",
                fontWeight:800,
                cursor:inProgress.length ? "pointer" : "default",
                opacity:inProgress.length ? 1 : .55
              }}
            >
              Continue Learning
            </button>

            <button
              onClick={() => router.push("/certificates")}
              style={{
                background:"#F8F7F4",
                color:"#0F172A",
                border:"none",
                borderRadius:999,
                padding:"12px 18px",
                fontWeight:800,
                cursor:"pointer"
              }}
            >
              View Certificates
            </button>
          </div>
        </section>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
          {[
            { icon:"📚", label:"Available", value:FLAGSHIP.filter(c=>!c.comingSoon).length },
            { icon:"⚡", label:"In progress", value:inProgress.length },
            { icon:"✅", label:"Completed", value:FLAGSHIP.filter(c=>progress[c.id]===c.modules&&!c.comingSoon).length },
            { icon:"🎓", label:"Certificates", value:FLAGSHIP.filter(c=>progress[c.id]===c.modules&&!c.comingSoon).length },
          ].map(({ icon, label, value }) => (
            <div key={label} style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:20, padding:"18px 18px", display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ fontSize:22 }}>{icon}</div>
              <div>
                <div style={{ fontFamily:"'Space Mono', monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"#94A3B8", marginBottom:3 }}>{label}</div>
                <div style={{ fontFamily:"Anton, sans-serif", fontSize:26, fontWeight:400, color:"#0F172A", lineHeight:1 }}>{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Reward banner */}
        <div style={{ background:"#0F172A", borderRadius:24, padding:"24px 26px", marginBottom:28, display:"flex", alignItems:"center", gap:20, flexWrap:"wrap" }}>
          <div style={{ width:48, height:48, borderRadius:12, background:"#F97316"+"22", display:"flex", alignItems:"center", justifyContent:"center", fontSize:24, flexShrink:0 }}>⭐</div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#F97316", marginBottom:5 }}>How rewards work</div>
            <h3 style={{ fontFamily:"Anton, sans-serif", fontWeight:400, fontSize:"clamp(16px,2.5vw,22px)", textTransform:"uppercase", color:"#F8F7F4", lineHeight:1, marginBottom:6 }}>Each module earns XP + coins</h3>
            <p style={{ fontSize:13, color:"rgba(248,247,244,.5)", lineHeight:1.6 }}>Complete a full course to unlock a <span style={{ color:"#F97316", fontWeight:600 }}>certificate card</span> — collectible, shareable, validated by Playbook Series Inc.</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[{ icon:"⚡", label:"+50 XP", sub:"per module" },{ icon:"💰", label:"+10 coins", sub:"per module" },{ icon:"🎓", label:"Certificate", sub:"on completion" }].map(r => (
              <div key={r.label} style={{ background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.09)", borderRadius:10, padding:"10px 12px", textAlign:"center" }}>
                <div style={{ fontSize:18, marginBottom:4 }}>{r.icon}</div>
                <div style={{ fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, color:"#F97316" }}>{r.label}</div>
                <div style={{ fontFamily:"'Space Mono', monospace", fontSize:8, color:"rgba(255,255,255,.3)", marginTop:2 }}>{r.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* In progress strip */}
        {inProgress.length > 0 && (
          <div style={{ marginBottom:22 }}>
            <p style={{ fontFamily:"'Space Mono', monospace", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#94A3B8", marginBottom:10 }}>Continue where you left off</p>
            {inProgress.map(c => {
              const done = progress[c.id] || 0;
              const pct = Math.round((done / c.modules) * 100);
              return (
                <div key={c.id} onClick={() => router.push(`/courses/${c.id}`)}
                  style={{ display:"flex", alignItems:"center", gap:14, background:"#fff", border:"1.5px solid #E2E8F0", borderRadius:22, padding:"16px 18px", cursor:"pointer", marginBottom:8, transition:"border-color 0.15s" }}>
                  <div style={{ width:52, height:52, borderRadius:10, overflow:"hidden", flexShrink:0 }}>
                    <Image unoptimized width={1200} height={800} src={c.img} alt={c.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <span style={{ fontSize:14, fontWeight:700, color:"#0F172A" }}>{c.title}</span>
                      <span style={{ fontFamily:"'Space Mono', monospace", fontSize:9, fontWeight:700, letterSpacing:"0.06em", textTransform:"uppercase", background:c.color+"18", color:c.color, padding:"2px 7px", borderRadius:999 }}>{c.pillar}</span>
                    </div>
                    <div style={{ background:"#E2E8F0", borderRadius:999, height:5, overflow:"hidden", marginBottom:4 }}>
                      <div style={{ background:c.color, height:"100%", width:`${pct}%`, borderRadius:999, transition:"width 0.4s ease" }} />
                    </div>
                    <div style={{ fontFamily:"'Space Mono', monospace", fontSize:10, color:"#94A3B8" }}>{done}/{c.modules} modules · {pct}% · +{done*50} XP earned</div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); router.push(`/courses/${c.id}`); }}
                    style={{ fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", background:"#F97316", color:"#fff", border:"none", borderRadius:999, padding:"9px 16px", cursor:"pointer", flexShrink:0 }}>
                    Continue →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Flagship courses */}
        <div style={{ marginBottom:20 }}>
          <p
            style={{
              fontFamily:"'Space Mono', monospace",
              fontSize:11,
              letterSpacing:"0.18em",
              textTransform:"uppercase",
              color:"#F97316",
              marginBottom:8,
              fontWeight:700,
            }}
          >
            Playbook Signature Curriculum
          </p>

          <h2
            style={{
              fontFamily:"Anton, sans-serif",
              fontWeight:400,
              fontSize:"clamp(28px,4vw,42px)",
              textTransform:"uppercase",
              color:"#0F172A",
              lineHeight:0.95,
              margin:0,
            }}
          >
            Flagship Courses
          </h2>

          <p
            style={{
              color:"#64748B",
              marginTop:8,
              maxWidth:700,
              lineHeight:1.6,
            }}
          >
            The core Playbook experience designed for scholar-athletes,
            future leaders, and college-bound students.
          </p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:16, marginBottom:24 }}>
          {FLAGSHIP.map(c => {
            const done = progress[c.id] || 0;
            const pct = Math.round((done / c.modules) * 100);
            const isComplete = done === c.modules;
            return (
              <div key={c.id} className={c.comingSoon ? "" : "pb-card"}
                onClick={() => !c.comingSoon && router.push(`/courses/${c.id}`)}
                style={{ background:"#fff", border:`1.5px solid ${isComplete ? c.color+"44" : "#E2E8F0"}`, borderRadius:24, overflow:"hidden", transition:"all 0.2s", boxShadow:"0 12px 30px rgba(15,23,42,.04)", cursor:c.comingSoon?"default":"pointer", opacity:c.comingSoon?0.6:1 }}>
                {/* Photo */}
                <div style={{ position:"relative", height:160, overflow:"hidden" }}>
                  <Image unoptimized width={1200} height={800} src={c.img} alt={c.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(180deg,transparent 40%,rgba(15,23,42,.75) 100%)" }} />
                  <span style={{ position:"absolute", top:12, left:12, fontFamily:"'Space Mono', monospace", fontSize:9, fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", background:c.color, color:"#fff", padding:"4px 10px", borderRadius:999 }}>{c.pillar}</span>
                  {c.comingSoon && <span style={{ position:"absolute", top:12, right:12, fontFamily:"'Space Mono', monospace", fontSize:9, fontWeight:700, background:"rgba(15,23,42,.8)", color:"#94A3B8", padding:"4px 10px", borderRadius:999 }}>Coming soon</span>}
                  {isComplete && <span style={{ position:"absolute", top:12, right:12, fontFamily:"'Space Mono', monospace", fontSize:9, fontWeight:700, background:"#10B981", color:"#fff", padding:"4px 10px", borderRadius:999 }}>✓ Complete</span>}
                  {!c.comingSoon && !isComplete && done > 0 && (
                    <span style={{ position:"absolute", bottom:12, right:12, fontFamily:"'Space Mono', monospace", fontSize:9, fontWeight:700, background:"rgba(249,115,22,.9)", color:"#fff", padding:"3px 8px", borderRadius:999 }}>+50 XP/module</span>
                  )}
                </div>
                {/* Body */}
                <div style={{ padding:"16px 18px 18px" }}>
                  <h3 style={{ fontFamily:"Anton, sans-serif", fontWeight:400, fontSize:22, textTransform:"uppercase", color:"#0F172A", marginBottom:6 }}>{c.title}</h3>
                  <p style={{ fontSize:13, lineHeight:1.6, color:"#64748B", marginBottom:12 }}>{c.desc}</p>
                  {done > 0 && (
                    <div style={{ marginBottom:12 }}>
                      <div style={{ background:"#E2E8F0", borderRadius:999, height:5, overflow:"hidden" }}>
                        <div style={{ background:c.color, height:"100%", width:`${pct}%`, borderRadius:999 }} />
                      </div>
                    </div>
                  )}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:"1px solid #E2E8F0", paddingTop:12 }}>
                    <div>
                      <span style={{ fontFamily:"'Space Mono', monospace", fontSize:10, color:"#94A3B8" }}>{c.modules} modules</span>
                      {!c.comingSoon && <span style={{ fontFamily:"'Space Mono', monospace", fontSize:10, color:"#F97316", marginLeft:10 }}>+{c.modules*50} XP total</span>}
                    </div>
                    {!c.comingSoon && (
                      <span style={{ fontSize:13, fontWeight:700, color:"#F97316" }}>
                        {done===0?"Start →":isComplete?"Review →":`${pct}% done →`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>


        {/* Coming Soon Courses */}
        <div style={{ marginTop:40, marginBottom:30 }}>
          <p style={{ fontFamily:"'Space Mono', monospace", fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#94A3B8", marginBottom:8 }}>
            Upcoming courses
          </p>

          <h2 style={{ fontFamily:"Anton, sans-serif", fontWeight:400, fontSize:"clamp(24px,3vw,36px)", textTransform:"uppercase", color:"#0F172A", marginBottom:18 }}>
            Coming Soon
          </h2>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:18 }}>
            {COMING_SOON.map((c) => (
              <div key={c.id} style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:24, overflow:"hidden", opacity:.9, boxShadow:"0 12px 30px rgba(15,23,42,.04)" }}>
                <Image unoptimized width={1200} height={800} src={c.img} alt={c.title} style={{ width:"100%", height:160, objectFit:"cover" }} />

                <div style={{ padding:"16px 18px 18px" }}>
                  <p style={{ fontFamily:"'Space Mono', monospace", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:c.color, marginBottom:8 }}>
                    Coming soon · {c.pillar}
                  </p>

                  <h3 style={{ fontFamily:"Anton, sans-serif", fontWeight:400, fontSize:22, textTransform:"uppercase", color:"#0F172A", marginBottom:6 }}>
                    {c.title}
                  </h3>

                  <p style={{ fontSize:13, lineHeight:1.6, color:"#64748B", marginBottom:12 }}>
                    {c.desc}
                  </p>

                  <div style={{ borderTop:"1px solid #E2E8F0", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span style={{ fontFamily:"'Space Mono', monospace", fontSize:10, color:"#94A3B8" }}>
                      {c.modules} modules
                    </span>
                    <span style={{ fontSize:13, fontWeight:700, color:"#94A3B8" }}>
                      Locked 🔒
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{ background:"#0F172A", borderRadius:28, padding:"30px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:16 }}>
          <div>
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:10, letterSpacing:"0.16em", textTransform:"uppercase", color:"#F97316", marginBottom:8 }}>Complete the flagship library</div>
            <h3 style={{ fontFamily:"Anton, sans-serif", fontWeight:400, fontSize:"clamp(18px,3vw,28px)", textTransform:"uppercase", color:"#F8F7F4", lineHeight:1 }}>Earn all 5 certificate cards</h3>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => router.push("/certificates")}
              style={{ fontFamily:"'Space Mono', monospace", fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", background:"#F97316", color:"#fff", border:"none", borderRadius:999, padding:"12px 20px", cursor:"pointer" }}>
              View certificates →
            </button>
            <button onClick={() => router.push("/transcript")}
              style={{ fontFamily:"'Space Mono', monospace", fontSize:11, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", background:"transparent", color:"rgba(248,247,244,.55)", border:"1px solid rgba(255,255,255,.15)", borderRadius:999, padding:"12px 20px", cursor:"pointer" }}>
              My transcript
            </button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
