"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";
import { getRoleDashboard } from "@/lib/role-os/roleDashboards";
import { normalizePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";
import { supabase } from "@/lib/supabaseClient";
import { withTimeout } from "@/lib/async/withTimeout";

type Profile = {
  full_name?: string | null;
  username?: string | null;
  role?: string | null;
  profile_mode?: string | null;
  onboarding_completed?: boolean | null;
  organization_name?: string | null;
  onboarding_data?: Record<string, unknown> | null;
};

export default function RoleDashboardExperience({
  role: defaultRole,
  allowedRoles,
}: {
  role: PlaybookRole;
  allowedRoles?: PlaybookRole[];
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<PlaybookRole>(defaultRole);
  const [networkCount, setNetworkCount] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [state, setState] = useState<"loading" | "ready" | "signed-out" | "error">("loading");

  const load = useCallback(async () => {
    setState("loading");
    const session = await withTimeout(
      supabase.auth.getSession().then(({ data }) => data.session),
      1_800,
    ).catch(() => null);

    if (!session?.user) {
      setState("signed-out");
      return;
    }

    const result = await withTimeout(
      supabase
        .from("profiles")
        .select("full_name,username,role,profile_mode,onboarding_completed,organization_name,onboarding_data")
        .eq("id", session.user.id)
        .maybeSingle(),
      8_000,
    ).catch(() => null);

    if (!result || result.error) {
      setState("error");
      return;
    }

    const loadedProfile: Profile = result.data || {};
    const profileRole = normalizePlaybookRole(
      loadedProfile.profile_mode || loadedProfile.role,
    );
    const resolvedRole = allowedRoles?.includes(profileRole)
      ? profileRole
      : defaultRole;
    setProfile(loadedProfile);
    setRole(resolvedRole);

    const inboxResponse = await fetch("/api/messages", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    }).catch(() => null);
    if (inboxResponse?.ok) {
      const inbox = await inboxResponse.json();
      setNetworkCount(inbox.networks?.length || 0);
      setMessageCount(
        (inbox.networks || []).reduce(
          (total: number, network: { messages?: unknown[] }) =>
            total + (network.messages?.length || 0),
          0,
        ),
      );
    }
    setState("ready");
  }, [allowedRoles, defaultRole]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void load(); }, 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  if (state === "loading") return <OSState title="Opening your Playbook…" body="Connecting your profile, role, relationships, and live operating system." />;
  if (state === "signed-out") return <OSState title="Sign in to open your OS." body="This dashboard uses your authenticated profile and live relationships." href="/login" />;
  if (state === "error") return <OSState title="Your OS needs another moment." body="We could not load your profile. No demo record was substituted." onRetry={load} />;

  const dashboard = getRoleDashboard(role);
  const displayName = profile?.full_name || profile?.username || "Playbook member";
  const organization =
    profile?.organization_name ||
    (typeof profile?.onboarding_data?.organization_name === "string"
      ? profile.onboarding_data.organization_name
      : null);

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow={`${dashboard.title} · ${dashboard.accent}`} title={dashboard.headline} subtitle={dashboard.subtitle}>
        <div style={actions}>
          <PlaybookButton href="/messages">Open Messages</PlaybookButton>
          <PlaybookButton href="/support-network" variant="secondary">View Network</PlaybookButton>
        </div>
      </PlaybookHero>

      <section style={welcome}>
        <div>
          <p style={kicker}>Authenticated workspace</p>
          <h2 style={welcomeTitle}>{displayName}</h2>
          <p style={muted}>{organization || dashboard.title}</p>
        </div>
      </section>

      <PlaybookMetrics>
        <PlaybookMetric label="Role Onboarding" value={profile?.onboarding_completed ? "Complete" : "In progress"} />
        <PlaybookMetric label="Connected Networks" value={String(networkCount)} />
        <PlaybookMetric label="Persisted Messages" value={String(messageCount)} />
        <PlaybookMetric label="Data Source" value="Live" />
      </PlaybookMetrics>

      <PlaybookGrid min={280}>
        {dashboard.modules.map((module) => (
          <PlaybookCard key={`${role}-${module.title}`} eyebrow={module.eyebrow} title={module.title}>
            <p style={body}>{module.body}</p>
            <PlaybookButton href={module.href}>{module.action}</PlaybookButton>
          </PlaybookCard>
        ))}
      </PlaybookGrid>
    </PlaybookPage>
  );
}

function OSState({ title, body, href, onRetry }: { title: string; body: string; href?: string; onRetry?: () => void }) {
  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Playbook OS" title={title} subtitle={body}>
        {href && <PlaybookButton href={href}>Sign in</PlaybookButton>}
        {onRetry && <button type="button" style={retry} onClick={onRetry}>Try again</button>}
      </PlaybookHero>
    </PlaybookPage>
  );
}

const actions: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 };
const welcome: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 18px", padding: 24, border: "1px solid #E2E8F0", borderRadius: 24, background: "#FFFFFF" };
const kicker: React.CSSProperties = { margin: 0, color: "#F97316", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const welcomeTitle: React.CSSProperties = { margin: "6px 0", color: "#0F172A", fontSize: "clamp(28px,4vw,42px)" };
const muted: React.CSSProperties = { margin: 0, color: "#64748B", fontWeight: 700 };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.65 };
const retry: React.CSSProperties = { marginTop: 18, border: 0, borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "12px 18px", fontWeight: 900, cursor: "pointer" };
