import { playbookTheme } from "@/lib/design-system/tokens";

export type BadgeVariant = "neutral" | "brand" | "success" | "info" | "danger";
export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant };

export function Badge({ variant = "neutral", style, ...props }: BadgeProps) {
  return <span {...props} style={{ ...base, ...variants[variant], ...style }} />;
}

const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, borderRadius: playbookTheme.radius.pill, padding: "6px 10px", fontSize: 12, fontWeight: 900, lineHeight: 1, whiteSpace: "nowrap" };
const variants: Record<BadgeVariant, React.CSSProperties> = {
  neutral: { background: "#F1F5F9", color: playbookTheme.colors.slate, border: `1px solid ${playbookTheme.colors.line}` },
  brand: { background: playbookTheme.colors.orangeSoft, color: "#9A3412", border: `1px solid ${playbookTheme.colors.orangeLine}` },
  success: { background: "#ECFDF5", color: "#047857", border: "1px solid #A7F3D0" },
  info: { background: "#EFF6FF", color: "#1D4ED8", border: "1px solid #BFDBFE" },
  danger: { background: "#FEF2F2", color: playbookTheme.colors.red, border: "1px solid #FECACA" },
};
