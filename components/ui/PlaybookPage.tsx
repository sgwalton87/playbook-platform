"use client";

import { pageShellStyle, playbookTheme } from "@/lib/design-system/tokens";

export function PlaybookPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main style={pageShellStyle}>{children}</main>;
}

export function PlaybookHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section style={hero}>
      <p style={eyebrowStyle}>{eyebrow}</p>
      <h1 style={titleStyle}>{title}</h1>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
      {children}
    </section>
  );
}

export function PlaybookCard({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <article style={card}>
      {eyebrow && <p style={eyebrowStyle}>{eyebrow}</p>}
      {title && <h2 style={cardTitle}>{title}</h2>}
      {children}
    </article>
  );
}

export function PlaybookMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <article style={metric}>
      <span style={metricLabel}>{label}</span>
      <strong style={metricValue}>{value}</strong>
    </article>
  );
}

export function PlaybookButton({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <a href={href} style={variant === "primary" ? button : secondaryButton}>
      {children}
    </a>
  );
}

const eyebrowStyle: React.CSSProperties = {
  margin: 0,
  color: playbookTheme.colors.orange,
  fontWeight: 950,
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
};

const hero: React.CSSProperties = {
  maxWidth: playbookTheme.layout.max,
  margin: "0 auto 18px",
  background: playbookTheme.colors.ink,
  color: "#FFFFFF",
  borderRadius: playbookTheme.radius.xl,
  padding: 36,
  boxShadow: playbookTheme.shadow.hero,
};

const titleStyle: React.CSSProperties = {
  margin: "12px 0",
  fontSize: 54,
  lineHeight: 1,
};

const subtitleStyle: React.CSSProperties = {
  color: "#CBD5E1",
  fontSize: 17,
  lineHeight: 1.6,
  maxWidth: 780,
};

const card: React.CSSProperties = {
  background: playbookTheme.colors.card,
  border: `1px solid ${playbookTheme.colors.line}`,
  borderRadius: playbookTheme.radius.lg,
  padding: 24,
  boxShadow: playbookTheme.shadow.card,
};

const cardTitle: React.CSSProperties = {
  color: playbookTheme.colors.ink,
  fontSize: 26,
  margin: "8px 0 14px",
};

const metric: React.CSSProperties = {
  background: playbookTheme.colors.card,
  border: `1px solid ${playbookTheme.colors.line}`,
  borderRadius: playbookTheme.radius.md,
  padding: 18,
};

const metricLabel: React.CSSProperties = {
  color: playbookTheme.colors.muted,
  fontSize: 12,
  fontWeight: 850,
};

const metricValue: React.CSSProperties = {
  display: "block",
  color: playbookTheme.colors.ink,
  fontSize: 26,
  marginTop: 8,
};

const button: React.CSSProperties = {
  display: "inline-flex",
  background: playbookTheme.colors.orange,
  color: "#FFFFFF",
  borderRadius: playbookTheme.radius.pill,
  padding: "10px 14px",
  textDecoration: "none",
  fontWeight: 950,
};

const secondaryButton: React.CSSProperties = {
  ...button,
  background: "#FFFFFF",
  color: playbookTheme.colors.ink,
};
