"use client";

export default function PlaybookEmptyState({
  title = "Nothing here yet.",
  body = "Add your first record to activate Playbook intelligence.",
  action,
}: {
  title?: string;
  body?: string;
  action?: React.ReactNode;
}) {
  return (
    <section style={wrap}>
      <div style={icon}>✨</div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={bodyStyle}>{body}</p>
      {action && <div style={{ marginTop: 14 }}>{action}</div>}
    </section>
  );
}

const wrap: React.CSSProperties = {
  background: "#fff",
  border: "1px dashed #CBD5E1",
  borderRadius: 22,
  padding: 26,
  textAlign: "center",
};

const icon: React.CSSProperties = { fontSize: 28 };
const titleStyle: React.CSSProperties = { color: "#0F172A", margin: "8px 0" };
const bodyStyle: React.CSSProperties = { color: "#64748B", lineHeight: 1.6, margin: 0 };
