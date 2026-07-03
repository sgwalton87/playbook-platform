"use client";

export default function StudioHeader({ status }: any) {
  return (
    <header style={header}>
      <div>
        <p style={eyebrow}>Operating Console</p>
        <h1 style={title}>Playbook Studio</h1>
        <p style={sub}>Build, demo, monitor, and evolve Playbook OS.</p>
      </div>

      <div style={pill}>🟢 {status.build}</div>
    </header>
  );
}

const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 20,
  marginBottom: 22,
};

const eyebrow: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#F97316",
  fontWeight: 950,
  margin: 0,
};

const title: React.CSSProperties = {
  fontSize: 46,
  lineHeight: 1,
  margin: "8px 0",
  color: "#0F172A",
};

const sub: React.CSSProperties = {
  color: "#64748B",
  margin: 0,
};

const pill: React.CSSProperties = {
  background: "#DCFCE7",
  color: "#166534",
  borderRadius: 999,
  padding: "10px 14px",
  fontWeight: 950,
  fontSize: 13,
};
