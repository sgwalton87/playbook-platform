"use client";

import { buildAcademicIntelligence } from "@/lib/academic-intelligence";

type Props = {
  courses?: LegacyValue[];
};

export default function AcademicIntelligenceSummary({ courses = [] }: Props) {
  const report = buildAcademicIntelligence(courses);

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24,marginBottom:14}}>
      <p style={{fontFamily:"'Space Mono', monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",marginBottom:12}}>
        Academic Intelligence
      </p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
        <div>
          <strong>{report.passedCredits}</strong>
          <p style={{fontSize:12,color:"#64748B"}}>Passed Credits</p>
        </div>
        <div>
          <strong>{report.graduationProgress}%</strong>
          <p style={{fontSize:12,color:"#64748B"}}>Graduation Progress</p>
        </div>
        <div>
          <strong>{report.collegeReadiness}%</strong>
          <p style={{fontSize:12,color:"#64748B"}}>College Readiness</p>
        </div>
      </div>

      {report.missingSignals.length > 0 ? (
        <div style={{fontSize:13,color:"#64748B"}}>
          <strong style={{color:"#0F172A"}}>Missing signals:</strong>
          <ul style={{margin:"8px 0 0 18px"}}>
            {report.missingSignals.map((signal)=>(
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p style={{fontSize:13,color:"#10B981"}}>Core academic signals detected.</p>
      )}
    </section>
  );
}
