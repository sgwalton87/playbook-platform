"use client";

import Link from "next/link";

const actions = [
  ["Open Demo", "/demo"],
  ["Open Living Scholar", "/living-scholar"],
  ["Open Journey", "/journey"],
  ["Open Home", "/home"],
  ["Open Opportunities", "/opportunities"],
  ["Open Compass", "/compass"],
];

export default function StudioQuickActions() {
  return (
    <div style={wrap}>
      {actions.map(([label, href]) => (
        <Link key={label} href={href} style={button}>
          {label} →
        </Link>
      ))}
    </div>
  );
}

const wrap: React.CSSProperties = {
  display: "flex",
  gap: 10,
  flexWrap: "wrap",
};

const button: React.CSSProperties = {
  background: "#F97316",
  color: "#fff",
  borderRadius: 999,
  padding: "10px 13px",
  textDecoration: "none",
  fontSize: 13,
  fontWeight: 900,
};
