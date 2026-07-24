"use client";

export default function StudioCard({ label, title, value, children }: LegacyValue) {
  return (
    <section style={card}>
      <p style={labelStyle}>{label}</p>
      <h3 style={titleStyle}>{title}</h3>
      {value && <strong style={valueStyle}>{value}</strong>}
      {children && <div style={{ marginTop: 12 }}>{children}</div>}
    </section>
  );
}

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 20,
  boxShadow: "0 16px 40px rgba(15,23,42,.06)",
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  fontWeight: 950,
  color: "#F97316",
  margin: 0,
};

const titleStyle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 18,
  margin: "8px 0",
};

const valueStyle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 28,
};
