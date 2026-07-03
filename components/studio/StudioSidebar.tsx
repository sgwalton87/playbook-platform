"use client";

import Link from "next/link";

const nav = [
  ["Dashboard", "/studio"],
  ["Health", "/studio#health"],
  ["Documentation", "/studio#documentation"],
  ["Architecture", "/studio#architecture"],
  ["Demo Director", "/demo"],
  ["Living Scholar", "/living-scholar"],
  ["Journey", "/journey"],
  ["Home", "/home"],
];

export default function StudioSidebar() {
  return (
    <aside style={sidebar}>
      <div>
        <p style={eyebrow}>Playbook</p>
        <h2 style={brand}>Studio</h2>
      </div>

      <nav style={{ display: "grid", gap: 8 }}>
        {nav.map(([label, href]) => (
          <Link key={label} href={href} style={link}>
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

const sidebar: React.CSSProperties = {
  background: "#0F172A",
  color: "#fff",
  minHeight: "100vh",
  padding: 24,
  display: "grid",
  alignContent: "start",
  gap: 28,
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#FED7AA",
  fontWeight: 950,
  margin: 0,
};

const brand: React.CSSProperties = {
  fontSize: 34,
  margin: "6px 0 0",
};

const link: React.CSSProperties = {
  color: "#CBD5E1",
  textDecoration: "none",
  fontSize: 14,
  fontWeight: 800,
  padding: "10px 12px",
  borderRadius: 12,
};
