"use client";

import { buildLivingScholarExperience } from "@/lib/living-scholar";
import MorningBrief from "./MorningBrief";
import AcademicDNAVisualizer from "./AcademicDNAVisualizer";
import OpportunityGalaxy from "./OpportunityGalaxy";
import ScholarTimeline from "./ScholarTimeline";
import OracleCopilot from "./OracleCopilot";
import GrowthScore from "./GrowthScore";

export default function LivingScholar() {
  const experience = buildLivingScholarExperience({
    name: "Maya",
    trustScore: 78,
  });

  return (
    <main style={page}>
      <div style={shell}>
        <MorningBrief brief={experience.morningBrief} />

        <a href="/intelligence-platform" style={{display:"inline-flex",background:"#F97316",color:"#fff",borderRadius:999,padding:"10px 13px",fontWeight:900,textDecoration:"none",width:"fit-content"}}>Open Recommendation + Scenario Lab →</a>
        <a href="/invitations" style={{display:"inline-flex",background:"#0F172A",color:"#fff",borderRadius:999,padding:"10px 13px",fontWeight:900,textDecoration:"none",width:"fit-content"}}>Invite Support Network →</a>

        <section style={grid3}>
          <GrowthScore score={experience.growthScore} />
          <AcademicDNAVisualizer dna={experience.dna} />
          <OracleCopilot oracle={experience.oracle} />
        </section>

        <section style={grid2}>
          <OpportunityGalaxy opportunities={experience.opportunities} />
          <ScholarTimeline timeline={experience.timeline} />
        </section>
      </div>
    </main>
  );
}

const page: React.CSSProperties = {minHeight:"100vh",background:"#F8F7F4",padding:32,fontFamily:"system-ui, sans-serif"};
const shell: React.CSSProperties = {maxWidth:1240,margin:"0 auto",display:"grid",gap:18};
const grid3: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:18};
const grid2: React.CSSProperties = {display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(360px,1fr))",gap:18};
