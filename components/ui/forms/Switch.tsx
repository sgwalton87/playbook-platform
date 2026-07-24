import { playbookTheme } from "@/lib/design-system/tokens";

export type SwitchProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label?: React.ReactNode };

export function Switch({ label, checked, style, ...props }: SwitchProps) {
  return <label style={{ ...root, ...style }}><span style={{ ...track, background: checked ? playbookTheme.colors.orange : "#CBD5E1" }}><input type="checkbox" role="switch" checked={checked} {...props} style={input} /><span style={{ ...thumb, transform: checked ? "translateX(20px)" : "translateX(0)" }} /></span>{label && <span style={labelStyle}>{label}</span>}</label>;
}
const root: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, cursor: "pointer", color: playbookTheme.colors.ink };
const track: React.CSSProperties = { position: "relative", width: 44, height: 24, borderRadius: 999, transition: "background .2s ease", flexShrink: 0 };
const thumb: React.CSSProperties = { position: "absolute", top: 3, left: 3, width: 18, height: 18, borderRadius: 999, background: "#fff", boxShadow: "0 2px 8px rgba(15,23,42,.25)", transition: "transform .2s ease" };
const input: React.CSSProperties = { position: "absolute", inset: 0, opacity: 0, cursor: "pointer" };
const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 850 };
