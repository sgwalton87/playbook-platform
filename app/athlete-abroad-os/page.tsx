"use client";

export default function AthleteAbroadOSPage() {
  return (
    <main style={{padding:24}}>
      <section style={{background:"#0F172A",color:"#F8F7F4",borderRadius:32,padding:"48px"}}>
        <p style={{fontFamily:"'Space Mono', monospace",fontSize:11,letterSpacing:".16em",textTransform:"uppercase",color:"#F97316",fontWeight:900}}>
          Athlete Abroad OS
        </p>
        <h1 style={{fontFamily:"'Anton', sans-serif",fontSize:"clamp(48px,8vw,92px)",lineHeight:.9,textTransform:"uppercase",margin:"12px 0"}}>
          Take your game global.
        </h1>
        <p style={{fontSize:22,lineHeight:1.45,maxWidth:900,color:"rgba(248,247,244,.78)"}}>
          A pathway for athletes exploring overseas, post-grad, academy, semi-pro, and professional opportunities after high school or college.
        </p>
      </section>

      <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))",gap:16,marginTop:20}}>
        {[
          ["Eligibility Passport","Academic records, transcripts, diploma, NCAA/NAIA status, and transfer history."],
          ["Athlete Portfolio","Film, stats, position, measurements, honors, references, and resume."],
          ["Country Targets","Track leagues, countries, teams, agencies, visa needs, and deadlines."],
          ["Agent / Contact Tracker","Organize coaches, scouts, agents, clubs, messages, and follow-ups."],
          ["Money + Contract Prep","Understand housing, salary, travel, taxes, agent fees, and contract basics."],
          ["Culture + Safety","Prepare for language, food, healthcare, housing, documents, and emergency contacts."]
        ].map(([title,body])=>(
          <article key={title} style={{background:"#FFFFFF",border:"1px solid #E2E8F0",borderRadius:24,padding:24}}>
            <p style={{fontFamily:"'Space Mono', monospace",fontSize:10,letterSpacing:".14em",textTransform:"uppercase",color:"#F97316",fontWeight:900}}>Module</p>
            <h2 style={{margin:"6px 0 8px"}}>{title}</h2>
            <p style={{color:"#64748B",lineHeight:1.5}}>{body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
