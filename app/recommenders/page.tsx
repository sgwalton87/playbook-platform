"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import "@/components/recommenders/lor-portal.css";
import RecommendationLearnerGate from "@/components/recommenders/RecommendationLearnerGate";

type Row = {id:string;recommender_name:string;recommender_email:string;recommender_role:string;opportunity_name:string;status:string;created_at:string};
const roles=["educator","mentor","coach","family","employer"] as const;
type InnerCircle={id:string;name:string;email:string;relationship:string};
export default function RecommendationWorkspace() {
  return <RecommendationLearnerGate><RecommendationForm /></RecommendationLearnerGate>;
}
function RecommendationForm() {
  const [rows,setRows]=useState<Row[]>([]);
  const [innerCircle,setInnerCircle]=useState<InnerCircle[]>([]);
  const [relationshipId,setRelationshipId]=useState("");
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [role,setRole]=useState<(typeof roles)[number]>("educator");
  const [opportunity,setOpportunity]=useState("");
  const [source,setSource]=useState<"inner-circle"|"outside">("inner-circle");
  async function refresh() {
    const response=await fetch("/api/recommenders/request",{credentials:"same-origin",cache:"no-store"});
    if(response.ok){const result=await response.json();setRows(result.requests??[]);setInnerCircle(result.innerCircle??[]);}
  }
  useEffect(()=>{
    void fetch("/api/recommenders/request",{cache:"no-store"}).then(async response=>{
      if(!response.ok)return;
      const data=await response.json();
      setRows(data.requests??[]);setInnerCircle(data.innerCircle??[]);
    }).catch(()=>{});
  },[]);
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setNotice("");
    try{
      const response=await fetch("/api/recommenders/request",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({source,relationshipId:source==="inner-circle"?relationshipId:undefined,recommenderName:name,recommenderEmail:email,recommenderRole:role,opportunityName:opportunity,evidence:[]})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error??"Request not sent");
      setNotice("Request sent. The recipient must authenticate before accessing the Scholar's private information.");
      setName("");setEmail("");setOpportunity("");setRelationshipId("");
      await refresh();
    }catch(error){setNotice(error instanceof Error?error.message:"Request could not be sent.");}
    finally{setBusy(false);}
  }
  return <main className="lor-shell" style={{maxWidth:880,margin:"auto",padding:"24px",fontFamily:"system-ui"}}>
    <nav><Link href="/dashboard">Scholar Dashboard</Link> · <Link href="/scholar/resume">Résumé</Link></nav>
    <p style={{letterSpacing:3,fontSize:12,color:"#886524"}}>PLAYBOOK SERIES · SCHOLAR APPLICATION TOOLKIT</p>
    <h1>My Recommendation Requests</h1>
    <p>Ask someone who knows your work to write a recommendation. Nothing from your Scholar Record is included without a separate review.</p>
    <form onSubmit={submit} style={{display:"grid",gap:12,border:"1px solid #ddd",padding:20,borderRadius:14}}>
      <fieldset><legend>Where is this recommender?</legend>
        <label><input type="radio" name="source" checked={source==="inner-circle"} onChange={()=>setSource("inner-circle")}/> Someone in my Inner Circle</label>{" "}
        <label><input type="radio" name="source" checked={source==="outside"} onChange={()=>setSource("outside")}/> Outside Playbook</label>
      </fieldset>
      {source==="inner-circle"?<label>Choose an authorized Inner Circle member
        <select required value={relationshipId} onChange={e=>{
          setRelationshipId(e.target.value);
          const s=innerCircle.find(x=>x.id===e.target.value);
          if(s){setName(s.name);setEmail(s.email);}
        }} style={{display:"block",width:"100%",padding:10}}>
          <option value="">Choose your recommender</option>
          {innerCircle.map(x=><option key={x.id} value={x.id}>{x.name} ({x.relationship})</option>)}
        </select>
        {innerCircle.length===0&&<small>No active contacts with support-task permission found. You may request from an outside contact.</small>}
      </label>:<p style={{fontSize:13,color:"#5d6270"}}>Outside recommenders must verify their email in a Playbook account before submitting a letter. This is not a public upload link.</p>}
      <label>Recommender name<input required readOnly={source==="inner-circle"} value={name} maxLength={120} onChange={e=>setName(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>
      <label>Recommender email<input required type="email" readOnly={source==="inner-circle"} value={email} maxLength={254} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>
      <label>Relationship / role<select value={role} onChange={e=>setRole(e.target.value as typeof role)} style={{display:"block",width:"100%",padding:10}}>{roles.map(r=><option key={r} value={r}>{r}</option>)}</select></label>
      <label>Opportunity / program<input required value={opportunity} maxLength={180} onChange={e=>setOpportunity(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>
      <button disabled={busy||(source==="inner-circle"&&!relationshipId)} type="submit" style={{background:"#171717",color:"white",padding:12,border:0,borderRadius:9}}>{busy?"Sending…":"Request recommendation"}</button>
      {notice && <p role="status">{notice}</p>}
    </form>
    <h2>My requests</h2>
    {rows.length===0?<p>No recommendation requests are available yet.</p>:<ul>{rows.map(r=><li key={r.id} style={{padding:"12px 0",borderBottom:"1px solid #ddd"}}><strong>{r.recommender_name}</strong> — {r.opportunity_name} <span style={{color:"#806221"}}>({r.status})</span></li>)}</ul>}
    <p style={{fontSize:13,color:"#666"}}>Submitted letters appear in your private Scholar Vault. Application attachment saves a private reference and does not send a letter to an institution.</p>
  </main>;
}
