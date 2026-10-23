"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CanonicalRoleAuthorityGate } from "@/components/role-os/RoleAuthorityGate";

type Letter={vaultId:string;title:string;requestId:string;artifactId:string;confidentiality:"open"|"confidential";createdAt:string};
type Workspace={id:string;opportunity_name:string;status:string;recommendation_request_ids?:string[]};
function RecommendationsVault(){
  const [letters,setLetters]=useState<Letter[]>([]);
  const [workspaces,setWorkspaces]=useState<Workspace[]>([]);
  const [selected,setSelected]=useState<Record<string,string>>({});
  const [opened,setOpened]=useState<Record<string,string>>({});
  const [status,setStatus]=useState("Loading your private recommendation folder…");
  async function refresh(){
    const response=await fetch("/api/recommendations/vault",{cache:"no-store"});
    if(!response.ok){setStatus("We could not load recommendations. No files were shared.");return;}
    const data=await response.json();
    setLetters(data.letters??[]);setWorkspaces(data.workspaces??[]);setStatus("");
  }
  useEffect(()=>{
    void fetch("/api/recommendations/vault",{cache:"no-store"}).then(async response=>{
      if(!response.ok)return;
      const data=await response.json();
      setLetters(data.letters??[]);setWorkspaces(data.workspaces??[]);setStatus("");
    }).catch(()=>{});
  },[]);
  async function open(letter:Letter){
    const response=await fetch("/api/recommendations/vault/"+encodeURIComponent(letter.artifactId),{cache:"no-store"});
    if(!response.ok){setStatus("Letter content is confidential or unavailable.");return;}
    const data=await response.json();
    setOpened(prev=>({...prev,[letter.artifactId]:data.letter.letter_text}));
  }
  async function attach(letter:Letter){
    const workspaceId=selected[letter.vaultId];
    if(!workspaceId){setStatus("Choose an application first.");return;}
    const response=await fetch("/api/recommendations/vault",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({workspaceId,requestId:letter.requestId})});
    if(!response.ok){setStatus("This recommendation could not be attached to that application.");return;}
    setStatus("Recommendation reference attached to the application draft. This does not send it externally.");
    await refresh();
  }
  return <main style={{maxWidth:920,margin:"auto",padding:24,fontFamily:"system-ui"}}>
    <nav><Link href="/dashboard">Scholar Dashboard</Link> · <Link href="/recommenders">Request a letter</Link></nav>
    <p style={{color:"#99712b",fontSize:12,letterSpacing:2}}>PLAYBOOK SERIES · SCHOLAR VAULT™</p>
    <h1>Applications & Career / Recommendations</h1>
    <p>Finished recommendation letters are stored privately. A confidential letter can be attached by reference, but its content is never shown to the Scholar.</p>
    {status&&<p role="status">{status}</p>}
    {letters.length===0&&!status&&<p>No submitted recommendation letters yet. <Link href="/recommenders">Request your first letter.</Link></p>}
    <div style={{display:"grid",gap:16}}>
      {letters.map(letter=><article key={letter.vaultId} style={{border:"1px solid #ddd",borderRadius:14,padding:18}}>
        <h2 style={{fontSize:20}}>{letter.title}</h2>
        <p>{letter.confidentiality==="confidential"?"Confidential — content hidden, submission tracked":"Open letter — available to read in your account"}</p>
        {letter.confidentiality==="open"&&<button type="button" onClick={()=>void open(letter)}>View open letter</button>}
        {opened[letter.artifactId]&&<section aria-label="Open recommendation content" style={{whiteSpace:"pre-wrap",background:"#f9fafb",padding:16,marginTop:12}}>{opened[letter.artifactId]}</section>}
        <div style={{marginTop:12,display:"grid",gap:8}}>
          <label>Attach to application draft
            <select value={selected[letter.vaultId]??""} onChange={e=>setSelected(prev=>({...prev,[letter.vaultId]:e.target.value}))} style={{display:"block",width:"100%",padding:10}}>
              <option value="">Choose an application</option>
              {workspaces.map(w=><option value={w.id} key={w.id}>{w.opportunity_name} ({w.status})</option>)}
            </select>
          </label>
          <button type="button" disabled={!selected[letter.vaultId]} onClick={()=>void attach(letter)} style={{padding:12,background:"#171717",color:"white",border:0,borderRadius:9}}>Attach recommendation reference</button>
          <small>Application attachment does not email or publish any letter. Institutional direct-submit requirements remain separate.</small>
        </div>
      </article>)}
    </div>
  </main>;
}
export default function ScholarRecommendationsPage(){
  return <CanonicalRoleAuthorityGate role="scholar"><RecommendationsVault/></CanonicalRoleAuthorityGate>;
}
