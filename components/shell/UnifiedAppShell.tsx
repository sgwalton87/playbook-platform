"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { shouldUseAppShell } from "@/lib/app-shell";
import { getNavigationForRole } from "@/lib/core-journey/navigation";
import { getRoleNavigation } from "@/lib/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import ProfileAvatar from "@/components/ProfileAvatar";
import { supabase } from "@/lib/supabaseClient";

const AUTH_FULLSCREEN_ROUTES = [
  "/",
  "/login",
  "/check-email",
  "/start",
  "/auth/callback",
  "/pending",
  "/role-select",
  "/reset-password",
];

export default function UnifiedAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<LegacyValue>(null);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const { data: u } = await supabase.auth.getUser();

      if (!u.user) return;

      const { data } = await supabase
        .from("profiles")
        .select("id,full_name,first_name,last_name,username,avatar_url,role,profile_mode")
        .eq("id", u.user.id)
        .maybeSingle();

      setProfile(data);
    }

    loadProfile();
  }, []);

  const roleNav = useMemo(
    () => getRoleNavigation(profile?.profile_mode, profile?.role),
    [profile?.profile_mode, profile?.role]
  );

  const founderNav = useMemo(() => {
    const base = getNavigationForRole(profile?.role || profile?.profile_mode || "");
    return profile?.role === "founder" || profile?.profile_mode === "founder"
      ? base.founder
      : [];
  }, [profile?.role, profile?.profile_mode]);

  if (!shouldUseAppShell(pathname || "/")) return <>{children}</>;

  if (AUTH_FULLSCREEN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return <>{children}</>;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  const displayName =
    profile?.full_name ||
    `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
    profile?.username ||
    "Playbook User";

  return (
    <div
      style={{
        ...shell,
        gridTemplateColumns: open ? "280px 1fr" : "86px 1fr",
      }}
    >
      <aside style={sidebar} data-playbook-sidebar="true">
        <button
          onClick={() => setOpen((v) => !v)}
          style={collapseButton}
          aria-label="Toggle sidebar"
        >
          {open ? "←" : "→"}
        </button>

        <Link href={roleNav.home} style={brand}>
          <PlaybookLogo size={open ? 46 : 42} priority />
          {open && (
            <span>
              <strong>Playbook OS</strong>
              <small style={brandSub}>{roleNav.label}</small>
            </span>
          )}
        </Link>

        <Link href="/profile" style={profileCard}>
          <ProfileAvatar src={profile?.avatar_url} name={displayName} size={open ? 46 : 42} />
          {open && (
            <span style={{ minWidth: 0 }}>
              <strong style={profileName}>{displayName}</strong>
              <small style={roleBadge}>{roleNav.label}</small>
            </span>
          )}
        </Link>

        <nav style={nav}>
          {roleNav.items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...navItem,
                  justifyContent: open ? "flex-start" : "center",
                  ...(active ? activeNavItem : {}),
                }}
              >
                <span>{item.icon}</span>
                {open && <span>{item.label}</span>}
              </Link>
            );
          })}

          <button
            onClick={handleSignOut}
            style={{
              ...signOutButton,
              justifyContent: open ? "flex-start" : "center",
            }}
          >
            <span>↪</span>
            {open && <span>Sign Out</span>}
          </button>
        </nav>

        {open && founderNav.length > 0 && (
          <div style={founderSection}>
            <div style={sectionLabel}>Founder Tools</div>

            <nav style={nav}>
              {founderNav.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      ...navItem,
                      ...(active ? activeNavItem : {}),
                    }}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </aside>

      <section style={main}>
        <header style={topbar}>
          <button onClick={() => router.back()} style={backButton}>
            ← Back
          </button>

          <Link href={roleNav.home} style={menuButton}>
            {roleNav.label}
          </Link>
        </header>

        {children}
      </section>
    </div>
  );
}

const shell: React.CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  background: "#F8F7F4",
  transition: "grid-template-columns .2s ease",
};

const sidebar: React.CSSProperties = {
  position: "sticky",
  top: 0,
  height: "100vh",
  background: "#0F172A",
  color: "#FFFFFF",
  padding: 18,
  boxSizing: "border-box",
  overflowY: "auto",
};

const collapseButton: React.CSSProperties = {
  width: "100%",
  border: "1px solid rgba(255,255,255,.12)",
  background: "rgba(255,255,255,.06)",
  color: "#F8F7F4",
  borderRadius: 14,
  padding: "9px 10px",
  cursor: "pointer",
  fontWeight: 950,
  marginBottom: 14,
};

const brand: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#FFFFFF",
  textDecoration: "none",
  marginBottom: 18,
};

const brandSub: React.CSSProperties = {
  display: "block",
  color: "#F97316",
  fontSize: 10,
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: ".08em",
};

const profileCard: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#FFFFFF",
  textDecoration: "none",
  background: "rgba(255,255,255,.06)",
  border: "1px solid rgba(255,255,255,.10)",
  borderRadius: 18,
  padding: 10,
  marginBottom: 18,
};

const profileName: React.CSSProperties = {
  display: "block",
  overflow: "hidden",
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
};

const roleBadge: React.CSSProperties = {
  display: "block",
  color: "rgba(248,247,244,.62)",
  fontSize: 11,
  marginTop: 2,
};

const nav: React.CSSProperties = {
  display: "grid",
  gap: 8,
};

const navItem: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "rgba(248,247,244,.78)",
  textDecoration: "none",
  borderRadius: 14,
  padding: "11px 12px",
  fontWeight: 900,
};

const activeNavItem: React.CSSProperties = {
  background: "#F97316",
  color: "#FFFFFF",
};

const signOutButton: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  background: "#FFFFFF",
  color: "#0F172A",
  border: "1px solid rgba(15,23,42,.15)",
  borderRadius: 999,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
  marginTop: 8,
};

const founderSection: React.CSSProperties = {
  marginTop: 24,
  paddingTop: 16,
  borderTop: "1px solid rgba(255,255,255,.12)",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 950,
  color: "rgba(248,247,244,.5)",
  textTransform: "uppercase",
  letterSpacing: ".14em",
  marginBottom: 10,
};

const main: React.CSSProperties = {
  minWidth: 0,
};

const topbar: React.CSSProperties = {
  minHeight: 68,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 22px",
  borderBottom: "1px solid #E2E8F0",
  background: "rgba(248,247,244,.86)",
  backdropFilter: "blur(10px)",
  position: "sticky",
  top: 0,
  zIndex: 10,
};

const backButton: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  color: "#0F172A",
  borderRadius: 999,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

const menuButton: React.CSSProperties = {
  border: "none",
  background: "#0F172A",
  color: "#FFFFFF",
  borderRadius: 999,
  padding: "10px 16px",
  fontWeight: 950,
  textDecoration: "none",
};
