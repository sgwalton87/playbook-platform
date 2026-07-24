"use client";

import { buildOpportunityMatches } from "@/lib/opportunities";

type Props = {
  record: LegacyValue;
};

export default function OpportunityFeed({ record }: Props) {
  const opportunities = buildOpportunityMatches(record);

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24,marginBottom:14}}>
      <p style={{fontFamily:"'Space Mono', monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",marginBottom:12}}>
        Opportunity Engine
      </p>

      <div style={{display:"flex",flexDirection:"column",gap:14}}>
        {opportunities.map((opportunity)=>(
          <div key={opportunity.id} style={{border:"1px solid #E2E8F0",borderRadius:16,padding:16}}>
            <div style={{display:"flex",justifyContent:"space-between",gap:12,marginBottom:8}}>
              <strong style={{fontSize:15,color:"#0F172A"}}>{opportunity.title}</strong>
              <span style={{fontFamily:"'Space Mono', monospace",fontSize:12,color:"#F97316",fontWeight:700}}>
                {opportunity.readiness}%
              </span>
            </div>

            <p style={{fontSize:13,color:"#64748B",lineHeight:1.5,marginBottom:10}}>
              {opportunity.description}
            </p>

            <div style={{height:9,background:"#EEF2F7",borderRadius:999,overflow:"hidden",marginBottom:12}}>
              <div style={{height:"100%",width:`${opportunity.readiness}%`,background:"#10B981",borderRadius:999}} />
            </div>

            <div style={{fontSize:12,color:"#64748B",lineHeight:1.6}}>
              <strong style={{color:"#0F172A"}}>Why this appears:</strong>
              <ul style={{margin:"6px 0 10px 18px"}}>
                {opportunity.reasons.map((reason)=>(
                  <li key={reason}>{reason}</li>
                ))}
              </ul>

              <strong style={{color:"#0F172A"}}>Next steps:</strong>
              <ul style={{margin:"6px 0 0 18px"}}>
                {opportunity.nextSteps.map((step)=>(
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
