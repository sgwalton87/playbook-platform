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
    <main style={{minHeight:"100vh",background:"#F8F7F4",padding:32,fontFamily:"system-ui, sans-serif"}}>
      <div style={{maxWidth:1180,margin:"0 auto",display:"grid",gap:18}}>
        <section style={hero}>
          <p style={mono}>Playbook Home</p>
          <h1 style={title}>Good morning, {name}. 👋</h1>
          <p style={sub}>Compass found {compass.recommendations.length} recommendations, {opportunities.matches.length} opportunity matches, and {dna.confidence}% Academic DNA confidence.</p>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",marginTop:18}}>
            <Link href="/opportunities" style={primaryBtn}>Open Marketplace →</Link>
            <Link href="/compass" style={secondaryBtn}>Ask Compass</Link>
          </div>
        </section>

        <section style={grid2}>
          <Card label="Compass Daily Briefing" title={compass.headline} score={compass.score}>
            <p style={body}>{compass.summary}</p>
            <ul style={list}>
              {compass.nextActions.slice(0,4).map(action => <li key={action}>{action}</li>)}
            </ul>
          </Card>

          <Card label="Academic DNA" title="Strength signals" score={dna.confidence}>
            {dna.strengths.slice(0,6).map((s, i) => <Meter key={s} label={s} value={Math.max(58, 92 - i * 7)} />)}
          </Card>
        </section>

        <section style={grid2}>
          <Card label="Scholar Genome" title="Whole learner profile" score={84}>
            {genome.map(([label, value]) => <Meter key={label as string} label={label as string} value={value as number} />)}
          </Card>

          <Card label="Opportunity Galaxy" title="Your active orbit" score={opportunities.score}>
            <div style={galaxy}>
              <div style={you}>YOU</div>
              {opportunities.matches.slice(0,6).map((m, i) => (
                <Link key={m.opportunity.id} href="/opportunities" style={{...star, transform:`rotate(${i*58}deg) translate(115px) rotate(-${i*58}deg)`}}>
                  {m.opportunity.type.replace("_"," ")}
                </Link>
              ))}
            </div>
          </Card>
        </section>

        <Card label="Growth Journey" title="Your story is building" score={91}>
          <div style={timeline}>
            {["Transcript", "Academic DNA", "Opportunity Match", "Compass Guidance", "Next Step"].map(item => (
              <div key={item} style={step}>
                <div style={dot} />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </main>
  );
}

function scoreFrom(values:string[], key:string) {
  return values.some(v => v.toLowerCase().includes(key)) ? 92 : 68;
}

function Card({ label, title, score, children }: any) {
  return (
    <section style={card}>
      <div style={{display:"flex",justifyContent:"space-between",gap:16}}>
        <div>
          <p style={mono}>{label}</p>
          <h2 style={cardTitle}>{title}</h2>
        </div>
        <div style={scoreStyle}>{score}%</div>
      </div>
      <div style={{marginTop:14}}>{children}</div>
    </section>
  );
}

function Meter({ label, value }: { label:string; value:number }) {
  return (
    <div style={{marginBottom:10}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#64748B",marginBottom:5}}>
        <span>{label}</span><strong>{value}%</strong>
      </div>
      <div style={{height:8,background:"#E2E8F0",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${value}%`,background:"#F97316",borderRadius:999,transition:"width .45s ease"}} />
      </div>
    </div>
  );
}

const hero={background:"#0F172A",color:"#fff",borderRadius:28,padding:30,animation:"fadeUp .45s ease both"} as React.CSSProperties;
const card={background:"#fff",border:"1px solid #E2E8F0",borderRadius:24,padding:22,animation:"fadeUp .45s ease both"} as React.CSSProperties;
const grid2={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",gap:18};
const mono={fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:"#94A3B8",fontWeight:900};
const title={fontSize:46,lineHeight:1,margin:"8px 0"};
const sub={fontSize:15,color:"#CBD5E1",lineHeight:1.6,maxWidth:740};
const cardTitle={fontSize:25,lineHeight:1.1,color:"#0F172A",margin:"6px 0"};
const body={fontSize:14,color:"#64748B",lineHeight:1.6};
const list={fontSize:13,color:"#64748B",lineHeight:1.6,margin:"10px 0 0 18px"};
const scoreStyle={fontSize:40,fontWeight:950,color:"#F97316",lineHeight:1};
const primaryBtn={background:"#F97316",color:"#fff",borderRadius:999,padding:"11px 15px",fontWeight:900,textDecoration:"none",fontSize:13};
const secondaryBtn={background:"#fff",color:"#0F172A",borderRadius:999,padding:"11px 15px",fontWeight:900,textDecoration:"none",fontSize:13};
const galaxy={height:270,position:"relative",display:"grid",placeItems:"center",overflow:"hidden"} as React.CSSProperties;
const you={width:78,height:78,borderRadius:999,background:"#0F172A",color:"#fff",display:"grid",placeItems:"center",fontWeight:950};
const star={position:"absolute",fontSize:11,background:"#FFF7ED",color:"#F97316",border:"1px solid #FED7AA",borderRadius:999,padding:"8px 10px",fontWeight:900,textDecoration:"none"} as React.CSSProperties;
const timeline={display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"};
const step={display:"flex",alignItems:"center",gap:8,color:"#0F172A",fontSize:13};
const dot={width:12,height:12,borderRadius:999,background:"#10B981",boxShadow:"0 0 0 5px #D1FAE5"};
