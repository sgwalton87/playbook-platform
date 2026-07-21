import { CSSProperties, ReactNode } from "react";
import { colors, radius } from "./theme";

type CardProps = {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
};

export default function Card({
  children,
  style,
  onClick,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: colors.surfaceAlt,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.xl,
        boxShadow: "0 10px 30px rgba(15,23,42,.05)",
        overflow: "hidden",
        transition: "all .25s ease",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
