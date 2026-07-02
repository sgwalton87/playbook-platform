"use client";

const T={surface:"#FFFFFF",surface2:"#F1F5F9",ink:"#0F172A",muted:"#64748B",line:"#E2E8F0",orange:"#F97316",orangeL:"#FFF7ED",green:"#10B981",purple:"#8B5CF6",mono:"'Space Mono', monospace",anton:"'Anton', sans-serif"};

export default function PortfolioCompletion({scholarRecord}:{scholarRecord:any}) {
  const completion = scholarRecord?.intelligence?.completion || {};
  const percent = completion.percent || 0;

  const missing = completion.missing || {};
  const nextActions = [
    missing.avatar && "Upload your headshot",
    missing.banner && "Add a Portfolio banner",
    missing.bio && "Write your About Me",
    missing.school && "Add your school",
    missing.gpa && "Add GPA information",
    missing.dreamSchool && "Add dream school",
    missing.careerGoal && "Choose career goal",
    missing.salaryGoal && "Add salary goal",
    missing.pillars && "Select Playbook pillars",
  ].filter(Boolean).slice(0,4);

  return (
    <div style={{background:T.surface,border:`1px solid ${T.line}`,borderRadius:20,padding:"20px 24px",marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:16,marginBottom:14}}>
        <div>
          <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.14em",textTransform:"uppercase",color:T.muted,marginBottom:6}}>
            Portfolio Completion
          </p>
          <h2 style={{fontFamily:T.anton,fontSize:28,fontWeight:400,color:T.ink,lineHeight:1}}>
            {percent}% Complete
          </h2>
        </div>

        <span style={{fontFamily:T.mono,fontSize:10,fontWeight:700,background:T.orangeL,color:T.orange,borderRadius:999,padding:"7px 12px",border:`1px solid ${T.orange}22`}}>
          Opportunity Ready
        </span>
      </div>

      <div style={{height:12,background:T.surface2,borderRadius:999,overflow:"hidden",marginBottom:14}}>
        <div style={{height:"100%",width:`${percent}%`,background:`linear-gradient(90deg,${T.orange},${T.purple})`,borderRadius:999}} />
      </div>

      {nextActions.length>0 ? (
        <div>
          <p style={{fontFamily:T.mono,fontSize:10,letterSpacing:"0.1em",textTransform:"uppercase",color:T.muted,marginBottom:8}}>
            Next best actions
          </p>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
            {nextActions.map((action:any)=>(
              <div key={action} style={{background:T.surface2,borderRadius:12,padding:"10px 12px",fontSize:13,fontWeight:700,color:T.ink}}>
                □ {action}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{background:T.surface2,borderRadius:12,padding:"12px",fontSize:13,fontWeight:700,color:T.green}}>
          ✓ Portfolio foundation complete
        </div>
      )}
    </div>
  );
}
