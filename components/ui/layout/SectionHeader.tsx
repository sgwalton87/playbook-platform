import { eyebrowStyle, playbookTheme } from "@/lib/design-system/tokens";

export type SectionHeaderProps = { eyebrow?: string; title: string; subtitle?: string; actions?: React.ReactNode };

export function SectionHeader({ eyebrow, title, subtitle, actions }: SectionHeaderProps) {
  return <header style={root}><div>{eyebrow && <p style={eyebrowStyle}>{eyebrow}</p>}<h2 style={titleStyle}>{title}</h2>{subtitle && <p style={subtitleStyle}>{subtitle}</p>}</div>{actions && <div style={actionsStyle}>{actions}</div>}</header>;
}
const root: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, marginBottom: 16 };
const titleStyle: React.CSSProperties = { margin: "6px 0 0", color: playbookTheme.colors.ink, fontSize: 28, lineHeight: 1.1 };
const subtitleStyle: React.CSSProperties = { margin: "8px 0 0", color: playbookTheme.colors.muted, fontSize: 15, lineHeight: 1.5, maxWidth: 760 };
const actionsStyle: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };
