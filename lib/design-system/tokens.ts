export const playbookTheme = {
  colors: {
    ink: "#0F172A",
    slate: "#334155",
    muted: "#64748B",
    line: "#E2E8F0",
    canvas: "#F8F7F4",
    card: "#FFFFFF",
    orange: "#F97316",
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
    xl: 30,
    pill: 999,
  },
  shadow: {
    card: "0 16px 40px rgba(15,23,42,.06)",
    hero: "0 24px 70px rgba(15,23,42,.16)",
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
  fontFamily: "system-ui, sans-serif",
};

export const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: playbookTheme.colors.orange,
  fontWeight: 950,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};
