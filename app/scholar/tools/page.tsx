import Link from "next/link";

const tools = [
  {title:"Playbook Tutorial",href:"/tutorial",detail:"Explore the platform in five guided modules; choose the part you want to learn."},
  {title:"Compass",href:"/compass",detail:"Personalized guidance from available academic signals; unavailable data is not invented."},
  {title:"Transcript",href:"/transcript",detail:"Add and review academic evidence."},
  {title:"Academic Readiness",href:"/academic-readiness",detail:"See readiness assessments and missing information."},
  {title:"Recommendation Requests",href:"/recommenders",detail:"Invite a mentor, educator or another trusted recommender."},
  {title:"Recommendation Vault",href:"/scholar/recommendations",detail:"See submitted recommendations and their confidentiality status."},
  {title:"My Résumé",href:"/scholar/resume",detail:"Build your Scholar résumé."},
  {title:"Opportunities",href:"/opportunities",detail:"Explore available opportunities."},
  {title:"Courses",href:"/courses",detail:"See learning options."},
];
export default function ScholarToolsPage(){
 return <main style={{maxWidth:1080,margin:"auto",padding:"clamp(20px,5vw,54px)"}}>
  <p style={{fontSize:12,letterSpacing:2,color:"#a86b32",fontWeight:800}}>THE PLAYBOOK · SCHOLAR TOOLKIT</p>
  <h1 style={{fontSize:"clamp(32px,5vw,55px)",marginBottom:8}}>My Tools</h1>
  <p>All your Scholar tools in one place. A listed tool may still require setup or verified evidence before it can complete its workflow.</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,260px),1fr))",gap:16,marginTop:30}}>
    {tools.map(tool=><Link key={tool.href} href={tool.href} style={{textDecoration:"none",padding:24,background:"#191713",color:"#f8dfb0",border:"1px solid #9a773e",borderRadius:18}}>
     <h2 style={{fontSize:23,margin:"0 0 12px"}}>{tool.title} →</h2>
     <p style={{lineHeight:1.6,color:"#e1d1bb",margin:0}}>{tool.detail}</p>
    </Link>)}
  </div>
 </main>;
}
