import { playbookTheme } from "@/lib/design-system/tokens";

export type CardProps = React.HTMLAttributes<HTMLElement> & { as?: "article" | "section" | "div"; padding?: number };

export function Card({ as: Component = "article", padding = 24, style, ...props }: CardProps) {
  return <Component {...props} style={{ ...card, padding, ...style }} />;
}
const card: React.CSSProperties = { background: playbookTheme.colors.card, border: `1px solid ${playbookTheme.colors.line}`, borderRadius: playbookTheme.radius.lg, boxShadow: playbookTheme.shadow.card };
