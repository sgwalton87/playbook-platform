"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { buildEvidenceTraceabilityFeed } from "@/lib/scholar-experience";
import { getRoleContentSurface, getRoleNavigationItems, getRoleShellStateFromContext, getRoutePermissions, resolveRoleFromPathname } from "@/lib/role-shell";

interface ProfileContext {
  role?: string | null;
  profile_mode?: string | null;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [profile, setProfile] = useState<ProfileContext | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("role,profile_mode")
        .eq("id", userData.user.id)
        .maybeSingle();

      setProfile(data as ProfileContext | null);
    }

    void loadProfile();
  }, []);

  const role = resolveRoleFromPathname(pathname ?? "/");
  const shellState = useMemo(
    () => getRoleShellStateFromContext({
      role: profile?.role,
      profileMode: profile?.profile_mode,
      pathname,
      permissions: getRoutePermissions(pathname, profile?.role, profile?.profile_mode),
    }),
    [pathname, profile?.profile_mode, profile?.role]
  );
  const items = getRoleNavigationItems(shellState.role, shellState.permissions);
  const contentSurface = useMemo(
    () => getRoleContentSurface(shellState.role, shellState.permissions, pathname),
    [pathname, shellState.permissions, shellState.role]
  );
  const evidenceFeed = useMemo(
    () =>
      buildEvidenceTraceabilityFeed({
        items: contentSurface.evidence.map((item) => ({
          title: item.label,
          status: item.status === "shared" ? "ready" : item.status === "ready" ? "ready" : "pending",
          source: item.status === "shared" ? "review" : "system",
        })),
      }),
    [contentSurface.evidence]
  );

  return (
    <div style={shell}>
      <aside style={sidebar} aria-label="Role navigation">
        <div style={brandBlock}>
          <p style={eyebrow}>Playbook OS</p>
          <h2 style={title}>{shellState.role.replace(/-/g, " ")}</h2>
        </div>
        <div style={statusRow}>
          <span style={pill}>Alerts {shellState.notificationCount}</span>
          <span style={pill}>Settings {shellState.settingsStatus}</span>
          <span style={pill}>Evidence {shellState.evidenceStatus}</span>
        </div>
        <div style={contextCard}>
          <div style={contextLabel}>Active route</div>
          <div style={contextValue}>{pathname ?? "/"}</div>
          <div style={contextLabel}>Permissions</div>
          <div style={permissionRow}>
            {shellState.permissions.map((permission) => (
              <span key={permission} style={permissionBadge}>{permission}</span>
            ))}
          </div>
        </div>
        <div style={surfaceCard}>
          <div style={surfaceTitle}>{contentSurface.title}</div>
          <div style={surfaceSummary}>{contentSurface.summary}</div>
          <div style={surfaceHighlightRow}>
            {contentSurface.highlights.map((highlight) => (
              <span key={highlight} style={surfaceHighlight}>{highlight}</span>
            ))}
          </div>
          <div style={surfaceActionRow}>
            {contentSurface.actions.map((action) => (
              <span key={action} style={surfaceAction}>{action}</span>
            ))}
          </div>
          <div style={evidenceList}>
            {evidenceFeed.latest.map((item) => (
              <div key={item.title} style={evidenceItem}>
                <span style={evidenceTitle}>{item.title}</span>
                <span style={evidenceMeta}>{item.status} · {item.source}</span>
              </div>
            ))}
          </div>
        </div>
        <nav style={nav}>
          {items.map((item) => (
            <Link key={item.href} href={item.href} style={navLink}>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <main style={content}>{children}</main>
    </div>
  );
}

const shell: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "280px minmax(0, 1fr)",
  background: "#F8F7F4",
};

const sidebar: React.CSSProperties = {
  background: "#0F172A",
  color: "#F8FAFC",
  padding: "24px 18px",
  display: "flex",
  flexDirection: "column",
  gap: 18,
};

const brandBlock: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const eyebrow: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.18em",
  color: "#F59E0B",
};

const title: React.CSSProperties = {
  margin: 0,
  fontSize: 22,
  textTransform: "capitalize",
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const navLink: React.CSSProperties = {
  color: "#E2E8F0",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
};

const statusRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const pill: React.CSSProperties = {
  fontSize: 11,
  padding: "6px 8px",
  borderRadius: 999,
  background: "rgba(245, 158, 11, 0.16)",
  color: "#FDE68A",
  textTransform: "capitalize",
};

const contextCard: React.CSSProperties = {
  display: "grid",
  gap: 6,
  padding: "12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.08)",
};

const contextLabel: React.CSSProperties = {
  fontSize: 11,
  textTransform: "uppercase",
  letterSpacing: "0.16em",
  color: "#94A3B8",
};

const contextValue: React.CSSProperties = {
  fontSize: 13,
  color: "#F8FAFC",
  overflowWrap: "anywhere",
};

const permissionRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const permissionBadge: React.CSSProperties = {
  fontSize: 10,
  padding: "4px 7px",
  borderRadius: 999,
  background: "rgba(59, 130, 246, 0.2)",
  color: "#BFDBFE",
};

const surfaceCard: React.CSSProperties = {
  display: "grid",
  gap: 8,
  padding: "12px",
  borderRadius: 12,
  background: "rgba(255,255,255,0.06)",
};

const surfaceTitle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 700,
  color: "#F8FAFC",
};

const surfaceSummary: React.CSSProperties = {
  fontSize: 12,
  color: "#CBD5E1",
};

const surfaceHighlightRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const surfaceHighlight: React.CSSProperties = {
  fontSize: 10,
  padding: "4px 7px",
  borderRadius: 999,
  background: "rgba(16, 185, 129, 0.16)",
  color: "#D1FAE5",
};

const surfaceActionRow: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 6,
};

const surfaceAction: React.CSSProperties = {
  fontSize: 10,
  padding: "4px 7px",
  borderRadius: 999,
  background: "rgba(59, 130, 246, 0.16)",
  color: "#DBEAFE",
};

const evidenceList: React.CSSProperties = {
  display: "grid",
  gap: 6,
};

const evidenceItem: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 8,
  alignItems: "center",
  padding: "7px 0",
  borderTop: "1px solid rgba(255,255,255,0.08)",
};

const evidenceTitle: React.CSSProperties = {
  fontSize: 11,
  color: "#F8FAFC",
};

const evidenceMeta: React.CSSProperties = {
  fontSize: 10,
  textTransform: "capitalize",
  color: "#94A3B8",
};

const content: React.CSSProperties = {
  minWidth: 0,
};
