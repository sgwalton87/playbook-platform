"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { shouldUseAppShell } from "@/lib/app-shell";
import { getNavigationForRole } from "@/lib/core-journey/navigation";
import { getRoleNavigation, type NavItem } from "@/lib/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import ProfileAvatar from "@/components/ProfileAvatar";
import { supabase } from "@/lib/supabaseClient";

const ROUTE_ROLE_PREVIEWS: Array<[string, string]> = [
  ["/scholar-athlete-os", "scholar-athlete"],
  ["/athlete-abroad-os", "athlete-abroad"],
  ["/brand-partner-os", "brand-partner"],
  ["/family-os", "family"],
  ["/mentor-os", "mentor"],
  ["/educator-os", "educator"],
  ["/employer-os", "employer"],
  ["/university-os", "college-admissions"],
  ["/district-os", "district"],
];

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

  const previewRole = ROUTE_ROLE_PREVIEWS.find(([route]) => pathname === route || pathname?.startsWith(`${route}/`))?.[1];
  const roleNav = useMemo(
    // A role-OS route owns its preview navigation context. This prevents an
    // authenticated Scholar profile from relabeling the Scholar-Athlete,
    // partner, or support-role preview as "Scholar OS".
    () => getRoleNavigation(previewRole || profile?.profile_mode, profile?.role),
    [previewRole, profile?.profile_mode, profile?.role]
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

  const mobileItems = roleNav.items.slice(0, 4);
  const profileItem: NavItem = { label: "Profile", href: "/profile", icon: "👤" };

  return (
    <div
      className="playbook-app-shell"
      data-visual-canon="PGDS-001"
      data-playbook-surface="authenticated-product-shell"
      style={{ gridTemplateColumns: open ? "var(--pb-sidebar-width) 1fr" : "var(--pb-sidebar-compact) 1fr" }}
    >
      <aside className="playbook-sidebar" data-playbook-sidebar="true">
        <button onClick={() => setOpen((v) => !v)} className="playbook-sidebar__toggle" aria-label="Toggle sidebar">
          {open ? "← Collapse" : "→"}
        </button>

        <Link href={roleNav.home} className="playbook-brand">
          <PlaybookLogo size={open ? 64 : 48} priority />
          {open && (
            <span>
              <strong>Playbook OS</strong>
              <small>{roleNav.label}</small>
            </span>
          )}
        </Link>

        <Link href="/profile" className="playbook-profile-card">
          <ProfileAvatar src={profile?.avatar_url} name={displayName} size={open ? 46 : 42} />
          {open && (
            <span style={{ minWidth: 0 }}>
              <strong className="playbook-profile-name">{displayName}</strong>
              <small className="playbook-role-badge">{roleNav.label}</small>
            </span>
          )}
        </Link>

        <ShellNav items={roleNav.items} pathname={pathname} compact={!open} />

        <button onClick={handleSignOut} className="playbook-signout" style={{ justifyContent: open ? "flex-start" : "center" }}>
          <span>↪</span>
          {open && <span>Sign Out</span>}
        </button>

        {open && founderNav.length > 0 && (
          <div className="playbook-founder-section">
            <div className="playbook-section-label">Founder Tools</div>
            <ShellNav items={founderNav} pathname={pathname} />
          </div>
        )}
      </aside>

      <section className="playbook-main">
        <header className="playbook-mobile-header">
          <Link href={roleNav.home} className="playbook-brand" style={{ marginBottom: 0 }}>
            <PlaybookLogo size={48} priority />
            <span><strong>Playbook</strong><small>{roleNav.label}</small></span>
          </Link>
          <ProfileAvatar src={profile?.avatar_url} name={displayName} size={38} />
        </header>

        <header className="playbook-topbar">
          <button onClick={() => router.back()} className="playbook-topbar__back">← Back</button>
          <Link href={roleNav.home} className="playbook-topbar__mode">{roleNav.label}</Link>
        </header>

        {children}

        <nav className="playbook-mobile-bottom-nav" aria-label="Primary mobile navigation">
          {[...mobileItems, profileItem].map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href} data-active={active}>
                <span aria-hidden="true">{item.icon}</span>
                <span>{item.label.replace(" Dashboard", "")}</span>
              </Link>
            );
          })}
        </nav>
      </section>
    </div>
  );
}

function ShellNav({ items, pathname, compact = false }: { items: NavItem[]; pathname: string | null; compact?: boolean }) {
  return (
    <nav>
      {items.map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`playbook-nav-item${active ? " playbook-nav-item--active" : ""}`}
            style={{ justifyContent: compact ? "center" : "flex-start" }}
            title={compact ? item.label : undefined}
          >
            <span aria-hidden="true">{item.icon}</span>
            {!compact && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
