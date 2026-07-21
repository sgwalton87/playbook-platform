import { playbookTheme } from "./tokens";
import type { CSSProperties } from "react";

export const eyebrowStyle: CSSProperties = {
  margin: 0,
  color: playbookTheme.colors.orange,
  fontWeight: 950,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

export const titleStyle: CSSProperties = {
  margin: "12px 0",
  fontSize: 54,
  lineHeight: 1,
};

export const subtitleStyle: CSSProperties = {
  color: "#CBD5E1",
  fontSize: 17,
  lineHeight: 1.6,
  maxWidth: 780,
};

export const cardTitleStyle: CSSProperties = {
  color: playbookTheme.colors.ink,
  fontSize: 26,
  margin: "8px 0 14px",
};

export const metricLabelStyle: CSSProperties = {
  color: playbookTheme.colors.muted,
  fontSize: 12,
  fontWeight: 850,
};

export const metricValueStyle: CSSProperties = {
  display: "block",
  color: playbookTheme.colors.ink,
  fontSize: 26,
  marginTop: 8,
};
