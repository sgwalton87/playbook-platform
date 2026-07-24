import { playbookTheme } from "@/lib/design-system/tokens";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & { label: React.ReactNode; helperText?: string };

export function Checkbox({ label, helperText, style, ...props }: CheckboxProps) {
  return <label style={{ ...root, ...style }}><input type="checkbox" {...props} style={box} /><span><span style={labelStyle}>{label}</span>{helperText && <span style={help}>{helperText}</span>}</span></label>;
}
const root: React.CSSProperties = { display: "inline-flex", alignItems: "flex-start", gap: 10, color: playbookTheme.colors.ink, cursor: "pointer" };
const box: React.CSSProperties = { width: 18, height: 18, accentColor: playbookTheme.colors.orange, marginTop: 1 };
const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 850 };
const help: React.CSSProperties = { display: "block", color: playbookTheme.colors.muted, fontSize: 12, marginTop: 3 };
