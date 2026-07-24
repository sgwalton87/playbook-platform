"use client";

import { playbookTheme } from "@/lib/design-system/tokens";

export type IconButtonVariant = "primary" | "secondary" | "ghost";
export type IconButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & { icon: React.ReactNode; label: string; variant?: IconButtonVariant; size?: "sm" | "md" | "lg" };

export function IconButton({ icon, label, variant = "secondary", size = "md", style, ...props }: IconButtonProps) {
  return <button type="button" aria-label={label} title={label} {...props} style={{ ...base, ...sizes[size], ...variants[variant], ...style }}>{icon}</button>;
}

const base: React.CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", borderRadius: playbookTheme.radius.pill, fontWeight: 950, cursor: "pointer", transition: "transform .15s ease, box-shadow .15s ease, background .15s ease" };
const sizes = { sm: { width: 34, height: 34 }, md: { width: 42, height: 42 }, lg: { width: 50, height: 50 } };
const variants: Record<IconButtonVariant, React.CSSProperties> = {
  primary: { border: "none", background: playbookTheme.colors.orange, color: "#FFFFFF", boxShadow: "0 10px 24px rgba(249,115,22,.24)" },
  secondary: { border: `1px solid ${playbookTheme.colors.line}`, background: playbookTheme.colors.card, color: playbookTheme.colors.ink },
  ghost: { border: "1px solid transparent", background: "transparent", color: playbookTheme.colors.slate },
};
