"use client";

export default function ProfileAvatar({
  src,
  name,
  size = 76,
}: {
  src?: string | null;
  name?: string | null;
  size?: number;
}) {
  const initials =
    name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "PB";

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        background: "#ff6a2c",
        color: "#100c0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 900,
        fontSize: size * 0.32,
        border: "3px solid #ff6a2c",
        flexShrink: 0,
      }}
    >
      {src ? (
        <img
          src={src}
          alt={name || "Profile"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        initials
      )}
    </div>
  );
}