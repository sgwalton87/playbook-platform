"use client";

import { pageShellStyle, playbookTheme } from "@/lib/design-system/tokens";
import ExperienceModeBanner from "@/components/experience/ExperienceModeBanner";

export function PlaybookPage({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main style={normalizedPageStyle} data-visual-canon="PGDS-001" data-playbook-surface="role-os-dashboard">
      <ExperienceModeBanner />
      {children}
    </main>
  );
}

const normalizedPageStyle: React.CSSProperties = {
  ...pageShellStyle,
  paddingTop: 24,
  paddingBottom: 36,
};

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
      <p style={heroEyebrowStyle}>{eyebrow}</p>
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

const heroEyebrowStyle: React.CSSProperties = {
  ...eyebrowStyle,
  color: playbookTheme.colors.orangeOnDark,
};

const hero: React.CSSProperties = {
  maxWidth: playbookTheme.layout.max,
  margin: "0 auto 18px",
  background: "radial-gradient(circle at 88% 0%,rgba(249,115,22,.24),transparent 22rem),radial-gradient(circle at 20% 100%,rgba(86,67,120,.28),transparent 24rem),linear-gradient(135deg,#06172D,#0B2648 58%,#031023)",
  color: "#FFFFFF",
  border: "1px solid rgba(255,255,255,.14)",
  borderRadius: "34px 8px 34px 8px",
  padding: "clamp(30px,5vw,58px)",
  boxShadow: playbookTheme.shadow.hero,
};

const titleStyle: React.CSSProperties = {
  margin: "12px 0",
  fontFamily: "Anton, var(--pb-font)",
  fontSize: "clamp(46px,7vw,86px)",
  fontWeight: 400,
  lineHeight: .92,
  letterSpacing: "-.015em",
  textTransform: "uppercase",
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
  backdropFilter: "blur(16px)",
  borderRadius: "24px 6px 24px 6px",
  padding: 24,
  boxShadow: playbookTheme.shadow.card,
};

const cardTitle: React.CSSProperties = {
  color: playbookTheme.colors.ink,
  fontSize: 28,
  lineHeight: 1.08,
  margin: "8px 0 14px",
};

const metric: React.CSSProperties = {
  background: playbookTheme.colors.card,
  border: `1px solid ${playbookTheme.colors.line}`,
  borderRadius: "20px 6px 20px 6px",
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
  borderRadius: 9,
  padding: "13px 18px",
  textDecoration: "none",
  fontWeight: 950,
};

const secondaryButton: React.CSSProperties = {
  ...button,
  background: "#FFFFFF",
  color: playbookTheme.colors.ink,
};

export function PlaybookGrid({
  children,
  min = 280,
}: {
  children: React.ReactNode;
  min?: number;
}) {
  return (
    <section
      style={{
        maxWidth: playbookTheme.layout.max,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit,minmax(${min}px,1fr))`,
        gap: 16,
      }}
    >
      {children}
    </section>
  );
}

export function PlaybookMetrics({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        maxWidth: playbookTheme.layout.max,
        margin: "0 auto 18px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
        gap: 14,
      }}
    >
      {children}
    </section>
  );
}

export function PlaybookPill({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        background: playbookTheme.colors.orangeSoft,
        border: `1px solid ${playbookTheme.colors.orangeLine}`,
        color: "#9A3412",
        borderRadius: playbookTheme.radius.pill,
        padding: "6px 9px",
        fontSize: 11,
        fontWeight: 900,
        textTransform: "uppercase",
      }}
    >
      {children}
    </span>
  );
}

export function PlaybookSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        maxWidth: playbookTheme.layout.max,
        margin: "0 auto 18px",
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {children}
    </section>
  );
}

export function PlaybookStack({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gap: 14,
        width: "100%",
      }}
    >
      {children}
    </div>
  );
}

export function PlaybookMobileNotice() {
  return (
    <div
      style={{
        display: "none",
      }}
      data-playbook-mobile-ready="true"
    />
  );
}
