"use client";

import { matchOpportunitiesFromSignals } from "@/lib/opportunity-graph/matching/OpportunityMatcher";
import { buildAcademicDNA } from "@/lib/academic-intelligence";
import { useMemo } from "react";

type Props = {
  courses?: any[];
};

export default function OpportunityGraphCard({ courses = [] }: Props) {
  const report = useMemo(() => {
    const dna = buildAcademicDNA(courses);

    return matchOpportunitiesFromSignals({
      skills: dna.strengths,
      majors: dna.interests,
      careers: dna.careerSignals,
      opportunities: dna.opportunitySignals,
    });
  }, [courses]);

  const matches = report.matches || [];

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24,marginBottom:14}}>
      <p style={{fontFamily:"'Space Mono', monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",marginBottom:12}}>
        Opportunity Graph
      </p>

      <div style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"flex-start",marginBottom:18}}>
        <div>
          <h2 style={{fontFamily:"'Anton', sans-serif",fontSize:30,fontWeight:400,textTransform:"uppercase",color:"#0F172A",lineHeight:1}}>
            Matched Opportunities
          </h2>
          <p style={{fontSize:13,color:"#64748B",marginTop:8,lineHeight:1.5}}>
            Academic DNA is matched to scholarships, mentors, careers, NIL readiness, and next steps.
          </p>
        </div>

        <div style={{fontFamily:"'Anton', sans-serif",fontSize:42,color:"#F97316",lineHeight:1}}>
          {report.score}%
        </div>
      </div>

      {matches.length === 0 ? (
        <div style={{border:"1px dashed #CBD5E1",borderRadius:16,padding:16,fontSize:13,color:"#64748B"}}>
          Add transcript courses to activate opportunity matching.
        </div>
      ) : (
        <div style={{display:"grid",gap:12}}>
          {matches.slice(0,4).map((match:any)=>(
            <div key={match.opportunity.id} style={{border:"1px solid #E2E8F0",borderRadius:16,padding:16}}>
              <div style={{display:"flex",justifyContent:"space-between",gap:12}}>
                <div>
                  <div style={{fontSize:12,fontWeight:900,color:"#F97316",textTransform:"uppercase"}}>
                    {match.opportunity.type.replace("_"," ")}
                  </div>
                  <h3 style={{fontSize:18,color:"#0F172A",margin:"4px 0"}}>
                    {match.opportunity.title}
                  </h3>
                </div>
                <strong style={{fontSize:18,color:"#0F172A"}}>{match.score}%</strong>
              </div>

              <p style={{fontSize:13,color:"#64748B",lineHeight:1.5,marginTop:8}}>
                {match.opportunity.description}
              </p>

              {match.reasons.length > 0 && (
                <div style={{marginTop:10,fontSize:12,color:"#64748B"}}>
                  <strong style={{color:"#0F172A"}}>Why this matched:</strong>
                  <ul style={{margin:"6px 0 0 18px"}}>
                    {match.reasons.slice(0,3).map((reason:string)=>(
                      <li key={reason}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:12}}>
                {match.nextSteps.slice(0,3).map((step:string)=>(
                  <span key={step} style={{fontSize:11,border:"1px solid #E2E8F0",borderRadius:999,padding:"5px 8px",color:"#64748B"}}>
                    {step}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
