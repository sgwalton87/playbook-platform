"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { shouldUseAppShell } from "@/lib/app-shell";

const NAV = [
  { label: "Home", href: "/home", icon: "✨" },
  { label: "Founder", href: "/founder", icon: "👑" },
  { label: "Dashboard", href: "/dashboard", icon: "🏠" },
  { label: "Record", href: "/record", icon: "📘" },
  { label: "Applications", href: "/opportunity-toolkit", icon: "📝" },
  { label: "Athlete OS", href: "/scholar-athlete-os", icon: "🏀" },
  { label: "Messages", href: "/messages", icon: "💬" },
  { label: "Notifications", href: "/notifications", icon: "🔔" },
  { label: "Courses", href: "/courses", icon: "🎓" },
  { label: "Coins", href: "/gamification", icon: "🪙" },
  { label: "Store", href: "/store-v2", icon: "🛍️" },
  { label: "Studio", href: "/studio", icon: "🛠️" },
];

export default function UnifiedAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  if (!shouldUseAppShell(pathname || "/")) {
    return <>{children}</>;
  }

  return (
    <div style={shell}>
      <aside style={sidebar} data-playbook-sidebar="true">
        <Link href="/dashboard" style={brand}>
          <span style={logo}>P</span>
          <strong>Playbook OS</strong>
        </Link>

        <nav style={nav}>
          {NAV.map((item) => {
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
      </aside>

      <section style={main}>
        <header style={topbar}>
          <button onClick={() => router.back()} style={backButton}>
            ← Back
          </button>

          <Link href="/dashboard" style={menuButton}>
            ☰ Menu
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
  gridTemplateColumns: "260px 1fr",
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
  width: 36,
  height: 36,
  borderRadius: 12,
  background: "#F97316",
  display: "grid",
  placeItems: "center",
  fontWeight: 950,
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
  background: "rgba(249,115,22,.16)",
  color: "#FFFFFF",
  border: "1px solid rgba(249,115,22,.35)",
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
