"use client";
import { useCallback, useEffect, useState } from "react";
type Message = { id: string; request_id: string; organization_name: string; outcome: string; reason_code: string; public_message: string; recipient_email: string; reviewer_id: string; created_at: string; delivery_status: string; accepted_at: string | null; last_error: string | null };
type Note = { id: string; note: string; actor_id: string; created_at: string };
export default function VerificationCommunicationLog() {
 const [messages,setMessages] = useState<Message[]>([]); const [notes,setNotes] = useState<Note[]>([]); const [selected,setSelected] = useState(""); const [note,setNote] = useState(""); const [notice,setNotice] = useState(""); const [busy,setBusy] = useState(false);
 const load = useCallback(async () => {
  const response = await fetch("/api/admin/verification/communications", { cache: "no-store" });
  const body = await response.json(); if (!response.ok) throw new Error(body.error || "Communication log unavailable.");
  setMessages(body.communications ?? []);
 },[]);
 useEffect(() => {
  const refresh = () => { void load().catch(cause => setNotice(cause.message)); };
  const timer = window.setTimeout(refresh,0); window.addEventListener("brand-verification-review-completed",refresh);
  return () => { window.clearTimeout(timer); window.removeEventListener("brand-verification-review-completed",refresh); };
 },[load]);
 async function openNotes(requestId: string) {
  setBusy(true); setNotice(""); setNotes([]); setSelected(requestId);
  try { const response=await fetch(`/api/admin/verification/brand-review?requestId=${requestId}`,{cache:"no-store"});const body=await response.json();if(!response.ok)throw new Error(body.error||"Notes unavailable.");setNotes(body.notes??[]); }
  catch(cause){setNotice(cause instanceof Error?cause.message:"Notes unavailable.");}finally{setBusy(false);}
 }
 async function saveNote() {
  setBusy(true);setNotice("");
  try {const response=await fetch("/api/admin/verification/brand-review",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"note",requestId:selected,note})});if(!response.ok)throw new Error("Note could not be saved.");setNote("");await openNotes(selected);setNotice("Private note saved. No email was sent.");}
  catch(cause){setNotice(cause instanceof Error?cause.message:"Note could not be saved.");}finally{setBusy(false);}
 }
 async function retry(id:string){setBusy(true);setNotice("");try{const response=await fetch("/api/admin/verification/communications",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({communicationId:id})});const body=await response.json();if(!response.ok)throw new Error(body.error||"Retry unavailable.");setNotice(body.message);await load();}catch(cause){setNotice(cause instanceof Error?cause.message:"Retry unavailable.");}finally{setBusy(false);}}
 return <section aria-labelledby="verification-comms-heading" style={{maxWidth:1180,margin:"24px auto",padding:20,border:"1px solid #CBD5E1",borderRadius:18,background:"white",color:"#15243A"}}>
  <h2 id="verification-comms-heading">Verification communications and private notes</h2><p>Latest 100 communications. “Sent” means accepted by the mail server; inbox delivery is not independently confirmed. Private notes are never included in email.</p>
  <button type="button" disabled={busy} onClick={()=>void load().catch(cause=>setNotice(cause.message))}>Refresh communications</button>
  {notice&&<p role="status">{notice}</p>}
  {messages.length===0?<p>No verification communications recorded yet.</p>:messages.map(message=><article key={message.id} style={{borderBottom:"1px solid #E2E8F0",padding:"16px 0",overflowWrap:"anywhere"}}>
   <h3>{message.organization_name} · {message.outcome.replaceAll("_"," ")}</h3><p>{new Date(message.created_at).toLocaleString()} · To: {message.recipient_email} · Admin: {message.reviewer_id}</p>
   <p style={{whiteSpace:"pre-wrap"}}>{message.public_message}</p><p>Status: {message.delivery_status.replaceAll("_"," ")}{message.accepted_at?` · Accepted ${new Date(message.accepted_at).toLocaleString()}`:""}</p>
   {message.last_error&&<p>{message.last_error}</p>}
   {["queued","failed"].includes(message.delivery_status)&&<button type="button" disabled={busy} onClick={()=>void retry(message.id)}>Send or retry queued email</button>}
   {["sending","delivery_unknown"].includes(message.delivery_status)&&<p>Verify the mailbox before resending. Automatic retry is blocked while acceptance is uncertain.</p>}
   <button type="button" disabled={busy} onClick={()=>void openNotes(message.request_id)}>Open private notes</button>
  </article>)}
  {selected&&<section aria-label="Private verification notes"><h3>Private notes for request {selected}</h3>{notes.map(n=><p key={n.id}>{new Date(n.created_at).toLocaleString()} · {n.actor_id}<br/>{n.note}</p>)}<label>Add private note<textarea style={{display:"block",width:"100%",boxSizing:"border-box"}} maxLength={4000} value={note} onChange={e=>setNote(e.target.value)}/></label><button type="button" disabled={busy||!note.trim()} onClick={()=>void saveNote()}>Save private note without email</button></section>}
 </section>;
}
