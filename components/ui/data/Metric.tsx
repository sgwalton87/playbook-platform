import { playbookTheme } from "@/lib/design-system/tokens";

export type MetricProps = { label: string; value: React.ReactNode; helper?: React.ReactNode; tone?: "default" | "success" | "warning" | "danger" };

export function Metric({ label, value, helper, tone = "default" }: MetricProps) {
  return <div style={root}><span style={labelStyle}>{label}</span><strong style={{ ...valueStyle, color: toneColor[tone] }}>{value}</strong>{helper && <span style={helperStyle}>{helper}</span>}</div>;
}

const root: React.CSSProperties = { display: "grid", gap: 6 };
const labelStyle: React.CSSProperties = { color: playbookTheme.colors.muted, fontSize: 12, fontWeight: 850, textTransform: "uppercase", letterSpacing: ".08em" };
const valueStyle: React.CSSProperties = { color: playbookTheme.colors.ink, fontSize: 28, lineHeight: 1.1 };
const helperStyle: React.CSSProperties = { color: playbookTheme.colors.muted, fontSize: 13, lineHeight: 1.4 };
const toneColor = { default: playbookTheme.colors.ink, success: playbookTheme.colors.green, warning: playbookTheme.colors.orange, danger: playbookTheme.colors.red };
