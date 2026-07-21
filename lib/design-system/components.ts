import { playbookTheme } from "./tokens";
import type { CSSProperties } from "react";

export const cardStyle: CSSProperties = {
  background: playbookTheme.colors.card,
  border: `1px solid ${playbookTheme.colors.line}`,
  borderRadius: playbookTheme.radius.lg,
  padding: 24,
  boxShadow: playbookTheme.shadow.card,
};

export const metricStyle: CSSProperties = {
  background: playbookTheme.colors.card,
  border: `1px solid ${playbookTheme.colors.line}`,
  borderRadius: playbookTheme.radius.md,
  padding: 18,
};

export const buttonStyle: CSSProperties = {
  display: "inline-flex",
  background: playbookTheme.colors.orange,
  color: "#FFFFFF",
  borderRadius: playbookTheme.radius.pill,
  padding: "10px 14px",
  textDecoration: "none",
  fontWeight: 950,
};

export const secondaryButtonStyle: CSSProperties = {
  ...buttonStyle,
  background: "#FFFFFF",
  color: playbookTheme.colors.ink,
};
