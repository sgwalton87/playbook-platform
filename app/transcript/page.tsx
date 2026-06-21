"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const COURSES = [
  { id:"captains-mindset", title:"Captain's Mindset", pillar:"Leadership", color:"#F97316", modules:6, done:3 },
  { id:"money-in-the-game", title:"Money in the Game", pillar:"Finance", color:"#3B82F6", modules:8, done:1 },
  { id:"mind-of-an-athlete", title:"Mind of an Athlete", pillar:"SEL", color:"#8B5CF6", modules:5, done:0 },
];

export default function TranscriptPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.replace("/login"); return; }
      const { data: p } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      setProfile(p);
    });
  }, []);

  const completed = COURSES.filter(c => c.done === c.modules);
  const inProgress = COURSES.filter(c => c.done > 0 && c.done < c.modules);
  const xpEarned = COURSES.reduce((acc, c) => acc + c.done * 50, 0);
  const coinsEarned = COURSES.reduce((acc, c) => acc + c.done * 10, 0);

  return (
    <div style={{ minHeight:"100vh", background:"#F8F7F4", fontFamily:"'Hanken Grotesk', system-ui, sans-serif", padding:"32px 36px", maxWidth:900 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Anton&family=Hanken+Grotesk:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');*{box-sizing:border-box;margin:0;padding:0;}`}</style>

      <p style={{ fontFamily:"'Space Mono', monospace", fontSize:10, letterSpacing:"0.2em", textTransform:"uppercase", color:"#F97316", marginBottom:6 }}>Academic record</p>
      <h1 style={{ fontFamily:"Anton, sans-serif", fontWeight:400, fontSize:"clamp(32px,4vw,48px)", textTransform:"uppercase", color:"#0F172A", lineHeight:.95, marginBottom:24 }}>Transcript</h1>

      {/* Student info */}
      <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:16, padding:"20px 24px", marginBottom:16, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
        <div>
          <h2 style={{ fontSize:18, fontWeight:800, color:"#0F172A", marginBottom:4 }}>{profile?.full_name || profile?.first_name || "Scholar"}</h2>
          <p style={{ fontSize:13, color:"#64748B" }}>{profile?.school || "Playbook Scholar"} · {profile?.sport || "Scholar-Athlete"} · Grad {profile?.grad_year || "—"}</p>
        </div>
        <div style={{ fontFamily:"'Space Mono', monospace", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"#94A3B8", textAlign:"right" }}>
          <div>Playbook Series Inc.</div>
          <div>Oakland, California</div>
          <div style={{ color:"#F97316", marginTop:4 }}>playbookseriesinc.org</div>
        </div>
      </div>

      {/* Summary stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginBottom:20 }}>
        {[
          { label:"XP earned", value:profile?.xp ?? xpEarned, icon:"⚡" },
          { label:"Coins", value:profile?.coin_balance ?? coinsEarned, icon:"💰" },
          { label:"Courses started", value:inProgress.length + completed.length, icon:"📚" },
          { label:"Completed", value:completed.length, icon:"✅" },
        ].map(({ label, value, icon }) => (
          <div key={label} style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:14, padding:"14px 16px" }}>
            <div style={{ fontSize:20, marginBottom:6 }}>{icon}</div>
            <div style={{ fontFamily:"'Space Mono', monospace", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:"#94A3B8", marginBottom:4 }}>{label}</div>
            <div style={{ fontFamily:"Anton, sans-serif", fontSize:28, fontWeight:400, color:"#0F172A", lineHeight:1 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Course progress table */}
      <div style={{ background:"#fff", border:"1px solid #E2E8F0", borderRadius:16, overflow:"hidden", marginBottom:20 }}>
        <div style={{ padding:"16px 22px", borderBottom:"1px solid #E2E8F0", background:"#F1F5F9", display:"grid", gridTemplateColumns:"1fr 100px 100px 120px 100px" }}>
          {["Course","Pillar","Modules","Progress","Status"].map(h => (
            <div key={h} style={{ fontFamily:"'Space Mono', monospace", fontSize:9, letterSpacing:"0.1em", textTransform:"uppercase", color:"#94A3B8" }}>{h}</div>
          ))}
        </div>
        {COURSES.map((c, i) => {
          const pct = Math.round((c.done / c.modules) * 100);
          const status = c.done === c.modules ? "Complete" : c.done > 0 ? "In progress" : "Not started";
          const statusColor = c.done === c.modules ? "#10B981" : c.done > 0 ? "#F97316" : "#94A3B8";
          return (
            <div key={c.id} style={{ padding:"14px 22px", borderBottom: i < COURSES.length-1 ? "1px solid #E2E8F0" : "none", display:"grid", gridTemplateColumns:"1fr 100px 100px 120px 100px", alignItems:"center", cursor:"pointer" }}
              onClick={() => router.push(`/courses/${c.id}`)}>
              <div style={{ fontSize:14, fontWeight:600, color:"#0F172A" }}>{c.title}</div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:10, color:c.color, fontWeight:700, textTransform:"uppercase" }}>{c.pillar}</div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:12, color:"#64748B" }}>{c.done}/{c.modules}</div>
              <div>
                <div style={{ background:"#E2E8F0", borderRadius:999, height:5, overflow:"hidden", width:80 }}>
                  <div style={{ background:c.color, height:"100%", width:`${pct}%`, borderRadius:999 }}/>
                </div>
                <div style={{ fontFamily:"'Space Mono', monospace", fontSize:9, color:"#94A3B8", marginTop:3 }}>{pct}%</div>
              </div>
              <div style={{ fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, color:statusColor }}>{status}</div>
            </div>
          );
        })}
      </div>

      {/* Certificates earned */}
      <div style={{ background:"#0F172A", borderRadius:16, padding:"20px 24px" }}>
        <p style={{ fontFamily:"'Space Mono', monospace", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color:"#F97316", marginBottom:14 }}>Certificates earned</p>
        {completed.length === 0 ? (
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ fontSize:28 }}>🔒</div>
            <div>
              <p style={{ fontSize:13, color:"rgba(248,247,244,.5)", lineHeight:1.6 }}>No certificates yet. Complete a full course to earn your first collectible certificate card.</p>
              <button onClick={() => router.push("/courses")} style={{ marginTop:10, fontFamily:"'Space Mono', monospace", fontSize:10, fontWeight:700, letterSpacing:"0.05em", textTransform:"uppercase", background:"#F97316", color:"#fff", border:"none", borderRadius:999, padding:"9px 16px", cursor:"pointer" }}>
                Go to courses →
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display:"flex", gap:14, flexWrap:"wrap" }}>
            {completed.map(c => (
              <div key={c.id} style={{ background:"rgba(255,255,255,.06)", border:`1px solid ${c.color}44`, borderRadius:12, padding:"12px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ fontSize:24 }}>🎓</div>
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:"#F8F7F4" }}>{c.title}</div>
                  <div style={{ fontFamily:"'Space Mono', monospace", fontSize:9, color:c.color, textTransform:"uppercase", letterSpacing:"0.06em" }}>{c.pillar} · Completed</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
