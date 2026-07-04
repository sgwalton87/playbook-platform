"use client";

import Link from "next/link";

const nav = [
  ["Dashboard", "/studio"],
  ["Health", "/studio#health"],
  ["Documentation", "/studio#documentation"],
  ["Architecture", "/studio#architecture"],
  ["Scholar Network", "/scholar-network"],
  ["Network Intelligence", "/network-intelligence"],
  ["Beta 3.1 Checklist", "/studio/beta-31"],
  ["Network Inspector", "/studio/network-inspector"],
  ["Messages", "/messages"],
  ["Support Messages", "/support-messages"],
  ["Invitations", "/studio/invitations"],
  ["Permissions", "/permissions"],
  ["Role Intelligence", "/role-intelligence"],
  ["Intelligence Platform", "/intelligence-platform"],
  ["Oracle Console", "/studio/oracle"],
  ["Event Monitor", "/studio/events"],
  ["Inspector", "/studio/inspector"],
  ["Learner Simulator", "/studio/simulator"],
  ["System Map", "/studio/system-map"],
  ["Theme Manager", "/studio/themes"],
  ["SDK Explorer", "/studio/sdk"],
  ["Release Manager", "/studio/release"],
  ["Documentation Center", "/studio/docs"],
  ["Architecture Viewer", "/studio/architecture"],
  ["Demo Director", "/studio/demo-director"],
  ["Demo Director", "/demo"],
  ["Employer OS", "/employer-os"],
  ["University OS", "/university-os"],
  ["District OS", "/district-os"],
  ["Educator OS", "/educator-os"],
  ["Support Network", "/support-network"],
  ["Workflows", "/workflows"],
  ["Action Routing", "/action-routing"],
  ["Collaboration Layer", "/collaboration"],
  ["Family OS", "/family-os"],
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
