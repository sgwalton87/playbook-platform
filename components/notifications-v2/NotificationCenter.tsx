"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage } from "@/components/ui";
type Notification = { id: string; type: string; title: string; body: string; href: string; priority: string; read: boolean; created_at: string };
type Preference = { notification_type: string; mode: string }; type Failure = { id: string; event_type: string; attempt_count: number; last_error: string };
type Filter = "all" | "unread" | "messages" | "actions" | "intelligence";
type NotificationResponse = {notifications?:Notification[];preferences?:Preference[];failures?:Failure[];error?:string};
async function fetchNotifications():Promise<NotificationResponse>{const response=await fetch("/api/notifications",{cache:"no-store"});
  const result=await response.json() as NotificationResponse;if(!response.ok)throw new Error(result.error??"Notifications could not be loaded.");return result;}
export default function NotificationCenter() {
  const [notifications,setNotifications]=useState<Notification[]>([]); const [preferences,setPreferences]=useState<Preference[]>([]);
  const [failures,setFailures]=useState<Failure[]>([]); const [filter,setFilter]=useState<Filter>("all");
  const [loading,setLoading]=useState(true); const [status,setStatus]=useState("Loading notifications…"); const [error,setError]=useState("");
  useEffect(()=>{let active=true;void fetchNotifications().then(result=>{if(!active)return;setNotifications(result.notifications??[]);
    setPreferences(result.preferences??[]);setFailures(result.failures??[]);setStatus("Notification state is current.");})
    .catch(cause=>{if(active){setError(cause instanceof Error?cause.message:"Notifications could not be loaded.");setStatus("");}})
    .finally(()=>{if(active)setLoading(false)});return()=>{active=false}},[]);
  async function reload(){setLoading(true);setError("");try{const result=await fetchNotifications();setNotifications(result.notifications??[]);
    setPreferences(result.preferences??[]);setFailures(result.failures??[]);setStatus("Notification state is current.");}
    catch(cause){setError(cause instanceof Error?cause.message:"Notifications could not be loaded.");setStatus("");}finally{setLoading(false)}}
  const visible=useMemo(()=>notifications.filter(item=>filter==="all"||(filter==="unread"?!item.read:
    filter==="messages"?["message","mail_reply"].includes(item.type):filter==="actions"?["shared_action","invitation"].includes(item.type):
    ["compass_alert","network_blocker","recommendation"].includes(item.type))),[notifications,filter]);
  async function act(payload:Record<string,unknown>){setError("");const response=await fetch("/api/notifications",{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});
    const result=await response.json() as {error?:string};if(!response.ok){setError(result.error??"Notification action failed.");return;}await reload();}
  return <PlaybookPage><PlaybookHero eyebrow="Reliable Notifications" title="What needs your attention?"
    subtitle="Idempotent domain events, preferences, acknowledgement, bounded retry, escalation, and failure evidence in one governed center." />
    <PlaybookMetrics><PlaybookMetric label="Unread" value={String(notifications.filter(item=>!item.read).length)}/>
      <PlaybookMetric label="Delivery failures" value={String(failures.length)}/></PlaybookMetrics>
    <p role="status" aria-live="polite" style={{color:"#0F172A"}}>{loading?"Loading…":status}</p>{error&&<p role="alert">{error} <button onClick={()=>void reload()}>Retry</button></p>}
    <section aria-label="Notification preferences" style={{color:"#0F172A"}}><h2 style={{color:"#0F172A"}}>Delivery preferences</h2>{["message","mail_reply","shared_action","network_blocker"].map(type=><label key={type} style={{display:"block",color:"#0F172A"}}>{type}
      <select value={preferences.find(item=>item.notification_type===type)?.mode??"immediate"} onChange={event=>void act({action:"PREFERENCE",notificationType:type,mode:event.target.value})}>
        <option value="immediate">Immediate</option><option value="daily_digest">Daily digest</option><option value="weekly_digest">Weekly digest</option><option value="muted">Muted</option></select></label>)}</section>
    <section style={{color:"#0F172A"}}><div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{(["all","unread","messages","actions","intelligence"] as Filter[]).map(value=><button key={value}
      aria-pressed={filter===value} onClick={()=>setFilter(value)}>{value}</button>)}<button onClick={()=>void act({action:"READ_ALL"})}>Mark all read</button></div>
      {!loading&&visible.length===0&&<p style={{color:"#0F172A"}}>Nothing needs attention in this view.</p>}{visible.map(item=><article key={item.id} data-read={item.read} style={{padding:16,borderBottom:"1px solid #E2E8F0",color:"#0F172A"}}>
        <span style={{display:"inline-flex",background:"#FFF7ED",border:"1px solid #FDBA74",color:"#7C2D12",borderRadius:999,padding:"6px 9px",fontSize:11,fontWeight:900,textTransform:"uppercase"}}>{item.type}</span>
        <h2 style={{color:"#0F172A"}}>{item.title}</h2><p style={{color:"#0F172A"}}>{item.body}</p><Link href={item.href} style={{color:"#1D4ED8"}}>Open</Link>{!item.read&&<button onClick={()=>void act({action:"READ",notificationId:item.id})}>Mark read</button>}
        <small style={{color:"#334155"}}>{item.priority} priority · {new Date(item.created_at).toLocaleString()}</small></article>)}</section>
    {failures.length>0&&<section aria-label="Delivery failures"><h2>Delivery recovery</h2>{failures.map(item=><article key={item.id}><p>{item.event_type}: {item.last_error}</p>
      <button onClick={()=>void act({action:"RETRY",outboxId:item.id})}>Retry delivery</button></article>)}</section>}
  </PlaybookPage>;
}
