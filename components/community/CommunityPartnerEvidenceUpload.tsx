"use client";
import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "community-verification-evidence";
type Entry = { name: string };
export default function CommunityPartnerEvidenceUpload({onEvidenceChange}:{onEvidenceChange:(available:boolean)=>void}) {
 const [files,setFiles]=useState<Entry[]>([]);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const refresh=useCallback(async()=>{
  const {data,error}=await supabase.rpc("get_own_community_verification_documents");
  if(error){setNotice("Could not verify saved documents. Submission remains disabled.");onEvidenceChange(false);return;}
  const list=(data ?? []) as Entry[];
  setFiles(list);onEvidenceChange(list.length>0);
 },[onEvidenceChange]);
 useEffect(()=>{const t=setTimeout(()=>void refresh(),0);return()=>clearTimeout(t)},[refresh]);
 async function upload(file?:File){
  if(!file)return;
  if(file.size>5*1024*1024 || !["application/pdf","image/png","image/jpeg","image/webp"].includes(file.type)){setNotice("Choose a PDF, PNG, JPEG or WebP file no larger than 5 MB.");return;}
  setBusy(true);setNotice("");
  try{
   const {data:{user}}=await supabase.auth.getUser();if(!user)throw Error("Sign in required.");
   const ext=file.type==="application/pdf"?"pdf":file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
   const res=await supabase.storage.from(BUCKET).upload(`${user.id}/organization-${crypto.randomUUID()}.${ext}`,file,{contentType:file.type,upsert:false});
   if(res.error)throw Error(res.error.message);
   setNotice("Document securely uploaded. Verification remains pending independent review.");await refresh();
  }catch(e){setNotice(e instanceof Error?e.message:"Upload could not finish.");}
  finally{setBusy(false);}
 }
 return <section aria-label="Community Partner business documents" style={{padding:20,background:"#FFFFFF",border:"1px solid #CBD5E1",borderRadius:18,color:"#172439",marginBlock:18}}>
  <h2 style={{marginTop:0}}>Upload organization verification</h2>
  <p>Upload at least one organization document before submitting: letterhead, registration evidence, or other official documentation. This is a private verification step—not an approval. Review is targeted within 72 hours.</p>
  <label style={{display:"block",fontWeight:700}}>Choose a supporting document
  <input type="file" aria-label="Upload Community Partner verification evidence" accept=".pdf,.png,.jpg,.jpeg,.webp" disabled={busy} style={{display:"block",maxWidth:"100%",marginTop:8}} onChange={e=>void upload(e.target.files?.[0])}/></label>
  {files.length>0?<p role="status">{files.length} document(s) saved privately.</p>:<p>No documents have been uploaded.</p>}
  {notice&&<p role="status">{notice}</p>}
  <small>Documents must be reviewed by an authorized Playbook verification reviewer. Review contact: onboarding@playbookseriesinc.org.</small>
 </section>;
}
