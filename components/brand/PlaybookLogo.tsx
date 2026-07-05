import Image from "next/image";

type PlaybookLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
  variant?: "mark" | "hero";
};

export default function PlaybookLogo({
  size = 44,
  className = "",
  priority = false,
  variant = "mark",
}: PlaybookLogoProps) {
  const isHero = variant === "hero";

  return (
    <Image
      src="/brand/playbook-logo.png"
      alt="The Playbook — Run It!"
      width={isHero ? 320 : size}
      height={isHero ? 320 : size}
      priority={priority}
      className={className}
      style={{
        width: isHero ? "min(320px, 80vw)" : size,
        height: isHero ? "auto" : size,
        objectFit: "contain",
        flexShrink: 0,
      }}
    />
  );
}
