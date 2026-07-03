"use client";

import Link from "next/link";
import { useMemo } from "react";
import { demoAchievements, demoCourses, demoLearner, demoTalkTrack } from "@/lib/demo/demoMode";
import { buildAcademicDNA } from "@/lib/academic-intelligence";
import { buildCompassReport } from "@/lib/compass";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { askOracle } from "@/lib/oracle";

export default function DemoMode() {
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

  return (
    <main style={page}>
      <section style={hero}>
        <div>
          <p style={eyebrow}>Playbook Demo Mode</p>
          <h1 style={title}>A complete learner intelligence story.</h1>
          <p style={sub}>
            Demo Mode uses a fictional student profile to show districts, investors, and partners how Playbook turns records into guidance and opportunities.
          </p>
        </div>

        <div style={profileCard}>
          <p style={eyebrowDark}>Demo Learner</p>
          <h2 style={{margin:"6px 0",fontSize:26}}>{demoLearner.name}</h2>
          <p style={{margin:0,color:"#CBD5E1"}}>{demoLearner.gradeLevel}th grade • {demoLearner.city}</p>
          <p style={{margin:"8px 0 0",color:"#FED7AA",fontWeight:800}}>{demoLearner.pathway}</p>
        </div>
      </section>

      <section style={metrics}>
        <Metric label="Trust Score" value={`${demoLearner.trustScore}%`} />
        <Metric label="Academic DNA" value={`${dna.confidence}%`} />
        <Metric label="Opportunities" value={String(opportunities.matches.length)} />
        <Metric label="Scholarship Potential" value={`$${demoLearner.scholarshipPotential.toLocaleString()}`} />
      </section>

      <section style={grid2}>
        <Card label="Investor / District Talk Track" title="What this demo proves">
          <div style={{display:"grid",gap:10}}>
            {demoTalkTrack.map((line, i) => (
              <div key={line} style={talkItem}>
                <span style={number}>{i + 1}</span>
                <span>{line}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card label="Compass Briefing" title={compass.headline}>
          <p style={body}>{compass.summary}</p>
          <div style={chips}>
            {compass.nextActions.slice(0,3).map(action => <span key={action} style={chip}>{action}</span>)}
          </div>
        </Card>
      </section>

      <section style={grid2}>
        <Card label="Academic DNA" title="Signals from transcript evidence">
          {dna.strengths.slice(0,6).map((signal, i) => (
            <Meter key={signal} label={signal} value={Math.max(60, 94 - i * 6)} />
          ))}
        </Card>

        <Card label="Opportunity Graph" title="Matches unlocked">
          <div style={{display:"grid",gap:10}}>
            {opportunities.matches.slice(0,4).map(match => (
              <Link key={match.opportunity.id} href="/opportunities" style={matchCard}>
                <strong>{match.opportunity.title}</strong>
                <span>{match.score}% match</span>
              </Link>
            ))}
          </div>
        </Card>
      </section>

      <section style={grid2}>
        <Card label="Scholar Record Evidence" title="Proof that strengthens trust">
          <div style={{display:"grid",gap:10}}>
            {demoAchievements.map(item => (
              <div key={item.title} style={evidenceCard}>
                <strong>{item.title}</strong>
                <span>{item.category} • {item.status}</span>
                <small>{item.impact}</small>
              </div>
            ))}
          </div>
        </Card>

        <Card label="Oracle" title="Ask Playbook what changed">
          <p style={question}>Question: What opportunities did Biology unlock?</p>
          <p style={body}>{oracle.answer}</p>
          <div style={chips}>
            {oracle.evidence.slice(0,3).map(item => <span key={item} style={chip}>{item}</span>)}
          </div>
        </Card>
      </section>

      <section style={cta}>
        <div>
          <p style={eyebrow}>Presentation Path</p>
          <h2 style={{fontSize:34,margin:"6px 0",color:"#0F172A"}}>Walk the room through the full product story.</h2>
          <p style={body}>Use these links during investor meetings, district presentations, grant demos, and partner walkthroughs.</p>
        </div>

        <div style={ctaLinks}>
          <Link href="/journey" style={primary}>Start Journey →</Link>
          <Link href="/home" style={secondary}>Open Home</Link>
          <Link href="/opportunities" style={secondary}>Open Marketplace</Link>
          <Link href="/compass" style={secondary}>Open Compass</Link>
        </div>
      </section>
    </main>
  );
}

function Metric({ label, value }: { label:string; value:string }) {
  return (
    <div style={metric}>
      <p style={eyebrow}>{label}</p>
      <strong style={{fontSize:32,color:"#0F172A"}}>{value}</strong>
    </div>
  );
}

function Card({ label, title, children }: any) {
  return (
    <section style={card}>
      <p style={eyebrow}>{label}</p>
      <h2 style={cardTitle}>{title}</h2>
      <div style={{marginTop:14}}>{children}</div>
    </section>
  );
}

function Meter({ label, value }: { label:string; value:number }) {
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#334155",marginBottom:6}}>
        <span>{label}</span><strong>{value}%</strong>
      </div>
      <div style={{height:8,background:"#E2E8F0",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${value}%`,background:"#F97316",borderRadius:999}} />
      </div>
    </div>
  );
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#F8F7F4",padding:32,fontFamily:"system-ui, sans-serif"};
const hero: React.CSSProperties = {maxWidth:1180,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"2fr 1fr",gap:18,alignItems:"stretch"};
const profileCard: React.CSSProperties = {background:"#0F172A",color:"#fff",borderRadius:28,padding:26,boxShadow:"0 18px 45px rgba(15,23,42,.14)"};
const title: React.CSSProperties = {fontSize:54,lineHeight:1,margin:"8px 0",color:"#0F172A",letterSpacing:"-0.04em"};
const sub: React.CSSProperties = {fontSize:17,color:"#64748B",lineHeight:1.6,maxWidth:760};
const eyebrow: React.CSSProperties = {fontSize:11,letterSpacing:".14em",textTransform:"uppercase",fontWeight:950,color:"#F97316",margin:0};
const eyebrowDark: React.CSSProperties = {...eyebrow,color:"#FED7AA"};
const metrics: React.CSSProperties = {maxWidth:1180,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14};
const metric: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:22,padding:20,boxShadow:"0 12px 32px rgba(15,23,42,.05)"};
const grid2: React.CSSProperties = {maxWidth:1180,margin:"0 auto 18px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))",gap:18};
const card: React.CSSProperties = {background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:24,boxShadow:"0 18px 45px rgba(15,23,42,.06)"};
const cardTitle: React.CSSProperties = {fontSize:25,lineHeight:1.1,color:"#0F172A",margin:"7px 0 0"};
const body: React.CSSProperties = {fontSize:14,color:"#64748B",lineHeight:1.6};
const talkItem: React.CSSProperties = {display:"flex",gap:10,alignItems:"flex-start",fontSize:14,color:"#0F172A"};
const number: React.CSSProperties = {width:24,height:24,borderRadius:999,background:"#FFF7ED",color:"#F97316",display:"grid",placeItems:"center",fontWeight:900,fontSize:12,flex:"0 0 auto"};
const chips: React.CSSProperties = {display:"flex",gap:8,flexWrap:"wrap",marginTop:12};
const chip: React.CSSProperties = {background:"#FFF7ED",border:"1px solid #FED7AA",color:"#F97316",borderRadius:999,padding:"7px 10px",fontSize:12,fontWeight:800};
const matchCard: React.CSSProperties = {display:"flex",justifyContent:"space-between",gap:12,textDecoration:"none",color:"#0F172A",border:"1px solid #E2E8F0",borderRadius:14,padding:13,fontSize:13};
const evidenceCard: React.CSSProperties = {display:"grid",gap:4,border:"1px solid #E2E8F0",borderRadius:14,padding:13,color:"#0F172A"};
const question: React.CSSProperties = {fontSize:13,color:"#0F172A",fontWeight:900};
const cta: React.CSSProperties = {maxWidth:1180,margin:"0 auto",background:"#fff",border:"1px solid #E2E8F0",borderRadius:28,padding:26,display:"flex",justifyContent:"space-between",gap:20,alignItems:"center"};
const ctaLinks: React.CSSProperties = {display:"flex",gap:10,flexWrap:"wrap",justifyContent:"flex-end"};
const primary: React.CSSProperties = {background:"#F97316",color:"#fff",borderRadius:12,padding:"12px 15px",textDecoration:"none",fontWeight:900};
const secondary: React.CSSProperties = {background:"#fff",color:"#0F172A",border:"1px solid #E2E8F0",borderRadius:12,padding:"12px 15px",textDecoration:"none",fontWeight:900};
