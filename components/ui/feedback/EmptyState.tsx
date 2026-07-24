import { playbookTheme } from "@/lib/design-system/tokens";

export type EmptyStateProps = { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode };

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return <div style={root}>{icon && <div style={iconStyle}>{icon}</div>}<h3 style={titleStyle}>{title}</h3>{description && <p style={desc}>{description}</p>}{action}</div>;
}
const root: React.CSSProperties = { border: `1px dashed ${playbookTheme.colors.line}`, borderRadius: playbookTheme.radius.lg, padding: 32, textAlign: "center", background: "rgba(255,255,255,.72)", color: playbookTheme.colors.ink };
const iconStyle: React.CSSProperties = { margin: "0 auto 12px", width: 44, height: 44, borderRadius: 999, background: playbookTheme.colors.orangeSoft, color: playbookTheme.colors.orange, display: "flex", alignItems: "center", justifyContent: "center" };
const titleStyle: React.CSSProperties = { margin: 0, fontSize: 20 };
const desc: React.CSSProperties = { margin: "8px auto 18px", color: playbookTheme.colors.muted, maxWidth: 520, lineHeight: 1.5 };
