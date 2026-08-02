import Link from "next/link";
import { AIProcessingConsentControl } from "@/components/settings/AIProcessingConsentControl";
import { AnalyticsConsentControl } from "@/components/settings/AnalyticsConsentControl";
import { buildNotificationPreferenceSummary } from "@/lib/scholar-experience";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const controls = [
  { title: "Privacy and visibility", body: "Review who may see each part of your Scholar Record. Visibility never grants edit authority." },
  { title: "Support consent", body: "Supporter access must identify a role, scope, purpose, and expiration. You remain the consent owner." },
  { title: "Security", body: "Authenticated server boundaries and Row Level Security protect changes to your record and relationships." },
  { title: "Notifications", body: "Choose which authorized changes should ask for your attention and where they may be delivered." },
];

type ConsentStatus = "granted" | "denied" | "withdrawn";

function consentStatus(value: unknown): ConsentStatus {
  return value === "granted" || value === "withdrawn" ? value : "denied";
}

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();
  const { data: auth } = await supabase.auth.getUser();
  let analyticsStatus: ConsentStatus = "denied";
  let aiStatus: ConsentStatus = "denied";

  if (auth.user) {
    const [{ data: analytics }, { data: ai }] = await Promise.all([
      supabase.from("analytics_consents").select("status").eq("user_id", auth.user.id).maybeSingle(),
      supabase.from("ai_processing_consents").select("status").eq("user_id", auth.user.id).maybeSingle(),
    ]);
    analyticsStatus = consentStatus(analytics?.status);
    aiStatus = consentStatus(ai?.status);
  }

  const notificationPreferences = buildNotificationPreferenceSummary({
    message: "daily_digest",
    recommendation: "muted",
  });

  return (
    <main style={page}>
      <header style={header}>
        <p style={eyebrow}>Settings</p>
        <h1 style={title}>Your privacy. Your consent. Your control.</h1>
        <p style={lead}>
          Settings preserve explicit Scholar-owned preferences and consent boundaries.
          No consent or permission is inferred.
        </p>
      </header>

      {auth.user ? (
        <>
          <AnalyticsConsentControl initialStatus={analyticsStatus} />
          <AIProcessingConsentControl initialStatus={aiStatus} />
        </>
      ) : (
        <section style={panel} aria-labelledby="consent-sign-in">
          <h2 id="consent-sign-in">Sign in to manage consent</h2>
          <p style={copy}>
            Anonymous visitors are not enrolled in outcome analytics or optional AI
            processing.
          </p>
          <Link href="/login" style={button}>Sign in</Link>
        </section>
      )}

      <section style={panel} aria-labelledby="notification-preferences">
        <h2 id="notification-preferences">Notification delivery</h2>
        <p style={copy}>
          Current governed delivery defaults are shown here. Delivery choices do not
          change the authorization required to view an event.
        </p>
        <div style={preferenceGrid}>
          {notificationPreferences.map((preference) => (
            <article key={preference.key} style={preferenceCard}>
              <strong style={preferenceTitle}>{preference.label}</strong>
              <span style={preferenceMode}>{preference.mode}</span>
            </article>
          ))}
        </div>
      </section>

      <section style={grid} aria-label="Settings categories">
        {controls.map((control) => (
          <article key={control.title} style={card}>
            <h2 style={cardTitle}>{control.title}</h2>
            <p style={copy}>{control.body}</p>
          </article>
        ))}
      </section>

      <aside style={boundary}>
        <strong>Permission boundary:</strong> hidden navigation and client-side
        selections cannot grant access. Changes require an authenticated server
        boundary and explicit confirmation.
      </aside>
      <div style={footer}>
        <Link href="/profile" style={button}>Review Scholar Record</Link>
        <Link href="/connections" style={secondary}>Review connections</Link>
        <Link href="/notifications" style={secondary}>Review notifications</Link>
      </div>
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", padding: "clamp(22px,5vw,60px)", color: "#0F172A", fontFamily: "system-ui,sans-serif" };
const header: React.CSSProperties = { maxWidth: 960, margin: "0 auto 26px" };
const eyebrow: React.CSSProperties = { color: "#C2410C", fontWeight: 800, textTransform: "uppercase", letterSpacing: ".15em", fontSize: 11 };
const title: React.CSSProperties = { fontSize: "clamp(38px,6vw,64px)", lineHeight: 1.04, margin: "12px 0" };
const lead: React.CSSProperties = { fontSize: 17, lineHeight: 1.65, color: "#475569" };
const panel: React.CSSProperties = { maxWidth: 960, margin: "18px auto", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 20, padding: 24 };
const preferenceGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 14 };
const preferenceCard: React.CSSProperties = { display: "grid", gap: 6, padding: 14, borderRadius: 14, border: "1px solid #E2E8F0", background: "#F8FAFC" };
const preferenceTitle: React.CSSProperties = { fontSize: 13, color: "#0F172A", textTransform: "capitalize" };
const preferenceMode: React.CSSProperties = { fontSize: 12, color: "#C2410C", fontWeight: 700, textTransform: "capitalize" };
const grid: React.CSSProperties = { maxWidth: 960, margin: "18px auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 14 };
const card: React.CSSProperties = { background: "#fff", border: "1px solid #E2E8F0", borderRadius: 18, padding: 22 };
const cardTitle: React.CSSProperties = { fontSize: 19, marginTop: 0 };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const boundary: React.CSSProperties = { maxWidth: 960, margin: "18px auto", background: "#EFF6FF", borderLeft: "4px solid #2563EB", padding: 18, lineHeight: 1.6 };
const footer: React.CSSProperties = { maxWidth: 960, margin: "20px auto", display: "flex", gap: 10, flexWrap: "wrap" };
const button: React.CSSProperties = { display: "inline-block", background: "#F97316", color: "#fff", textDecoration: "none", padding: "11px 14px", borderRadius: 10, fontWeight: 800 };
const secondary: React.CSSProperties = { border: "1px solid #CBD5E1", color: "#0F172A", textDecoration: "none", padding: "11px 14px", borderRadius: 10, fontWeight: 800 };
