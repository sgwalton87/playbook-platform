import { playbookTheme } from "@/lib/design-system/tokens";

export type DividerProps = React.HTMLAttributes<HTMLHRElement> & { spacing?: number };

export function Divider({ spacing = 20, style, ...props }: DividerProps) {
  return <hr {...props} style={{ border: 0, borderTop: `1px solid ${playbookTheme.colors.line}`, margin: `${spacing}px 0`, ...style }} />;
}
