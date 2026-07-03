"use client";

export default function PlaybookLoading({ label = "Loading Playbook..." }: { label?: string }) {
  return (
    <div style={wrap}>
      <div style={pulse} />
      <strong>{label}</strong>
    </div>
  );
}

const wrap: React.CSSProperties = {
  minHeight: 220,
  display: "grid",
  placeItems: "center",
  gap: 12,
  color: "#64748B",
};

const pulse: React.CSSProperties = {
  width: 44,
  height: 44,
  borderRadius: 999,
  background: "#F97316",
  animation: "pbPulse 1.8s ease-in-out infinite",
};
