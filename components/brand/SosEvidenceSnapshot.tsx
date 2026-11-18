"use client";
import { useCallback, useEffect, useState } from "react";

type Snapshot = { id:string; source_url:string; captured_at:string; source_label:string; reviewer_id:string };
const SEARCH_URL = "https://bizfileonline.sos.ca.gov/search/business";
export default function SosEvidenceSnapshot({requestId,organizationName,onEvidenceChange}:{requestId:string;organizationName:string;onEvidenceChange?:(hasEvidence:boolean)=>void}) {
 const [snapshots,setSnapshots]=useState<Snapshot[]>([]);
 const [sourceUrl,setSourceUrl]=useState(SEARCH_URL);
 const [busy,setBusy]=useState(false);
 const [notice,setNotice]=useState("");
 const load=useCallback(async ()=>{
  const r=await fetch(`/api/admin/verification/registry/snapshot?requestId=${encodeURIComponent(requestId)}`,{cache:"no-store"});
  const body=await r.json();
  if(!r.ok)throw new Error(body.error??"Evidence history unavailable.");
  setSnapshots(body.snapshots??[]);
  onEvidenceChange?.((body.snapshots??[]).length>0);
 },[requestId,onEvidenceChange]);
 useEffect(()=>{const timer=window.setTimeout(()=>{void load().catch(()=>{});},0);return()=>window.clearTimeout(timer);},[load]);
 async function upload(file:File) {
  setBusy(true);setNotice("");
  try {
   const data=new FormData();
   data.set("requestId",requestId);data.set("sourceUrl",sourceUrl);data.set("file",file);
   const r=await fetch("/api/admin/verification/registry/snapshot",{method:"POST",body:data});
   const body=await r.json();
   if(!r.ok)throw new Error(body.error??"Evidence capture failed.");
   await load();
   setNotice("Private screenshot and reviewer audit record saved. This does not approve the organization.");
  } catch(e){setNotice(e instanceof Error?e.message:"Screenshot could not be saved.");}
  finally{setBusy(false);}
 }
 async function captureTab() {
  setNotice("");
  if(!navigator.mediaDevices?.getDisplayMedia){setNotice("This browser cannot capture another tab. Use Attach screenshot instead.");return;}
  let stream:MediaStream|undefined;
  try {
   // This runs directly from the reviewer click; browsers require the reviewer
   // to choose the official SOS tab/window and explicitly grant permission.
   stream=await navigator.mediaDevices.getDisplayMedia({video:true,audio:false});
   const video=document.createElement("video");
   video.srcObject=stream; video.muted=true;
   await video.play();
   if(!video.videoWidth||!video.videoHeight)throw new Error("The selected tab did not provide a video frame.");
   const canvas=document.createElement("canvas");canvas.width=video.videoWidth;canvas.height=video.videoHeight;
   const context=canvas.getContext("2d");if(!context)throw new Error("Screenshot canvas is unavailable.");
   context.drawImage(video,0,0);
   const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",0.82));
   if(!blob)throw new Error("Could not create the screenshot.");
   await upload(new File([blob],`sos-review-${Date.now()}.jpg`,{type:"image/jpeg"}));
  }catch(e){setNotice(e instanceof Error?e.message:"Capture cancelled or unavailable.");}
  finally{stream?.getTracks().forEach(track=>track.stop());}
 }
 return <section aria-label="SOS screenshot evidence" style={{padding:18,border:"1px solid #94A3B8",borderRadius:12,background:"#FFF",color:"#0F172A",display:"grid",gap:12}}>
  <h4 style={{margin:0,fontSize:20,color:"#0F172A"}}>Save the official registry evidence</h4>
  <p style={{margin:0,color:"#334155",lineHeight:1.6}}>Open the California SOS business-search result first. A screenshot provides a retained record of the screen you reviewed, but does not independently authenticate its contents or authorize approval. Select only the SOS tab, not a screen containing private information.</p>
  {organizationName && <button type="button" onClick={()=>{void navigator.clipboard.writeText(organizationName).then(()=>setNotice("Business name copied for SOS search.")).catch(()=>setNotice("Copy not supported; select the displayed name manually."));}} style={{...buttonStyle,background:"#E2E8F0",color:"#0F172A",justifySelf:"start"}}>Copy legal name: {organizationName}</button>}
  <a href={SEARCH_URL} target="_blank" rel="noopener noreferrer" style={{color:"#174EA6",textDecoration:"underline",fontWeight:800}}>Open California SOS business search</a>
  <label style={{display:"grid",gap:6,fontWeight:700,color:"#0F172A"}}>Official SOS source or record link
   <input value={sourceUrl} type="url" onChange={e=>setSourceUrl(e.target.value)} style={{width:"100%",padding:12,color:"#0F172A",background:"#FFF",border:"1px solid #64748B",borderRadius:8}} />
  </label>
  <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
   <button type="button" disabled={busy} onClick={()=>void captureTab()} style={buttonStyle}>{busy?"Saving…":"Capture selected SOS tab"}</button>
   <label style={{display:"inline-grid",gap:5,color:"#0F172A",fontWeight:750}}>Attach screenshot (mobile fallback)
    <input type="file" accept="image/png,image/jpeg" disabled={busy} onChange={e=>{const f=e.currentTarget.files?.[0];e.currentTarget.value="";if(f)void upload(f);}} />
   </label>
  </div>
  <p style={{margin:0,fontSize:14,color:"#334155"}}>Desktop browsers ask which tab to share. Phones and browsers that block tab capture can upload a screenshot. Screenshots must be under 4 MB. Each saved image is private and attributed to the signed-in reviewer, with time and SHA-256 integrity digest.</p>
  {notice&&<p role="status" style={{margin:0,padding:12,background:"#EFF6FF",color:"#1E3A8A",borderRadius:8}}>{notice}</p>}
  <div><strong>Stored evidence snapshots: {snapshots.length}</strong>
   {snapshots.length>0&&<ul>{snapshots.map(snapshot=><li key={snapshot.id} style={{marginTop:8}}>
    <a href={`/api/admin/verification/registry/snapshot/file?requestId=${encodeURIComponent(requestId)}&id=${encodeURIComponent(snapshot.id)}`} target="_blank" rel="noopener noreferrer" style={{color:"#174EA6",textDecoration:"underline"}}>View saved screenshot — {new Date(snapshot.captured_at).toLocaleString()}</a><span style={{display:"block",color:"#475569",fontSize:13}}>Reviewer audit ID: {snapshot.reviewer_id}</span>
   </li>)}</ul>}
  </div>
 </section>;
}
const buttonStyle:React.CSSProperties={padding:"12px 16px",border:0,borderRadius:8,background:"#17365B",color:"#FFF",fontWeight:800};
