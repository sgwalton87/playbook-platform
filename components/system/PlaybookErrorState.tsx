"use client";

export default function PlaybookErrorState({
  title = "Something needs attention.",
  body = "Try again, or check the system status in Playbook Studio.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section style={wrap}>
      <div style={icon}>⚠️</div>
      <h3 style={titleStyle}>{title}</h3>
      <p style={bodyStyle}>{body}</p>
    </section>
  );
}

const wrap: React.CSSProperties = {
  background: "#FFF7ED",
  border: "1px solid #FED7AA",
  borderRadius: 22,
  padding: 24,
};

const icon: React.CSSProperties = { fontSize: 24 };
const titleStyle: React.CSSProperties = { color: "#9A3412", margin: "8px 0" };
const bodyStyle: React.CSSProperties = { color: "#9A3412", lineHeight: 1.6, margin: 0 };
