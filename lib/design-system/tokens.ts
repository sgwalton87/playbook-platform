export const playbookTheme = {
  colors: {
    ink: "#06172D",
    slate: "#203047",
    muted: "#64748B",
    line: "#E2E8F0",
    canvas: "transparent",
    card: "rgba(255,255,255,.90)",
    orange: "#C2410C",
    orangeBright: "#F97316",
    orangeOnDark: "#FDBA74",
    orangeSoft: "#FFF7ED",
    orangeLine: "#FED7AA",
    green: "#10B981",
    blue: "#2563EB",
    red: "#DC2626",
  },
  radius: {
    sm: 12,
    md: 18,
    lg: 24,
    xl: 34,
    pill: 999,
  },
  shadow: {
    card: "0 18px 46px rgba(6,23,45,.09)",
    hero: "0 34px 90px rgba(3,16,35,.28)",
  },
  layout: {
    max: 1180,
    pagePadding: 32,
  },
};

export const pageShellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: playbookTheme.colors.canvas,
  padding: playbookTheme.layout.pagePadding,
  fontFamily: "var(--pb-font)",
};

export const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: playbookTheme.colors.orange,
  fontWeight: 950,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};
