"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { CanonicalRoleAuthorityGate } from "@/components/role-os/RoleAuthorityGate";

type Row = {id:string;recommender_name:string;recommender_email:string;recommender_role:string;opportunity_name:string;status:string;created_at:string};
const roles=["educator","mentor","coach","family","employer"] as const;
export default function RecommendationWorkspace() {
  return <CanonicalRoleAuthorityGate role="scholar"><RecommendationForm /></CanonicalRoleAuthorityGate>;
}
function RecommendationForm() {
  const [rows,setRows]=useState<Row[]>([]);
  const [busy,setBusy]=useState(false);
  const [notice,setNotice]=useState("");
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [role,setRole]=useState<(typeof roles)[number]>("educator");
  const [opportunity,setOpportunity]=useState("");
  const [source,setSource]=useState<"inner-circle"|"outside">("inner-circle");
  async function refresh() {
    const response=await fetch("/api/recommenders/request",{credentials:"same-origin",cache:"no-store"});
    if(response.ok){const result=await response.json();setRows(result.requests??[]);}
  }
  useEffect(()=>{void refresh();},[]);
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();setBusy(true);setNotice("");
    try{
      const response=await fetch("/api/recommenders/request",{method:"POST",credentials:"same-origin",headers:{"content-type":"application/json"},body:JSON.stringify({recommenderName:name,recommenderEmail:email,recommenderRole:role,opportunityName:opportunity,evidence:[]})});
      const data=await response.json();
      if(!response.ok) throw new Error(data.error??"Request not sent");
      setNotice("Request sent. The recipient must authenticate before accessing the Scholar's private information.");
      setName("");setEmail("");setOpportunity("");
      await refresh();
    }catch(error){setNotice(error instanceof Error?error.message:"Request could not be sent.");}
    finally{setBusy(false);}
  }
  return <main style={{maxWidth:880,margin:"auto",padding:"24px",fontFamily:"system-ui"}}>
    <nav><Link href="/dashboard">Scholar Dashboard</Link> · <Link href="/scholar/resume">Résumé</Link></nav>
    <p style={{letterSpacing:3,fontSize:12,color:"#886524"}}>PLAYBOOK SERIES · SCHOLAR APPLICATION TOOLKIT</p>
    <h1>My Recommendation Requests</h1>
    <p>Ask someone who knows your work to write a recommendation. Nothing from your Scholar Record is included without a separate review.</p>
    <form onSubmit={submit} style={{display:"grid",gap:12,border:"1px solid #ddd",padding:20,borderRadius:14}}>
      <fieldset><legend>Where is this recommender?</legend>
        <label><input type="radio" name="source" checked={source==="inner-circle"} onChange={()=>setSource("inner-circle")}/> Someone in my Inner Circle</label>{" "}
        <label><input type="radio" name="source" checked={source==="outside"} onChange={()=>setSource("outside")}/> Outside Playbook</label>
      </fieldset>
      <p style={{fontSize:13,color:"#5d6270"}}>{source==="inner-circle"?"Enter the verified email of your connected supporter. Relationship selection and verification are being developed; this form does not grant access.":"Outside recommenders can receive a request email, but secure submission requires a separately verified recipient workflow before launch."}</p>
      <label>Recommender name<input required value={name} maxLength={120} onChange={e=>setName(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>
      <label>Recommender email<input required type="email" value={email} maxLength={254} onChange={e=>setEmail(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>
      <label>Relationship / role<select value={role} onChange={e=>setRole(e.target.value as typeof role)} style={{display:"block",width:"100%",padding:10}}>{roles.map(r=><option key={r} value={r}>{r}</option>)}</select></label>
      <label>Opportunity / program<input required value={opportunity} maxLength={180} onChange={e=>setOpportunity(e.target.value)} style={{display:"block",width:"100%",padding:10}}/></label>
      <button disabled={busy} type="submit" style={{background:"#171717",color:"white",padding:12,border:0,borderRadius:9}}>{busy?"Sending…":"Request recommendation"}</button>
      {notice && <p role="status">{notice}</p>}
    </form>
    <h2>My requests</h2>
    {rows.length===0?<p>No recommendation requests are available yet.</p>:<ul>{rows.map(r=><li key={r.id} style={{padding:"12px 0",borderBottom:"1px solid #ddd"}}><strong>{r.recommender_name}</strong> — {r.opportunity_name} <span style={{color:"#806221"}}>({r.status})</span></li>)}</ul>}
    <p style={{fontSize:13,color:"#666"}}>Letters and application attachments will become available after the secure recommendation Vault release is certified.</p>
  </main>;
}
