"use client";

import { use, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";

type Request = {id:string;scholarName:string;opportunityName:string;recommenderName:string;status:string};
export default function RecommenderLetterPage({params}:{params:Promise<{requestId:string}>}) {
  const {requestId}=use(params);
  const [item,setItem]=useState<Request|null>(null);
  const [letter,setLetter]=useState("");
  const [confidentiality,setConfidentiality]=useState<"open"|"confidential">("open");
  const [state,setState]=useState<"loading"|"ready"|"error"|"submitted">("loading");
  const [message,setMessage]=useState("");
  useEffect(()=>{
    let active=true;
    void (async()=>{
      const res=await fetch("/api/recommenders/"+encodeURIComponent(requestId)+"/letter",{cache:"no-store"});
      const data=await res.json();
      if(!active)return;
      if(!res.ok){setState("error");setMessage(data.error??"Unable to open request.");return;}
      setItem(data.request);setState(data.request.status==="submitted"?"submitted":"ready");
    })();
    return ()=>{active=false};
  },[requestId]);
  async function submit(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const confirmed=window.confirm("Submit this letter as your independent recommendation? Submitted letters cannot be edited here.");
    if(!confirmed)return;
    setState("loading");
    try{
      const response=await fetch("/api/recommenders/"+encodeURIComponent(requestId)+"/letter",{
        method:"POST",headers:{"content-type":"application/json"},
        body:JSON.stringify({letter,confidentiality})
      });
      const result=await response.json();
      if(!response.ok)throw new Error(result.error??"Submission unsuccessful");
      setLetter("");setState("submitted");setMessage("Your letter was submitted to the Scholar's private recommendation Vault.");
    }catch(error){setState("ready");setMessage(error instanceof Error?error.message:"Submission failed");}
  }
  return <main style={{maxWidth:760,margin:"auto",padding:24,fontFamily:"system-ui"}}>
    <p style={{fontSize:12,letterSpacing:2,color:"#98763c"}}>PLAYBOOK SERIES · RECOMMENDATION LETTER</p>
    <h1>Write a recommendation</h1>
    <p>To protect Scholars, sign in with the verified email address that received the request. This invitation does not disclose the Scholar's private records.</p>
    {state==="loading"&&<p role="status">Checking your invitation…</p>}
    {state==="error"&&<p role="alert">{message} <Link href="/login">Sign in</Link></p>}
    {item&&<section style={{border:"1px solid #ccc",borderRadius:12,padding:18}}>
      <p><strong>Scholar:</strong> {item.scholarName}</p>
      <p><strong>Opportunity:</strong> {item.opportunityName}</p>
      {state==="submitted"?<p role="status">Recommendation already submitted. {message}</p>:
      <form onSubmit={submit} style={{display:"grid",gap:14}}>
        <label>Your independent recommendation
          <textarea required minLength={100} maxLength={20000} rows={12} value={letter} onChange={e=>setLetter(e.target.value)}
            style={{display:"block",width:"100%",padding:10}} placeholder="Describe your firsthand experience with the Scholar. Provide specific, truthful examples."/>
        </label>
        <p style={{fontSize:12}}>100–20,000 characters. Your letter is not generated or endorsed by Playbook.</p>
        <fieldset><legend>Confidentiality</legend>
          <label><input type="radio" checked={confidentiality==="open"} onChange={()=>setConfidentiality("open")}/> Open: Scholar can view and download</label>
          <div><label><input type="radio" checked={confidentiality==="confidential"} onChange={()=>setConfidentiality("confidential")}/> Confidential: Scholar sees submission status only, not the content</label></div>
        </fieldset>
        <button disabled={state!=="ready"||letter.trim().length<100} type="submit"
          style={{padding:14,background:"#161616",color:"#fff",border:0,borderRadius:8}}>Submit recommendation to private Vault</button>
        {message&&<p role="status">{message}</p>}
      </form>}
    </section>}
  </main>;
}
