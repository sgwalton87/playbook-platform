export const playbookTheme = {
  colors: {
    ink: "#0F172A",
    slate: "#334155",
    muted: "#64748B",

    canvas: "#F8F7F4",
    card: "#FFFFFF",

    line: "#E2E8F0",

    orange: "#F97316",
    orangeSoft: "#FFF7ED",
    orangeLine: "#FED7AA",

    green: "#10B981",
    blue: "#2563EB",
    red: "#DC2626",

    white: "#FFFFFF",
    black: "#000000",
  },

  radius: {
    xs: 8,
    sm: 12,
    md: 18,
    lg: 24,
    xl: 30,
    pill: 999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  typography: {
    hero: 54,
    h1: 40,
    h2: 30,
    h3: 22,
    body: 16,
    small: 13,
    eyebrow: 11,
  },

  shadow: {
    card: "0 16px 40px rgba(15,23,42,.06)",
    hero: "0 24px 70px rgba(15,23,42,.16)",
    hover: "0 20px 48px rgba(15,23,42,.10)",
  },

  layout: {
    max: 1180,
    pagePadding: 32,
    sectionGap: 24,
    cardGap: 16,
  },
};

export const pageShellStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: playbookTheme.colors.canvas,
  padding: playbookTheme.layout.pagePadding,
  fontFamily: "system-ui, sans-serif",
};

