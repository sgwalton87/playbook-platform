import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect("/login");
  const { data, error } = await supabase.from("notifications").select("id,type,title,body,href,priority,read,created_at").eq("user_id", auth.user.id).order("created_at", { ascending: false });
  const notifications = error ? [] : data || [];
  return <main style={{ maxWidth: 900, margin: "0 auto", padding: 36 }}><header><p>Notifications</p><h1>Authorized changes that need your attention.</h1><p>Verification, intervention, opportunity, and milestone events link directly to their governed Playbook surface.</p></header>
    {error ? <section role="alert"><h2>Notifications unavailable</h2><p>No events have been inferred or substituted.</p></section> : notifications.length === 0 ? <section role="status"><h2>No authorized notifications are available</h2><p>The authorized source returned no events.</p></section> : <section aria-label="Notification inbox" style={{ display: "grid", gap: 12 }}>{notifications.map((notification) => <article key={notification.id} style={{ border: "1px solid #CBD5E1", borderRadius: 14, padding: 18 }}><p>{notification.type} · {notification.priority}</p><h2>{notification.title}</h2><p>{notification.body}</p><Link href={notification.href}>Review context →</Link></article>)}</section>}
    <p><Link href="/settings">Manage notification preferences</Link></p></main>;
}
