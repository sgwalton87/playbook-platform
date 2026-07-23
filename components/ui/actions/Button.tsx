"use client";

import * as React from "react";
import { THEME } from "@/lib/design-system";
import { cn } from "../utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  children,
  disabled,
  style,
  ...props
}: ButtonProps) {

  const variants = {
    primary: {
      background: THEME.colors.primary,
      color: "#fff",
      border: "none",
    },
    secondary: {
      background: THEME.colors.surface,
      color: THEME.colors.text,
      border: `1px solid ${THEME.colors.border}`,
    },
    outline: {
      background: "transparent",
      color: THEME.colors.primary,
      border: `2px solid ${THEME.colors.primary}`,
    },
    ghost: {
      background: "transparent",
      color: THEME.colors.text,
      border: "none",
    },
    danger: {
      background: THEME.colors.error,
      color: "#fff",
      border: "none",
    },
  };

  const sizes = {
    sm: {
      padding: "8px 14px",
      fontSize: "14px",
    },
    md: {
      padding: "12px 20px",
      fontSize: "15px",
    },
    lg: {
      padding: "16px 28px",
      fontSize: "16px",
    },
  };

  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(className)}
      style={{
        ...variants[variant],
        ...sizes[size],

        width: fullWidth ? "100%" : undefined,

        borderRadius: THEME.componentRadius.button,

        boxShadow: THEME.componentShadows.button,

        transition: THEME.transitions.all,

        cursor: disabled ? "not-allowed" : "pointer",

        display: "inline-flex",

        alignItems: "center",

        justifyContent: "center",

        gap: 8,

        fontFamily: THEME.fontFamily.sans,

        fontWeight: THEME.fontWeight.semibold,

        opacity: disabled ? 0.6 : 1,

        ...style,
      }}
    >
      {loading ? (
        <>Loading...</>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </button>
  );
}

export default Button;
