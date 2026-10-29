"use client";
import { useState } from "react";
type Document={name:string;url:string};
export default function CommunityEvidenceReviewPanel({requestId,onReviewed}:{requestId:string;onReviewed:(ready:boolean)=>void}){
 const [docs,setDocs]=useState<Document[]|null>(null);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState("");
 async function load(){
  setLoading(true);setError("");setDocs(null);onReviewed(false);
  try{
   const response=await fetch(`/api/admin/verification/community-evidence?requestId=${encodeURIComponent(requestId)}`,{cache:"no-store"});
   const data=await response.json() as {documents?:Document[];error?:string};
   if(!response.ok)throw Error(data.error||"Evidence unavailable");
   setDocs(data.documents||[]);
  }catch(e){setError(e instanceof Error?e.message:"Could not inspect documents");}
  finally{setLoading(false);}
 }
 return <section aria-label="Community Partner submitted evidence" style={{padding:16,marginTop:16,border:"1px solid #CBD5E1",borderRadius:12,background:"#F8FAFC",color:"#15243A"}}>
  <strong>Community Partner organization documents</strong>
  <p>Private documents are accessible only after reviewer authorization. Inspect organization identity before a human approval.</p>
  <button type="button" onClick={()=>void load()} disabled={loading}>{loading?"Opening…":"Open submitted documents"}</button>
  {error&&<p role="alert">{error}</p>}
  {docs&&(docs.length?<><ul>{docs.map(file=><li key={file.name}><a href={file.url} target="_blank" rel="noopener noreferrer">Open verification document (authenticated review)</a></li>)}</ul>
   <label><input type="checkbox" onChange={e=>onReviewed(e.target.checked)}/> I reviewed the supporting Community Partner documents and recorded the identity comparison in my decision notes.</label>
   </>:<p role="status">No uploaded evidence found. Approval must remain unavailable; request documents from the applicant.</p>)}
 </section>;
}
