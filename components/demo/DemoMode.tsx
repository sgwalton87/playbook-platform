"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { demoAchievements, demoCourses, demoLearner, demoTalkTrack } from "@/lib/demo/demoMode";
import { buildAcademicDNA } from "@/lib/academic-intelligence";
import { buildCompassReport } from "@/lib/compass";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { askOracle } from "@/lib/oracle";

const slides = [
  "Welcome",
  "The Problem",
  "Meet Scholar",
  "Academic DNA",
  "Opportunity Graph",
  "Compass",
  "Oracle",
  "Scholar Record",
  "Impact",
  "Presentation Path",
];

export default function DemoMode() {
  const [slide, setSlide] = useState(0);

  const dna = useMemo(() => buildAcademicDNA(demoCourses), []);
  const compass = useMemo(() => buildCompassReport({ courses: demoCourses, trustScore: demoLearner.trustScore }), []);
  const opportunities = useMemo(() => matchOpportunitiesFromSignals({
    skills: dna.strengths,
    majors: dna.interests,
    careers: dna.careerSignals,
    opportunities: dna.opportunitySignals,
  }), [dna]);

  const oracle = useMemo(() => askOracle({
    question: "What opportunities did Biology unlock?",
    courses: demoCourses,
    trustScore: demoLearner.trustScore,
  }), []);

  const progress = Math.round(((slide + 1) / slides.length) * 100);

  return (
    <main style={page}>
      <section style={deck}>
        <div style={topBar}>
          <div>
            <p style={eyebrow}>Playbook Demo Mode</p>
            <strong style={{color:"#0F172A"}}>{slides[slide]}</strong>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <span style={{fontSize:12,color:"#64748B",fontWeight:800}}>{progress}%</span>
            <div style={progressTrack}><div style={{...progressFill,width:`${progress}%`}} /></div>
          </div>
        </div>

        <div style={slideWrap}>
          {slide === 0 && (
            <Slide title="Playbook turns student records into guidance." eyebrow="Welcome">
              <p style={lead}>A learner intelligence operating system for districts, families, mentors, and opportunity partners.</p>
              <MetricRow dna={dna.confidence} opps={opportunities.matches.length} trust={demoLearner.trustScore} dollars={demoLearner.scholarshipPotential} />
            </Slide>
          )}

          {slide === 1 && (
            <Slide title="The problem is not talent. It is visibility." eyebrow="The Problem">
              <div style={twoCol}>
                {["Students have achievements that never become usable evidence.", "Families do not always know what step matters next.", "Counselors need earlier signals before students fall off track.", "Opportunities exist, but students rarely see the right ones at the right time."].map(x => <Problem key={x}>{x}</Problem>)}
              </div>
            </Slide>
          )}

          {slide === 2 && (
            <Slide title={`Meet ${demoLearner.name}.`} eyebrow="Demo Learner">
              <div style={profileBox}>
                <h2 style={{fontSize:34,margin:"0 0 8px"}}>{demoLearner.name}</h2>
                <p>{demoLearner.gradeLevel}th grade • {demoLearner.school} • {demoLearner.city}</p>
                <strong>{demoLearner.pathway}</strong>
              </div>
            </Slide>
          )}

          {slide === 3 && (
            <Slide title="Transcript becomes Academic DNA." eyebrow="Academic DNA">
              <div style={{display:"grid",gap:14}}>
                {dna.strengths.slice(0,6).map((signal, i) => <Meter key={signal} label={signal} value={Math.max(60, 94 - i * 6)} />)}
              </div>
            </Slide>
          )}

          {slide === 4 && (
            <Slide title="Academic DNA unlocks opportunities." eyebrow="Opportunity Graph">
              <div style={{display:"grid",gap:10}}>
                {opportunities.matches.slice(0,4).map(match => (
                  <Link key={match.opportunity.id} href="/opportunities" style={matchCard}>
                    <strong>{match.opportunity.title}</strong>
                    <span>{match.score}% match</span>
                  </Link>
                ))}
              </div>
            </Slide>
          )}

          {slide === 5 && (
            <Slide title="Compass explains the next best action." eyebrow="Compass">
              <p style={lead}>{compass.summary}</p>
              <div style={chips}>{compass.nextActions.slice(0,4).map(action => <span key={action} style={chip}>{action}</span>)}</div>
            </Slide>
          )}

          {slide === 6 && (
            <Slide title="Oracle answers questions across the learner record." eyebrow="Oracle">
              <p style={question}>Question: What opportunities did Biology unlock?</p>
              <p style={lead}>{oracle.answer}</p>
              <div style={chips}>{oracle.evidence.slice(0,3).map(e => <span key={e} style={chip}>{e}</span>)}</div>
            </Slide>
          )}

          {slide === 7 && (
            <Slide title="Evidence strengthens trust." eyebrow="Scholar Record">
              <div style={{display:"grid",gap:10}}>
                {demoAchievements.map(item => (
                  <div key={item.title} style={evidenceCard}>
                    <strong>{item.title}</strong>
                    <span>{item.category} • {item.status}</span>
                    <small>{item.impact}</small>
                  </div>
                ))}
              </div>
            </Slide>
          )}

          {slide === 8 && (
            <Slide title="The learner story becomes measurable." eyebrow="Impact">
              <MetricRow dna={dna.confidence} opps={opportunities.matches.length} trust={demoLearner.trustScore} dollars={demoLearner.scholarshipPotential} />
              <div style={talkGrid}>
                {demoTalkTrack.map((line, i) => <Problem key={line}>{i + 1}. {line}</Problem>)}
              </div>
            </Slide>
          )}

          {slide === 9 && (
            <Slide title="Walk into the full product." eyebrow="Presentation Path">
              <div style={ctaLinks}>
                <Link href="/journey" style={primary}>Start Journey →</Link>
                <Link href="/home" style={secondary}>Open Home</Link>
                <Link href="/opportunities" style={secondary}>Marketplace</Link>
                <Link href="/compass" style={secondary}>Compass</Link>
              </div>
            </Slide>
          )}
        </div>

        <div style={controls}>
          <button onClick={() => setSlide(Math.max(0, slide - 1))} style={secondaryButton}>← Back</button>
          <div style={dots}>
            {slides.map((s, i) => <button key={s} onClick={() => setSlide(i)} style={{...dot,background:i===slide?"#F97316":"#E2E8F0"}} />)}
          </div>
          <button onClick={() => setSlide(Math.min(slides.length - 1, slide + 1))} style={primaryButton}>Next →</button>
        </div>
      </section>
    </main>
  );
}

function Slide({ eyebrow, title, children }: LegacyValue) {
  return (
    <section>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <h1 style={titleStyle}>{title}</h1>
      <div style={{marginTop:24}}>{children}</div>
    </section>
  );
}

function MetricRow({ dna, opps, trust, dollars }: LegacyValue) {
  return (
    <div style={metrics}>
      <Metric label="Academic DNA" value={`${dna}%`} />
      <Metric label="Opportunities" value={String(opps)} />
      <Metric label="Trust" value={`${trust}%`} />
      <Metric label="Scholarship Potential" value={`$${dollars.toLocaleString()}`} />
    </div>
  );
}

function Metric({ label, value }: LegacyValue) {
  return <div style={metric}><p style={eyebrow}>{label}</p><strong>{value}</strong></div>;
}

function Meter({ label, value }: { label:string; value:number }) {
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#334155",marginBottom:6}}>
        <span>{label}</span><strong>{value}%</strong>
      </div>
      <div style={{height:9,background:"#E2E8F0",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${value}%`,background:"#F97316",borderRadius:999}} />
      </div>
    </div>
  );
}

function Problem({ children }: LegacyValue) {
  return <div style={problem}>{children}</div>;
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#0F172A",padding:28,fontFamily:"system-ui, sans-serif"};
const deck: React.CSSProperties = {minHeight:"calc(100vh - 56px)",background:"#F8F7F4",borderRadius:32,padding:24,display:"grid",gridTemplateRows:"auto 1fr auto",boxShadow:"0 30px 80px rgba(0,0,0,.28)"};
const topBar: React.CSSProperties = {display:"flex",justifyContent:"space-between",gap:20,alignItems:"center"};
const slideWrap: React.CSSProperties = {display:"grid",placeItems:"center",maxWidth:1040,margin:"0 auto",width:"100%"};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const eyebrowStyle: React.CSSProperties = {...eyebrow,textAlign:"center"};
const titleStyle: React.CSSProperties = {fontSize:58,lineHeight:1,letterSpacing:"-.05em",margin:"12px auto",color:"#0F172A",textAlign:"center",maxWidth:940};
const lead: React.CSSProperties = {fontSize:21,lineHeight:1.55,color:"#475569",textAlign:"center",maxWidth:840,margin:"0 auto"};
const progressTrack: React.CSSProperties = {width:150,height:8,background:"#E2E8F0",borderRadius:999,overflow:"hidden"};
const progressFill: React.CSSProperties = {height:"100%",background:"#F97316",borderRadius:999,transition:"width .3s ease"};
const controls: React.CSSProperties = {display:"flex",justifyContent:"space-between",alignItems:"center",gap:18};
const dots: React.CSSProperties = {display:"flex",gap:7,alignItems:"center"};
const dot: React.CSSProperties = {width:9,height:9,borderRadius:999,border:"none",cursor:"pointer"};
const primaryButton: React.CSSProperties = {background:"#F97316",color:"#fff",border:"none",borderRadius:999,padding:"12px 18px",fontWeight:900,cursor:"pointer"};
const secondaryButton: React.CSSProperties = {background:"#fff",color:"#0F172A",border:"1px solid #E2E8F0",borderRadius:999,padding:"12px 18px",fontWeight:900,cursor:"pointer"};
const twoCol: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:14};
const problem: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:18,color:"#0F172A",fontWeight:800,lineHeight:1.45,boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const profileBox: React.CSSProperties = {background:"#0F172A",color:"#fff",borderRadius:28,padding:30,textAlign:"center",boxShadow:"0 30px 70px rgba(15,23,42,.22)"};
const matchCard: React.CSSProperties = {display:"flex",justifyContent:"space-between",gap:12,textDecoration:"none",color:"#0F172A",background:"#fff",border:"1px solid #E2E8F0",borderRadius:16,padding:16,fontSize:14,boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const chips: React.CSSProperties = {display:"flex",gap:10,flexWrap:"wrap",justifyContent:"center"};
const chip: React.CSSProperties = {background:"#FFF7ED",border:"1px solid #FED7AA",color:"#F97316",borderRadius:999,padding:"9px 12px",fontSize:13,fontWeight:900};
const question: React.CSSProperties = {fontSize:15,color:"#0F172A",fontWeight:950,textAlign:"center"};
const evidenceCard: React.CSSProperties = {display:"grid",gap:5,background:"#fff",border:"1px solid #E2E8F0",borderRadius:16,padding:15,color:"#0F172A"};
const metrics: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,width:"100%"};
const metric: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:18,textAlign:"center",boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const talkGrid: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:12,marginTop:20};
const ctaLinks: React.CSSProperties = {display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"};
const primary: React.CSSProperties = {background:"#F97316",color:"#fff",borderRadius:14,padding:"14px 18px",textDecoration:"none",fontWeight:950};
const secondary: React.CSSProperties = {background:"#fff",color:"#0F172A",border:"1px solid #E2E8F0",borderRadius:14,padding:"14px 18px",textDecoration:"none",fontWeight:950};
