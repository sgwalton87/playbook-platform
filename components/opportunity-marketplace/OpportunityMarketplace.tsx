"use client";

import { useMemo, useState } from "react";
import { buildAcademicDNA } from "@/lib/academic-intelligence";
import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";

type Props = {
  courses?: LegacyValue[];
};

const filters = ["all", "scholarship", "internship", "mentor", "college", "career", "summer_program", "nil", "research"];

export default function OpportunityMarketplace({ courses = [] }: Props) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [statuses, setStatuses] = useState<Record<string, string>>({});

  const report = useMemo(() => {
    const dna = buildAcademicDNA(courses);
    return matchOpportunitiesFromSignals({
      skills: dna.strengths,
      majors: dna.interests,
      careers: dna.careerSignals,
      opportunities: dna.opportunitySignals,
    });
  }, [courses]);

  const matches = report.matches.filter((match) =>
    activeFilter === "all" ? true : match.opportunity.type === activeFilter
  );

  return (
    <section style={{background:"#F8F7F4",minHeight:"100vh",padding:36,fontFamily:"system-ui, sans-serif"}}>
      <div style={{maxWidth:1100,margin:"0 auto"}}>
        <p style={{fontFamily:"'Space Mono', monospace",fontSize:11,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B"}}>
          Opportunity Marketplace
        </p>

        <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-end",margin:"10px 0 22px"}}>
          <div>
            <h1 style={{fontSize:42,lineHeight:1,color:"#0F172A",margin:0}}>
              Recommended Opportunities
            </h1>
            <p style={{fontSize:14,color:"#64748B",maxWidth:660,lineHeight:1.6}}>
              Browse scholarships, mentors, careers, NIL pathways, research, and next steps matched from Academic DNA.
            </p>
          </div>

          <div style={{fontSize:42,fontWeight:900,color:"#F97316"}}>
            {report.score}%
          </div>
        </div>

        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:22}}>
          {filters.map((filter)=>(
            <button
              key={filter}
              onClick={()=>setActiveFilter(filter)}
              style={{
                border:"1px solid #E2E8F0",
                background:activeFilter===filter?"#0F172A":"#fff",
                color:activeFilter===filter?"#fff":"#0F172A",
                borderRadius:999,
                padding:"8px 12px",
                fontSize:12,
                fontWeight:800,
                cursor:"pointer",
                textTransform:"capitalize"
              }}
            >
              {filter.replace("_"," ")}
            </button>
          ))}
        </div>

        {matches.length === 0 ? (
          <div style={{background:"#fff",border:"1px dashed #CBD5E1",borderRadius:20,padding:24,color:"#64748B"}}>
            Add transcript courses or achievements to unlock opportunity matches.
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(290px,1fr))",gap:16}}>
            {matches.map((match)=> {
              const id = match.opportunity.id;
              const status = statuses[id] || "recommended";

              return (
                <article key={id} style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                    <div>
                      <div style={{fontSize:11,fontWeight:900,color:"#F97316",textTransform:"uppercase"}}>
                        {match.opportunity.type.replace("_"," ")}
                      </div>
                      <h2 style={{fontSize:20,color:"#0F172A",margin:"6px 0"}}>
                        {match.opportunity.title}
                      </h2>
                    </div>
                    <strong style={{fontSize:20,color:"#0F172A"}}>{match.score}%</strong>
                  </div>

                  <p style={{fontSize:13,color:"#64748B",lineHeight:1.55}}>
                    {match.opportunity.description}
                  </p>

                  <div style={{fontSize:12,color:"#64748B",marginTop:12}}>
                    <strong style={{color:"#0F172A"}}>Why this matched</strong>
                    <ul style={{margin:"6px 0 0 18px"}}>
                      {match.reasons.slice(0,3).map(reason => <li key={reason}>{reason}</li>)}
                    </ul>
                  </div>

                  <div style={{fontSize:12,color:"#64748B",marginTop:12}}>
                    <strong style={{color:"#0F172A"}}>Next steps</strong>
                    <ul style={{margin:"6px 0 0 18px"}}>
                      {match.nextSteps.slice(0,3).map(step => <li key={step}>{step}</li>)}
                    </ul>
                  </div>

                  <div style={{display:"flex",gap:8,marginTop:16,flexWrap:"wrap"}}>
                    <button
                      onClick={()=>setSaved(prev=>({...prev,[id]:!prev[id]}))}
                      style={buttonStyle(saved[id] ? "#10B981" : "#F97316")}
                    >
                      {saved[id] ? "Saved" : "Save"}
                    </button>

                    <select
                      value={status}
                      onChange={(e)=>setStatuses(prev=>({...prev,[id]:e.target.value}))}
                      style={{border:"1px solid #E2E8F0",borderRadius:999,padding:"8px 10px",fontSize:12}}
                    >
                      <option value="recommended">Recommended</option>
                      <option value="interested">Interested</option>
                      <option value="planning">Planning</option>
                      <option value="applied">Applied</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function buttonStyle(background:string): React.CSSProperties {
  return {
    background,
    color:"#fff",
    border:"none",
    borderRadius:999,
    padding:"9px 13px",
    fontSize:12,
    fontWeight:900,
    cursor:"pointer"
  };
}
