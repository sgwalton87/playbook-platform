import { ButtonHTMLAttributes } from "react";
import { colors, radius } from "./theme";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export default function Button({
  variant = "primary",
  style,
  ...props
}: Props) {
  const primary = variant === "primary";

  return (
    <button
      {...props}
      style={{
        background: primary ? colors.primary : colors.surface,
        color: primary ? "#fff" : colors.text,
        border: primary
          ? "none"
          : `1px solid ${colors.border}`,
        borderRadius: radius.pill,
        padding: "12px 18px",
        fontWeight: 700,
        cursor: "pointer",
        transition: "all .2s ease",
        ...style,
      }}
    />
  );
}
