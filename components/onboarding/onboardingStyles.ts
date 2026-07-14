import type { CSSProperties } from "react";

export const page: CSSProperties = { minHeight: "100vh", background: "#F8F7F4", color: "#0F172A", padding: 24 };
export const hero: CSSProperties = { maxWidth: 1280, margin: "0 auto 22px", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", background: "#0F172A", borderRadius: 34, overflow: "hidden" };
export const heroText: CSSProperties = { padding: "clamp(26px,4vw,52px)", display: "flex", flexDirection: "column", justifyContent: "center" };
export const heroImageWrap: CSSProperties = { minHeight: 330 };
export const heroImage: CSSProperties = { width: "100%", height: "100%", objectFit: "cover", display: "block" };
export const eyebrow: CSSProperties = { marginTop: 18, fontFamily: "'Space Mono', monospace", fontSize: 11, fontWeight: 900, letterSpacing: ".18em", textTransform: "uppercase", color: "#F97316" };
export const heroTitle: CSSProperties = { fontFamily: "'Anton', sans-serif", fontSize: "clamp(38px,5.5vw,68px)", lineHeight: .92, color: "#F8F7F4", textTransform: "uppercase", margin: "10px 0 18px" };
export const heroBody: CSSProperties = { fontSize: 19, lineHeight: 1.45, color: "rgba(248,247,244,.76)", fontWeight: 700 };
export const progressWrap: CSSProperties = { maxWidth: 1280, margin: "0 auto 22px", display: "flex", gap: 10, overflowX: "auto" };
export const stepPill = (active: boolean): CSSProperties => ({ border: active ? "1px solid #F97316" : "1px solid #E2E8F0", background: active ? "#FFF7ED" : "#FFFFFF", borderRadius: 999, padding: "10px 14px", display: "flex", gap: 8, alignItems: "center", flexShrink: 0 });
export const card: CSSProperties = { maxWidth: 920, margin: "0 auto", background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 30, padding: "clamp(28px,5vw,58px)", boxShadow: "0 18px 42px rgba(15,23,42,.08)" };
export const formEyebrow: CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".16em", textTransform: "uppercase", color: "#F97316", margin: 0 };
export const formTitle: CSSProperties = { fontSize: "clamp(34px,5vw,58px)", lineHeight: 1, margin: "8px 0" };
export const formBody: CSSProperties = { fontSize: 19, color: "#64748B", lineHeight: 1.5 };
export const fields: CSSProperties = { display: "grid", gap: 16, marginTop: 18 };
export const label: CSSProperties = { display: "grid", gap: 8, fontWeight: 900 };
export const input: CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 16, padding: "15px 18px", fontSize: 18, width: "100%" };
export const actions: CSSProperties = { display: "flex", gap: 12, flexWrap: "wrap", marginTop: 24 };
export const primary: CSSProperties = { border: "none", borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "15px 24px", fontWeight: 950, cursor: "pointer" };
export const secondary: CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 999, background: "#FFFFFF", color: "#0F172A", padding: "15px 22px", fontWeight: 950, cursor: "pointer" };
export const group: CSSProperties = { display: "grid", gap: 10 };
export const sectionLabel: CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, fontWeight: 900, letterSpacing: ".14em", color: "#64748B", textTransform: "uppercase" };
export const miniGrid: CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 10 };
export const chipGrid: CSSProperties = { display: "flex", flexWrap: "wrap", gap: 8 };
export const chip = (active: boolean): CSSProperties => ({ border: active ? "1px solid #F97316" : "1px solid #CBD5E1", background: active ? "#FFF7ED" : "#FFFFFF", color: active ? "#F97316" : "#0F172A", borderRadius: 999, padding: "10px 14px", fontWeight: 900, cursor: "pointer" });
export const avatarRow: CSSProperties = { display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" };
export const avatar: CSSProperties = { width: 86, height: 86, borderRadius: 999, background: "#E2E8F0", display: "grid", placeItems: "center", overflow: "hidden", fontSize: 28 };
export const avatarImg: CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
export const uploadButton: CSSProperties = { border: "1px solid #CBD5E1", borderRadius: 999, padding: "12px 18px", fontWeight: 950, cursor: "pointer" };
export const overlay: CSSProperties = { position: "fixed", inset: 0, zIndex: 9999, background: "rgba(15,23,42,.94)", color: "#F8F7F4", display: "grid", placeItems: "center", textAlign: "center", padding: 24 };
export const overlayTitle: CSSProperties = { fontFamily: "'Anton', sans-serif", fontSize: "clamp(44px,7vw,86px)", textTransform: "uppercase", margin: 0 };
export const overlayText: CSSProperties = { fontSize: 22, color: "rgba(248,247,244,.75)" };
export const confetti: CSSProperties = { fontSize: 38, marginBottom: 16 };

export const activityCategoryGrid: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginBottom: 8,
};

export const activityCategory: CSSProperties = {
  border: "1px solid #CBD5E1",
  background: "#FFFFFF",
  borderRadius: 999,
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
};

export const addRow: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: 10,
};

export const summaryList: CSSProperties = {
  display: "grid",
  gap: 10,
  marginTop: 10,
};

export const summaryItem: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  border: "1px solid #E2E8F0",
  borderRadius: 14,
  padding: "12px 14px",
  background: "#F8FAFC",
  fontWeight: 900,
};

export const removeButton: CSSProperties = {
  border: "none",
  background: "transparent",
  color: "#F97316",
  fontWeight: 950,
  cursor: "pointer",
};

export const safetyBox: CSSProperties = {
  maxHeight: 360,
  overflowY: "auto",
  border: "1px solid #CBD5E1",
  borderRadius: 20,
  padding: 20,
  background: "#F8FAFC",
  color: "#334155",
  lineHeight: 1.55,
};

export const agreeRow: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  fontSize: 18,
  fontWeight: 950,
  background: "#FFF7ED",
  border: "1px solid #FED7AA",
  borderRadius: 18,
  padding: 16,
};
