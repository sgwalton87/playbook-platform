"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { shouldUseAppShell } from "@/lib/app-shell";
import { getNavigationForRole } from "@/lib/core-journey/navigation";
import { getRoleNavigation, type NavItem } from "@/lib/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import ProfileAvatar from "@/components/ProfileAvatar";
import ActiveScholarContextSelector from "@/components/shell/ActiveScholarContextSelector";
import { supabase } from "@/lib/supabaseClient";
import { logout } from "@/lib/auth/logout";

const ROUTE_ROLE_PREVIEWS: Array<[string, string]> = [
  ["/scholar-athlete-os", "scholar-athlete"], ["/athlete-abroad-os", "athlete-abroad"], ["/brand-partner-os", "brand-partner"],
  ["/family-os", "family"], ["/mentor-os", "mentor"], ["/educator-os", "educator"], ["/employer-os", "employer"],
  ["/university-os", "college-admissions"], ["/district-os", "district"],
];
const AUTH_FULLSCREEN_ROUTES = ["/", "/login", "/check-email", "/start", "/auth/callback", "/pending", "/role-select", "/reset-password"];

type ShellContext = { evidenceCount: number; pendingVerificationCount: number; unreadAttentionCount: number; activeSupportCount: number };
const EMPTY_CONTEXT: ShellContext = { evidenceCount: 0, pendingVerificationCount: 0, unreadAttentionCount: 0, activeSupportCount: 0 };

export default function UnifiedAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<LegacyValue>(null);
  const [context, setContext] = useState<ShellContext>(EMPTY_CONTEXT);
  const [contextReady, setContextReady] = useState(false);
  const [open, setOpen] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadIdentityAndContext() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user || !active) return;
      const [profileResult, contextResult] = await Promise.all([
        supabase.from("profiles").select("id,full_name,first_name,last_name,username,avatar_url,role,profile_mode").eq("id", u.user.id).maybeSingle(),
        fetch("/api/shell/context", { cache: "no-store" }),
      ]);
      if (!active) return;
      setProfile(profileResult.data);
      if (contextResult.ok) {
        const body = await contextResult.json() as Partial<ShellContext>;
        if (!active) return;
        setContext({ evidenceCount: Number(body.evidenceCount ?? 0), pendingVerificationCount: Number(body.pendingVerificationCount ?? 0), unreadAttentionCount: Number(body.unreadAttentionCount ?? 0), activeSupportCount: Number(body.activeSupportCount ?? 0) });
      }
      setContextReady(true);
    }
    void loadIdentityAndContext();
    return () => { active = false; };
  }, [pathname]);

  const previewRole = ROUTE_ROLE_PREVIEWS.find(([route]) => pathname === route || pathname?.startsWith(`${route}/`))?.[1];
  const roleNav = useMemo(() => getRoleNavigation(previewRole || profile?.profile_mode, profile?.role), [previewRole, profile?.profile_mode, profile?.role]);
  const founderNav = useMemo(() => {
    const base = getNavigationForRole(profile?.role || profile?.profile_mode || "");
    return profile?.role === "founder" || profile?.profile_mode === "founder" ? base.founder : [];
  }, [profile?.role, profile?.profile_mode]);

  if (!shouldUseAppShell(pathname || "/")) return <>{children}</>;
  if (AUTH_FULLSCREEN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) return <>{children}</>;

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true); setSignOutError(null);
    const result = await logout(supabase);
    if (!result.ok) { setSignOutError(result.message); setSigningOut(false); return; }
    window.location.replace("/login");
  }

  const displayName = profile?.full_name || `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || profile?.username || "Playbook User";
  const mobileItems = roleNav.items.slice(0, 4);
  const profileItem: NavItem = { label: "Profile", href: "/profile", icon: "👤" };
  const attentionTotal = context.unreadAttentionCount + context.pendingVerificationCount;

  return <div className="playbook-app-shell" data-visual-canon="PGDS-001" data-playbook-surface="authenticated-product-shell" style={{ gridTemplateColumns: open ? "var(--pb-sidebar-width) 1fr" : "var(--pb-sidebar-compact) 1fr" }}>
    <aside className="playbook-sidebar" data-playbook-sidebar="true">
      <button onClick={() => setOpen((v) => !v)} className="playbook-sidebar__toggle" aria-label="Toggle sidebar">{open ? "← Collapse" : "→"}</button>
      <Link href={roleNav.home} className="playbook-brand"><PlaybookLogo size={open ? 64 : 48} priority />{open && <span><strong>Playbook OS</strong><small>{roleNav.label}</small></span>}</Link>
      <Link href="/profile" className="playbook-profile-card"><ProfileAvatar src={profile?.avatar_url} name={displayName} size={open ? 46 : 42} />{open && <span style={{ minWidth: 0 }}><strong className="playbook-profile-name">{displayName}</strong><small className="playbook-role-badge">{roleNav.label}</small></span>}</Link>

      <ActiveScholarContextSelector compact={!open} />

      {open && <section aria-label="Your live Playbook context" style={contextPanel}>
        <div style={contextHeading}><span>Live context</span><span aria-label={contextReady ? "Live context current" : "Loading live context"}>{contextReady ? "●" : "…"}</span></div>
        <div style={contextGrid}>
          <ContextLink href="/notifications" label="Attention" value={attentionTotal} emphasis={attentionTotal > 0} />
          <ContextLink href="/transcript" label="Evidence" value={context.evidenceCount} />
          <ContextLink href="/profile" label="Pending review" value={context.pendingVerificationCount} emphasis={context.pendingVerificationCount > 0} />
          <ContextLink href="/support-network" label="Support team" value={context.activeSupportCount} />
        </div>
      </section>}

      <ShellNav items={roleNav.items} pathname={pathname} compact={!open} />
      <button type="button" onClick={handleSignOut} className="playbook-signout" style={{ justifyContent: open ? "flex-start" : "center" }} disabled={signingOut} aria-describedby={signOutError ? "sign-out-error" : undefined}><span aria-hidden="true">↪</span>{open && <span>{signingOut ? "Signing out…" : "Sign out"}</span>}</button>
      {open && founderNav.length > 0 && <div className="playbook-founder-section"><div className="playbook-section-label">Founder Tools</div><ShellNav items={founderNav} pathname={pathname} /></div>}
    </aside>

    <section className="playbook-main">
      <header className="playbook-mobile-header">
        <Link href={roleNav.home} className="playbook-brand" style={{ marginBottom: 0 }}><PlaybookLogo size={48} priority /><span><strong>Playbook</strong><small>{roleNav.label}</small></span></Link>
        <Link href="/notifications" aria-label={`${attentionTotal} items need attention`} style={mobileAttention}>{attentionTotal > 0 ? attentionTotal : "✓"}</Link>
        <ProfileAvatar src={profile?.avatar_url} name={displayName} size={38} />
        <button type="button" onClick={handleSignOut} className="playbook-signout" disabled={signingOut} aria-describedby={signOutError ? "sign-out-error" : undefined}>{signingOut ? "Signing out…" : "Sign out"}</button>
      </header>
      {signOutError && <p id="sign-out-error" role="alert" aria-live="polite" className="playbook-signout-error">{signOutError}</p>}
      <header className="playbook-topbar">
        <button onClick={() => router.back()} className="playbook-topbar__back">← Back</button>
        <div style={topbarContext}>
          <Link href="/notifications" style={attentionLink} aria-label={`${attentionTotal} items need attention`}>{attentionTotal > 0 ? `${attentionTotal} need attention` : "All caught up"}</Link>
          <span style={topbarFact}>{context.evidenceCount} evidence</span><span style={topbarFact}>{context.activeSupportCount} support</span>
        </div>
        <Link href={roleNav.home} className="playbook-topbar__mode">{roleNav.label}</Link>
      </header>
      {children}
      <nav className="playbook-mobile-bottom-nav" aria-label="Primary mobile navigation">{[...mobileItems, profileItem].map((item) => {
        const active = pathname === item.href || pathname?.startsWith(item.href + "/");
        return <Link key={item.href} href={item.href} data-active={active}><span aria-hidden="true">{item.icon}</span><span>{item.label.replace(" Dashboard", "")}</span></Link>;
      })}</nav>
    </section>
  </div>;
}

function ContextLink({ href, label, value, emphasis = false }: { href: string; label: string; value: number; emphasis?: boolean }) {
  return <Link href={href} style={{ ...contextTile, ...(emphasis ? contextTileAttention : {}) }}><strong>{value}</strong><span>{label}</span></Link>;
}
function ShellNav({ items, pathname, compact = false }: { items: NavItem[]; pathname: string | null; compact?: boolean }) {
  return <nav>{items.map((item) => { const active = pathname === item.href || pathname?.startsWith(item.href + "/"); return <Link key={item.href} href={item.href} className={`playbook-nav-item${active ? " playbook-nav-item--active" : ""}`} style={{ justifyContent: compact ? "center" : "flex-start" }} title={compact ? item.label : undefined}><span aria-hidden="true">{item.icon}</span>{!compact && <span>{item.label}</span>}</Link>; })}</nav>;
}

const contextPanel: React.CSSProperties = { margin: "0 8px 16px", padding: 12, borderRadius: 18, background: "rgba(255,255,255,.055)", border: "1px solid rgba(255,255,255,.08)" };
const contextHeading: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 9, color: "rgba(255,255,255,.68)", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: ".12em" };
const contextGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: 7 };
const contextTile: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 2, padding: "9px 8px", borderRadius: 12, background: "rgba(255,255,255,.05)", color: "#F8FAFC", textDecoration: "none", border: "1px solid transparent" };
const contextTileAttention: React.CSSProperties = { background: "rgba(249,115,22,.14)", borderColor: "rgba(251,146,60,.34)" };
const topbarContext: React.CSSProperties = { marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "flex-end" };
const attentionLink: React.CSSProperties = { borderRadius: 999, padding: "7px 10px", background: "#FFF7ED", border: "1px solid #FDBA74", color: "#9A3412", textDecoration: "none", fontSize: 12, fontWeight: 900 };
const topbarFact: React.CSSProperties = { color: "#64748B", fontSize: 12, fontWeight: 700 };
const mobileAttention: React.CSSProperties = { minWidth: 32, height: 32, padding: "0 8px", borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "#F97316", color: "white", textDecoration: "none", fontWeight: 900, fontSize: 12 };
