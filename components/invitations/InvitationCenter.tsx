"use client";

import { useEffect, useState } from "react";
import { PlaybookSurfaceState } from "@/components/ui";
import type { RelationshipKind } from "@/lib/permissions";

type Invitation = { id:string; invitee_name:string; invitee_email:string; relationship:string; status:string; permissions:string[]; destination:string; created_at:string };
const relationships: { label: string; value: RelationshipKind }[] = [
  { label: "Family / Guardian", value: "parent_guardian" }, { label: "Educator", value: "educator" }, { label: "Mentor", value: "mentor" },
  { label: "District Admin", value: "district_admin" }, { label: "University Partner", value: "university_partner" }, { label: "Employer Partner", value: "employer_partner" },
];
export default function InvitationCenter(){
 const [inviteeName,setInviteeName]=useState(""); const [inviteeEmail,setInviteeEmail]=useState(""); const [relationship,setRelationship]=useState<RelationshipKind>("mentor");
 const [invitations,setInvitations]=useState<Invitation[]>([]); const [loading,setLoading]=useState(true); const [sending,setSending]=useState(false); const [error,setError]=useState("");
 async function load(){const res=await fetch("/api/invitations/send",{cache:"no-store"});const json=await res.json();setLoading(false);if(!res.ok){setError(json.error||"Invitations are unavailable.");return;}setInvitations(json.invitations||[]);}
 useEffect(()=>{void fetch("/api/invitations/send",{cache:"no-store"}).then(async response=>({response,json:await response.json()})).then(({response,json})=>{setLoading(false);if(!response.ok){setError(json.error||"Invitations are unavailable.");return;}setInvitations(json.invitations||[]);});},[]);
 async function sendInvite(){setError("");setSending(true);const res=await fetch("/api/invitations/send",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({inviteeName,inviteeEmail,relationship})});const json=await res.json();setSending(false);if(!res.ok){setError(json.error||"Invitation could not be sent.");return;}setInviteeName("");setInviteeEmail("");await load();}
 return <main style={page}><section style={hero}><p style={eyebrow}>Role Invitations</p><h1 style={title}>Invite the Scholar support network.</h1><p style={sub}>Every invitation carries a governed role, permission set, destination, and persisted lifecycle state.</p></section><section style={grid}>
 <article style={card}><p style={eyebrow}>Create Invite</p><h2 style={cardTitle}>Add support person</h2><label style={label} htmlFor="invite-name">Name</label><input id="invite-name" value={inviteeName} onChange={e=>setInviteeName(e.target.value)} style={input}/><label style={label} htmlFor="invite-email">Email</label><input id="invite-email" type="email" value={inviteeEmail} onChange={e=>setInviteeEmail(e.target.value)} style={input}/><label style={label} htmlFor="invite-relationship">Relationship</label><select id="invite-relationship" value={relationship} onChange={e=>setRelationship(e.target.value as RelationshipKind)} style={input}>{relationships.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select><button onClick={sendInvite} disabled={sending||!inviteeName.trim()||!inviteeEmail.includes("@")} style={button}>{sending?"Sending…":"Send invite"}</button>{error&&<p role="alert" style={body}>{error}</p>}</article>
 <article style={card}><p style={eyebrow}>Support Network Invites</p><h2 style={cardTitle}>Persisted invitation lifecycle</h2>{loading?<PlaybookSurfaceState state="loading" description="Loading governed invitation records."/>:invitations.length===0?<PlaybookSurfaceState state="empty" description="No invitations have been sent or received."/>:<div style={{display:"grid",gap:12}}>{invitations.map(invite=><div key={invite.id} style={inviteCard}><div style={{display:"flex",justifyContent:"space-between",gap:12}}><strong>{invite.invitee_name}</strong><span style={statusBadge(invite.status)}>{invite.status}</span></div><p style={body}>{invite.invitee_email}</p><p style={body}>{invite.relationship.replaceAll("_"," ")} → {invite.destination}</p><div style={chips}>{(invite.permissions||[]).slice(0,4).map(permission=><span key={permission} style={chip}>{permission.replaceAll("_"," ")}</span>)}</div></div>)}</div>}</article></section></main>;
}

function statusBadge(status: string): React.CSSProperties {
  const colors: Record<string, string> = {
    pending: "#F97316",
    accepted: "#10B981",
    declined: "#64748B",
  };

  return {
    background: colors[status] || "#64748B",
    color: "#fff",
    borderRadius: 999,
    padding: "5px 8px",
    fontSize: 11,
    fontWeight: 950,
    textTransform: "uppercase",
  };
}

const page: React.CSSProperties = { minHeight:"100vh", background:"#F8F7F4", padding:32, fontFamily:"system-ui, sans-serif" };
const hero: React.CSSProperties = { maxWidth:1120, margin:"0 auto 18px", background:"#0F172A", color:"#fff", borderRadius:30, padding:34 };
const eyebrow: React.CSSProperties = { fontSize:11, letterSpacing:".14em", textTransform:"uppercase", fontWeight:950, color:"#F97316", margin:0 };
const title: React.CSSProperties = { fontSize:54, lineHeight:1, margin:"12px 0" };
const sub: React.CSSProperties = { color:"#CBD5E1", fontSize:17, lineHeight:1.6, maxWidth:820 };
const grid: React.CSSProperties = { maxWidth:1120, margin:"0 auto", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(340px,1fr))", gap:16 };
const card: React.CSSProperties = { background:"#fff", border:"1px solid #E2E8F0", borderRadius:24, padding:24, boxShadow:"0 16px 40px rgba(15,23,42,.06)" };
const cardTitle: React.CSSProperties = { color:"#0F172A", fontSize:26, margin:"8px 0 16px" };
const label: React.CSSProperties = { display:"block", color:"#0F172A", fontWeight:850, fontSize:13, margin:"12px 0 6px" };
const input: React.CSSProperties = { width:"100%", boxSizing:"border-box", border:"1px solid #E2E8F0", borderRadius:14, padding:12, fontSize:14 };
const button: React.CSSProperties = { marginTop:16, background:"#F97316", color:"#fff", border:"none", borderRadius:999, padding:"11px 14px", fontWeight:950, cursor:"pointer" };
const inviteCard: React.CSSProperties = { border:"1px solid #E2E8F0", borderRadius:18, padding:16 };
const body: React.CSSProperties = { color:"#64748B", fontSize:13, lineHeight:1.5, margin:"6px 0" };
const chips: React.CSSProperties = { display:"flex", flexWrap:"wrap", gap:8, marginTop:10 };
const chip: React.CSSProperties = { background:"#FFF7ED", border:"1px solid #FED7AA", color:"#9A3412", borderRadius:999, padding:"6px 9px", fontSize:11, fontWeight:800 };
