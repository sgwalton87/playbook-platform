import { playbookTheme } from "@/lib/design-system/tokens";

export type AvatarProps = {
  name: string;
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg" | number;
  status?: "online" | "away" | "offline";
};

const sizes = { sm: 32, md: 44, lg: 64 };

export function Avatar({ name, src, alt, size = "md", status }: AvatarProps) {
  const pixelSize = typeof size === "number" ? size : sizes[size];
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "PB";

  return (
    <span style={{ ...wrap, width: pixelSize, height: pixelSize }} aria-label={alt ?? name}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt ?? name} style={image} />
      ) : (
        <span style={{ fontSize: Math.max(11, pixelSize * 0.34) }}>{initials}</span>
      )}
      {status && <span aria-label={status} style={{ ...dot, background: statusColor[status] }} />}
    </span>
  );
}

const wrap: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: playbookTheme.radius.pill,
  border: `2px solid ${playbookTheme.colors.card}`,
  background: playbookTheme.colors.orangeSoft,
  color: playbookTheme.colors.ink,
  fontWeight: 950,
  overflow: "hidden",
  boxShadow: "0 8px 20px rgba(15,23,42,.08)",
};

const image: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover" };
const dot: React.CSSProperties = { position: "absolute", right: 1, bottom: 1, width: 10, height: 10, borderRadius: 999, border: "2px solid #fff" };
const statusColor = { online: playbookTheme.colors.green, away: playbookTheme.colors.orange, offline: playbookTheme.colors.muted };
