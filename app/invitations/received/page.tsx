"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
type Pending={id:string;token:string;scholarName:string;relationship:string;createdAt:string};
export default function ReceivedInvitationsPage(){
 const [items,setItems]=useState<Pending[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 useEffect(()=>{let active=true;void fetch("/api/invitations/received",{cache:"no-store"}).then(async response=>{
   const payload=await response.json();if(!response.ok)throw new Error(payload.error||"Unable to load invitations.");
   if(active)setItems(payload.invitations||[]);
 }).catch(e=>{if(active)setError(e instanceof Error?e.message:"Unable to load invitations.")}).finally(()=>{if(active)setLoading(false)});
 return()=>{active=false};},[]);
 return <main style={{minHeight:"100vh",padding:"24px 18px 64px",background:"#f4f7fc",color:"#10233d"}}>
  <section style={{maxWidth:720,margin:"auto",padding:24,borderRadius:20,background:"white"}}>
   <p style={{textTransform:"uppercase",color:"#c24c0a",fontWeight:800}}>Your Support Network</p>
   <h1>Invitations waiting for me</h1>
   <p>Invitations are matched to the exact email you use to sign in. You can accept without waiting for a delivery email. Role and relationship verification requirements still apply.</p>
   {loading&&<p>Checking invitations…</p>}{error&&<p role="alert">{error}</p>}
   {!loading&&!error&&items.length===0&&<p>No pending invitations for this signed-in email. Verify that you are signed into the invited account.</p>}
   {items.map(item=><article key={item.id} style={{padding:18,border:"1px solid #d8e1ec",borderRadius:14,marginTop:14}}>
    <h2>Invitation from {item.scholarName||"a scholar"}</h2>
    <p>Proposed relationship: {item.relationship.replaceAll("_"," ")}</p>
    <Link href={`/invite/${encodeURIComponent(item.token)}`} style={{display:"inline-block",background:"#eb5a10",color:"white",padding:"12px 20px",borderRadius:10,textDecoration:"none",fontWeight:800}}>Review and accept invitation →</Link>
   </article>)}
   <p style={{marginTop:24}}><Link href="/family-os">Back to Family dashboard</Link></p>
  </section>
 </main>
}
