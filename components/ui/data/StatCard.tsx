import { playbookTheme } from "@/lib/design-system/tokens";
import { Metric, type MetricProps } from "./Metric";

export type StatCardProps = MetricProps & { icon?: React.ReactNode; footer?: React.ReactNode };

export function StatCard({ icon, footer, ...metric }: StatCardProps) {
  return <article style={card}>{icon && <div style={iconStyle}>{icon}</div>}<Metric {...metric} />{footer && <div style={footerStyle}>{footer}</div>}</article>;
}

const card: React.CSSProperties = { background: playbookTheme.colors.card, border: `1px solid ${playbookTheme.colors.line}`, borderRadius: playbookTheme.radius.lg, padding: 20, boxShadow: playbookTheme.shadow.card, display: "grid", gap: 14 };
const iconStyle: React.CSSProperties = { width: 38, height: 38, borderRadius: playbookTheme.radius.md, background: playbookTheme.colors.orangeSoft, color: playbookTheme.colors.orange, display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 950 };
const footerStyle: React.CSSProperties = { borderTop: `1px solid ${playbookTheme.colors.line}`, paddingTop: 12, color: playbookTheme.colors.muted, fontSize: 13 };
