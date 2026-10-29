"use client";
import { useEffect,useState } from "react";
import { COMMUNITY_POLICY_VERSION,COMMUNITY_VETTING_MODULES } from "@/lib/trust/communityStandards";
export default function CommunityVettingJourney({onAccepted}:{onAccepted:()=>void}) {
 const [step,setStep]=useState(0);const [checked,setChecked]=useState(false);const [accepted,setAccepted]=useState(false);const [busy,setBusy]=useState(true);const [error,setError]=useState("");
 useEffect(()=>{let active=true;void fetch("/api/verification/community-consent",{cache:"no-store"}).then(async response=>{const body=await response.json();if(!response.ok)throw new Error(body.error||"Agreement status could not be loaded.");if(active&&body.accepted){setAccepted(true);onAccepted();}}).catch(cause=>{if(active)setError(cause.message);}).finally(()=>{if(active)setBusy(false);});return()=>{active=false;};},[onAccepted]);
 async function accept(){setBusy(true);setError("");try{const response=await fetch("/api/verification/community-consent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({version:COMMUNITY_POLICY_VERSION,acknowledged:true})});const body=await response.json();if(!response.ok)throw new Error(body.error||"Acknowledgement could not be saved.");setAccepted(true);onAccepted();}catch(cause){setError(cause instanceof Error?cause.message:"Acknowledgement could not be saved.");}finally{setBusy(false);}}
 if(accepted)return <section aria-label="Community standards acknowledged" style={panel}><strong>Community standards acknowledged</strong><p>Your verification begins with community trust. Approval remains subject to ongoing safety standards, role permissions and consent.</p><details><summary>Review the vetting process and community standard</summary>{COMMUNITY_VETTING_MODULES.map(module=><section key={module.title}><h3>{module.title}</h3><p>{module.body}</p></section>)}</details></section>;
 const currentModule=COMMUNITY_VETTING_MODULES[step];
 return <section aria-label="Before you submit verification documents" style={panel}>
  <p>Getting to know Playbook · Module {step+1} of {COMMUNITY_VETTING_MODULES.length}</p><h2>{currentModule.title}</h2><p>{currentModule.body}</p>
  <progress aria-label="Vetting introduction progress" max={COMMUNITY_VETTING_MODULES.length} value={step+1}/>
  {step===COMMUNITY_VETTING_MODULES.length-1&&<label style={{display:"block",margin:"16px 0"}}><input type="checkbox" checked={checked} onChange={e=>setChecked(e.target.checked)}/> I understand why Playbook verifies participants and agree to the community standards, including suspension, removal and revocation of tool access for harmful conduct under the terms.</label>}
  <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:16}}><button type="button" disabled={busy||step===0} onClick={()=>setStep(previous=>previous-1)}>Back</button>{step<COMMUNITY_VETTING_MODULES.length-1?<button type="button" disabled={busy} onClick={()=>setStep(previous=>previous+1)}>Continue</button>:<button type="button" disabled={busy||!checked} onClick={()=>void accept()}>{busy?"Saving…":"Agree and continue to verification"}</button>}</div>
  {error&&<p role="alert">{error}</p>}<p><a href="/terms-of-service" target="_blank" rel="noopener noreferrer">Terms of Service</a> · <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a></p>
 </section>;
}
const panel:React.CSSProperties={padding:20,margin:"16px 0",border:"1px solid #CBD5E1",borderRadius:16,background:"white",color:"#15243A",lineHeight:1.65};
