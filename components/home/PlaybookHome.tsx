"use client";

import Link from "next/link";
import { buildAcademicDNA } from "@/lib/academic-intelligence";
import { buildCompassReport } from "@/lib/compass";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { useMemo } from "react";

const demoCourses = [
  { name: "Biology", subject: "science", credits: 10, grade: "A", completed: true },
  { name: "Algebra II", subject: "math", credits: 10, grade: "B", completed: true },
  { name: "English 9", subject: "english", credits: 10, grade: "A", completed: true },
];

export default function PlaybookHome({ courses = demoCourses, name = "Scholar" }: { courses?: any[]; name?: string }) {
  const dna = useMemo(() => buildAcademicDNA(courses), [courses]);
  const compass = useMemo(() => buildCompassReport({ courses, trustScore: 68 }), [courses]);
  const opportunities = useMemo(() => matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  }), [dna]);

  const genome = [
    ["Scientific Inquiry", scoreFrom(dna.strengths, "scientific")],
    ["Communication", scoreFrom(dna.strengths, "communication")],
    ["Quantitative Reasoning", scoreFrom(dna.strengths, "quantitative")],
    ["Leadership", 76],
    ["Service", 72],
    ["Entrepreneurship", 69],
  ];

  return (
    <main style={page}>
      <div style={shell}>
        <section style={hero}>
          <div>
            <p style={eyebrow}>Playbook Home</p>
            <h1 style={heroTitle}>Good morning, {name}. 👋</h1>
            <p style={heroSub}>
              Compass found {compass.recommendations.length} recommendations, {opportunities.matches.length} opportunity matches, and {dna.confidence}% Academic DNA confidence.
            </p>
          </div>

          <div style={heroActions}>
            <Link href="/opportunities" style={primaryBtn}>Open Marketplace →</Link>
            <Link href="/compass" style={secondaryBtn}>Ask Compass</Link>
          </div>
        </section>

        <section style={topGrid}>
          <Card icon="☀️" label="Compass Daily Briefing" title={compass.headline} meta={`Score: ${compass.score}%`}>
            <p style={body}>{compass.summary}</p>
            <div style={checkList}>
              {compass.nextActions.slice(0,4).map(action => (
                <div key={action} style={checkItem}><span style={check}>✓</span>{action}</div>
              ))}
            </div>
          </Card>

          <Card icon="🧬" label="Academic DNA" title="Your top strength signals" meta={`Confidence: ${dna.confidence}%`}>
            {dna.strengths.slice(0,6).map((s, i) => <Meter key={s} label={s} value={Math.max(58, 92 - i * 7)} />)}
          </Card>

          <Card icon="♟️" label="Scholar Genome" title="Whole learner profile" meta="Overall: 84%">
            {genome.map(([label, value]) => <Meter key={label as string} label={label as string} value={value as number} />)}
          </Card>
        </section>

        <section style={grid2}>
          <Card icon="🌌" label="Opportunity Galaxy" title="Your active orbit" meta={`Match score: ${opportunities.score}%`}>
            <div style={galaxy}>
              <div style={orbitOne} />
              <div style={orbitTwo} />
              <div style={you}>YOU</div>
              {opportunities.matches.slice(0,6).map((m, i) => (
                <Link key={m.opportunity.id} href="/opportunities" style={{...star, transform:`rotate(${i*58}deg) translate(118px) rotate(-${i*58}deg)`}}>
                  {m.opportunity.type.replace("_"," ")}
                </Link>
              ))}
            </div>
          </Card>

          <Card icon="🧭" label="Growth Journey" title="Your story is building" meta="Progress: 91%">
            <div style={journey}>
              {["Transcript", "Academic DNA", "Opportunity", "Compass", "Next Step"].map((item, i) => (
                <div key={item} style={journeyStep}>
                  <div style={journeyDot}>{i < 4 ? "✓" : ""}</div>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <p style={encouragement}>Keep going. You&apos;re building something powerful..</p>
          </Card>
        </section>

        <section style={grid2}>
          <Card icon="⭐" label="Recent Opportunities" title="Recommended for you" meta="View all →">
            <div style={{display:"grid",gap:10}}>
              {opportunities.matches.slice(0,3).map(match => (
                <Link key={match.opportunity.id} href="/opportunities" style={miniOpp}>
                  <strong>{match.opportunity.title}</strong>
                  <span>{match.score}% match</span>
                </Link>
              ))}
            </div>
          </Card>

          <Card icon="🔎" label="Oracle" title="Ask Playbook anything" meta="Coming alive">
            <div style={askBox}>
              <span>Why did my Opportunity Score increase?</span>
              <Link href="/compass" style={askBtn}>Ask →</Link>
            </div>
          </Card>
        </section>
      </div>
    </main>
  );
}

function scoreFrom(values:string[], key:string) {
  return values.some(v => v.toLowerCase().includes(key)) ? 92 : 68;
}

function Card({ icon, label, title, meta, children }: any) {
  return (
    <section style={card}>
      <div style={cardHead}>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={iconBubble}>{icon}</div>
          <div>
            <p style={cardLabel}>{label}</p>
            <h2 style={cardTitle}>{title}</h2>
          </div>
        </div>
        <div style={metaStyle}>{meta}</div>
      </div>
      <div style={{marginTop:16}}>{children}</div>
    </section>
  );
}

function Meter({ label, value }: { label:string; value:number }) {
  return (
    <div style={{marginBottom:13}}>
      <div style={meterTop}>
        <span>{label}</span><strong>{value}%</strong>
      </div>
      <div style={meterTrack}>
        <div style={{...meterFill,width:`${value}%`}} />
      </div>
    </div>
  );
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#F8F7F4",padding:32,fontFamily:"system-ui, sans-serif"};
const shell: React.CSSProperties = {maxWidth:1240,margin:"0 auto",display:"grid",gap:18};
const hero: React.CSSProperties = {display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:24,background:"linear-gradient(135deg,#FFFFFF,#FFF7ED)",border:"1px solid #E2E8F0",borderRadius:30,padding:30,boxShadow:"0 18px 45px rgba(15,23,42,.06)",animation:"fadeUp .45s ease both"};
const eyebrow: React.CSSProperties = {fontSize:12,letterSpacing:"0.16em",textTransform:"uppercase",color:"#F97316",fontWeight:950,margin:0};
const heroTitle: React.CSSProperties = {fontSize:52,lineHeight:1,margin:"14px 0 10px",color:"#0F172A",letterSpacing:"-0.04em"};
const heroSub: React.CSSProperties = {fontSize:17,color:"#475569",lineHeight:1.55,maxWidth:760,margin:0};
const heroActions: React.CSSProperties = {display:"flex",gap:10,flexWrap:"wrap"};
const primaryBtn: React.CSSProperties = {background:"#F97316",color:"#fff",borderRadius:12,padding:"13px 18px",fontWeight:900,textDecoration:"none",fontSize:14,boxShadow:"0 12px 24px rgba(249,115,22,.25)"};
const secondaryBtn: React.CSSProperties = {background:"#fff",color:"#0F172A",border:"1px solid #E2E8F0",borderRadius:12,padding:"13px 18px",fontWeight:900,textDecoration:"none",fontSize:14};
const topGrid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(310px,1fr))",gap:18};
const grid2: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(360px,1fr))",gap:18};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 18px 45px rgba(15,23,42,.06)",animation:"fadeUp .45s ease both"};
const cardHead: React.CSSProperties = {display:"flex",justifyContent:"space-between",gap:14,alignItems:"flex-start"};
const iconBubble: React.CSSProperties = {width:34,height:34,borderRadius:999,background:"#FFF7ED",display:"grid",placeItems:"center",fontSize:18};
const cardLabel: React.CSSProperties = {fontSize:11,color:"#64748B",fontWeight:950,textTransform:"uppercase",letterSpacing:".11em",margin:0};
const cardTitle: React.CSSProperties = {fontSize:21,lineHeight:1.15,color:"#0F172A",margin:"5px 0 0"};
const metaStyle: React.CSSProperties = {fontSize:12,color:"#2563EB",fontWeight:900,whiteSpace:"nowrap"};
const body: React.CSSProperties = {fontSize:14,color:"#475569",lineHeight:1.55};
const checkList: React.CSSProperties = {display:"grid",gap:8,marginTop:14};
const checkItem: React.CSSProperties = {display:"flex",gap:9,alignItems:"center",fontSize:13,color:"#0F172A"};
const check: React.CSSProperties = {width:18,height:18,borderRadius:999,background:"#10B981",color:"#fff",display:"grid",placeItems:"center",fontSize:12,fontWeight:900};
const meterTop: React.CSSProperties = {display:"flex",justifyContent:"space-between",fontSize:13,color:"#334155",marginBottom:6};
const meterTrack: React.CSSProperties = {height:7,background:"#E2E8F0",borderRadius:999,overflow:"hidden"};
const meterFill: React.CSSProperties = {height:"100%",background:"#F97316",borderRadius:999,transition:"width .45s ease"};
const galaxy: React.CSSProperties = {height:280,position:"relative",display:"grid",placeItems:"center",overflow:"hidden"};
const orbitOne: React.CSSProperties = {position:"absolute",width:160,height:160,border:"1px dashed #CBD5E1",borderRadius:999};
const orbitTwo: React.CSSProperties = {position:"absolute",width:240,height:240,border:"1px dashed #E2E8F0",borderRadius:999};
const you: React.CSSProperties = {width:74,height:74,borderRadius:999,background:"#0F172A",color:"#fff",display:"grid",placeItems:"center",fontWeight:950,zIndex:2,boxShadow:"0 20px 40px rgba(15,23,42,.25)"};
const star: React.CSSProperties = {position:"absolute",fontSize:11,background:"#FFF7ED",color:"#F97316",border:"1px solid #FED7AA",borderRadius:999,padding:"8px 10px",fontWeight:900,textDecoration:"none",zIndex:3};
const journey: React.CSSProperties = {display:"flex",justifyContent:"space-between",gap:10,alignItems:"flex-start",padding:"32px 8px 18px",position:"relative"};
const journeyStep: React.CSSProperties = {display:"grid",gap:8,justifyItems:"center",fontSize:12,color:"#0F172A",fontWeight:800,textAlign:"center",flex:1};
const journeyDot: React.CSSProperties = {width:30,height:30,borderRadius:999,border:"3px solid #10B981",background:"#fff",color:"#10B981",display:"grid",placeItems:"center",fontWeight:900};
const encouragement: React.CSSProperties = {textAlign:"center",color:"#059669",fontWeight:800,marginTop:8};
const miniOpp: React.CSSProperties = {display:"flex",justifyContent:"space-between",gap:12,textDecoration:"none",color:"#0F172A",border:"1px solid #E2E8F0",borderRadius:14,padding:12,fontSize:13};
const askBox: React.CSSProperties = {display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,border:"1px solid #E2E8F0",borderRadius:16,padding:14,color:"#475569",fontSize:14};
const askBtn: React.CSSProperties = {background:"#0F172A",color:"#fff",borderRadius:999,padding:"9px 12px",textDecoration:"none",fontWeight:900,fontSize:12};
