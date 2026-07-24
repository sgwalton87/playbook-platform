import { playbookTheme } from "@/lib/design-system/tokens";

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & { size?: "default" | "narrow" | "wide" };

export function Container({ size = "default", style, ...props }: ContainerProps) {
  return <div {...props} style={{ ...base, maxWidth: widths[size], ...style }} />;
}
const base: React.CSSProperties = { width: "100%", boxSizing: "border-box", margin: "0 auto", paddingInline: playbookTheme.layout.pagePadding };
const widths = { narrow: 820, default: playbookTheme.layout.max, wide: 1360 };
