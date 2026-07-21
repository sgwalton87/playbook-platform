import { playbookTheme } from "./tokens";
import type { CSSProperties } from "react";

export const pageStyle: CSSProperties = {
  maxWidth: playbookTheme.layout.max,
  margin: "0 auto",
};

export const heroStyle: CSSProperties = {
  maxWidth: playbookTheme.layout.max,
  margin: "0 auto 18px",
  background: playbookTheme.colors.ink,
  color: "#FFFFFF",
  borderRadius: playbookTheme.radius.xl,
  padding: 36,
  boxShadow: playbookTheme.shadow.hero,
};
