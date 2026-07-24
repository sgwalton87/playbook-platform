import { playbookTheme } from "@/lib/design-system/tokens";

export type AlertTone = "info" | "success" | "warning" | "danger";
export type AlertProps = React.HTMLAttributes<HTMLDivElement> & { tone?: AlertTone; title?: string };

export function Alert({ tone = "info", title, children, style, ...props }: AlertProps) {
  return <div role="status" {...props} style={{ ...base, ...tones[tone], ...style }}>{title && <strong style={titleStyle}>{title}</strong>}<div>{children}</div></div>;
}
const base: React.CSSProperties = { borderRadius: playbookTheme.radius.md, border: "1px solid", padding: 14, display: "grid", gap: 6, fontSize: 14, lineHeight: 1.5 };
const titleStyle: React.CSSProperties = { color: "inherit" };
const tones = { info: { background: "#EFF6FF", borderColor: "#BFDBFE", color: "#1E3A8A" }, success: { background: "#ECFDF5", borderColor: "#A7F3D0", color: "#065F46" }, warning: { background: playbookTheme.colors.orangeSoft, borderColor: playbookTheme.colors.orangeLine, color: "#9A3412" }, danger: { background: "#FEF2F2", borderColor: "#FECACA", color: "#991B1B" } };
