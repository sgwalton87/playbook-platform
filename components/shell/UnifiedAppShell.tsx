"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { shouldUseAppShell } from "@/lib/app-shell";
import { getNavigationForRole } from "@/lib/core-journey/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { supabase } from "@/lib/supabaseClient";

async function handleSignOut() {
  await supabase.auth.signOut();
  window.location.href = "/login";
}

const AUTH_FULLSCREEN_ROUTES = [
  "/",
  "/login",
  "/check-email",
  "/start",
  "/auth/callback",
  "/pending",
  "/role-select",
  "/reset-password"
];

export default function UnifiedAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  if (!shouldUseAppShell(pathname || "/")) {
    return <>{children}</>;
  }

  // Later this should come from the authenticated user's profile.
  // For now Founder gets both scholar journey + Founder Tools.
  const profile = { role: "founder" };

  const navigation = getNavigationForRole(profile?.role);
  const primaryNav = navigation.primary;
  const founderNav = navigation.founder;

  if (AUTH_FULLSCREEN_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return <>{children}</>;
  }

  return (
    <div style={shell}>
      <aside style={sidebar} data-playbook-sidebar="true">
        <Link href="/start" style={brand}>
          <PlaybookLogo size={46} priority />
          <span>
            <strong>Playbook OS</strong>
            <small style={brandSub}>Scholar Journey</small>
          </span>
        </Link>

        <nav style={nav}>
          {primaryNav.map((item) => {
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");

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
        
          <button
            onClick={handleSignOut}
            style={{
              background:"#FFFFFF",
              color:"#0F172A",
              border:"1px solid rgba(15,23,42,.15)",
              borderRadius:999,
              padding:"10px 14px",
              fontWeight:900,
              cursor:"pointer",
              marginTop:8
            }}
          >
            Sign Out
          </button>

        </nav>

        {founderNav.length > 0 && (
          <div style={founderSection}>
            <div style={sectionLabel}>Founder Tools</div>

            <nav style={nav}>
              {founderNav.map((item) => {
                const active =
                  pathname === item.href ||
                  pathname?.startsWith(item.href + "/");

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

          <Link href="/start" style={menuButton}>
            Start Here
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
  gridTemplateColumns: "280px 1fr",
  background: "#F8F7F4",
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

const brand: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  color: "#FFFFFF",
  textDecoration: "none",
  marginBottom: 20,
};

const logo: React.CSSProperties = {
  width: 38,
  height: 38,
  borderRadius: 14,
  background: "#F4B942",
  color: "#0F172A",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
};

const brandSub: React.CSSProperties = {
  display: "block",
  color: "rgba(255,255,255,.55)",
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
  color: "#CBD5E1",
  textDecoration: "none",
  padding: "10px 12px",
  borderRadius: 14,
  fontWeight: 850,
};

const activeNavItem: React.CSSProperties = {
  background: "rgba(244,185,66,.16)",
  color: "#FFFFFF",
  border: "1px solid rgba(244,185,66,.35)",
};

const founderSection: React.CSSProperties = {
  marginTop: 24,
  paddingTop: 18,
  borderTop: "1px solid rgba(255,255,255,.1)",
};

const sectionLabel: React.CSSProperties = {
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: ".16em",
  color: "rgba(255,255,255,.42)",
  fontWeight: 900,
  marginBottom: 10,
};

const main: React.CSSProperties = {
  minWidth: 0,
};

const topbar: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 20,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 18px",
  background: "rgba(248,247,244,.92)",
  backdropFilter: "blur(10px)",
  borderBottom: "1px solid #E2E8F0",
};

const backButton: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  background: "#FFFFFF",
  color: "#0F172A",
  borderRadius: 999,
  padding: "8px 11px",
  fontWeight: 900,
  cursor: "pointer",
};

const menuButton: React.CSSProperties = {
  border: "1px solid #E2E8F0",
  background: "#FFFFFF",
  color: "#0F172A",
  borderRadius: 999,
  padding: "8px 11px",
  fontWeight: 900,
  textDecoration: "none",
};
