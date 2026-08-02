import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  href: string;
  priority: string;
  read: boolean;
  created_at: string;
};

export default async function NotificationsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth.user) redirect("/login");

  const { data, error } = await supabase
    .from("notifications")
    .select("id,type,title,body,href,priority,read,created_at")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });
  const notifications = (error ? [] : data ?? []) as Notification[];
  const unreadCount = notifications.filter((notification) => !notification.read).length;

  return (
    <main style={page}>
      <header style={header}>
        <p style={eyebrow}>Notifications</p>
        <h1 style={title}>Authorized changes that need your attention.</h1>
        <p style={lead}>
          Verification, intervention, opportunity, and milestone events link directly
          to their governed Playbook surface. A notification is a prompt to review
          context, not proof that an outcome occurred.
        </p>
      </header>

      <section style={panel} aria-labelledby="notification-state">
        <div style={sectionHead}>
          <h2 id="notification-state">Inbox</h2>
          {!error && (
            <span style={badge}>
              {unreadCount} unread {unreadCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {error ? (
          <div role="alert" style={errorState}>
            <strong>Notifications are temporarily unavailable.</strong>
            <span>No events have been inferred or substituted. Refresh to try again.</span>
          </div>
        ) : notifications.length === 0 ? (
          <div role="status" style={emptyState}>
            <strong>No authorized notifications are available.</strong>
            <span>The authorized source returned no events.</span>
          </div>
        ) : (
          <div aria-label="Notification inbox" style={notificationGrid}>
            {notifications.map((notification) => (
              <article key={notification.id} style={notificationCard}>
                <p style={notificationMeta}>
                  {notification.type} · {notification.priority}
                  {!notification.read && " · Unread"}
                </p>
                <h2 style={notificationTitle}>{notification.title}</h2>
                <p style={copy}>{notification.body}</p>
                <Link href={notification.href} style={textLink}>
                  Review context →
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section style={panel} aria-labelledby="notification-controls">
        <h2 id="notification-controls">Your controls</h2>
        <p style={copy}>
          Opening a notification reveals its authorized source and resulting state.
          Marking an item read changes attention state only; it does not approve the
          underlying action.
        </p>
        <Link href="/settings" style={textLink}>
          Manage notification and consent preferences →
        </Link>
      </section>

      <aside style={boundary}>
        <strong>Permission boundary:</strong> protected event details remain hidden
        when identity, permission, or consent is missing.
      </aside>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", padding: "clamp(22px,5vw,60px)", color: "#0F172A", fontFamily: "system-ui,sans-serif" };
const header: React.CSSProperties = { maxWidth: 900, margin: "0 auto 26px" };
const eyebrow: React.CSSProperties = { color: "#C2410C", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".15em", fontSize: 11 };
const title: React.CSSProperties = { fontSize: "clamp(38px,6vw,64px)", lineHeight: 1.04, margin: "12px 0" };
const lead: React.CSSProperties = { fontSize: 17, lineHeight: 1.65, color: "#475569" };
const panel: React.CSSProperties = { maxWidth: 900, margin: "18px auto", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24 };
const sectionHead: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" };
const badge: React.CSSProperties = { background: "#F1F5F9", color: "#475569", borderRadius: 99, padding: "6px 10px", fontSize: 12, fontWeight: 700 };
const emptyState: React.CSSProperties = { display: "grid", gap: 10, background: "#FFF7ED", padding: 20, borderRadius: 14, color: "#475569" };
const errorState: React.CSSProperties = { ...emptyState, background: "#FEF2F2", color: "#991B1B" };
const notificationGrid: React.CSSProperties = { display: "grid", gap: 12 };
const notificationCard: React.CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 14, padding: 18 };
const notificationMeta: React.CSSProperties = { color: "#C2410C", fontSize: 12, fontWeight: 800, textTransform: "capitalize" };
const notificationTitle: React.CSSProperties = { fontSize: 20, margin: "6px 0" };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const textLink: React.CSSProperties = { color: "#C2410C", fontWeight: 800, textDecoration: "none" };
const boundary: React.CSSProperties = { maxWidth: 900, margin: "18px auto", background: "#EFF6FF", borderLeft: "4px solid #2563EB", padding: 18, lineHeight: 1.6 };
