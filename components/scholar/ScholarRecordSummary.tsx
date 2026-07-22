"use client";

type Props = {
  record: any;
};

function Bar({label,value}:{label:string;value:number}) {
  return (
    <div style={{marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
        <span style={{fontSize:13,color:"#64748B"}}>{label}</span>
        <strong style={{fontSize:13,color:"#0F172A"}}>{value}%</strong>
      </div>
      <div style={{height:9,background:"#EEF2F7",borderRadius:999,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${value}%`,background:"#F97316",borderRadius:999}}/>
      </div>
    </div>
  );
}

export default function PlaybookRecordSummary({record}:Props) {
  const readiness = record?.readiness || {};

  return (
    <section style={{background:"#fff",border:"1px solid #E2E8F0",borderRadius:20,padding:24,marginBottom:14}}>
      <p style={{fontFamily:"'Space Mono', monospace",fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:"#64748B",marginBottom:10}}>
        Scholar Record
      </p>

      <h2 style={{fontFamily:"'Anton', sans-serif",fontWeight:400,fontSize:28,textTransform:"uppercase",lineHeight:1,color:"#0F172A",marginBottom:18}}>
        {record?.identity?.fullName || "Scholar"}
      </h2>

      <Bar label="Portfolio Completion" value={readiness.portfolioCompletion ?? 0}/>
      <Bar label="Academic Readiness" value={readiness.academicReadiness ?? 0}/>
      <Bar label="Career Readiness" value={readiness.careerReadiness ?? 0}/>
      <Bar label="Leadership Readiness" value={readiness.leadershipReadiness ?? 0}/>
      <Bar label="Opportunity Readiness" value={readiness.opportunityReadiness ?? 0}/>
    </section>
  );
}
