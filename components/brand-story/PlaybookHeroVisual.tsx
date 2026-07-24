import Image from "next/image";
type Props = {
  image: string;
  alt: string;
};

export default function PlaybookHeroVisual({ image, alt }: Props) {
  return (
    <div
      style={{
        borderRadius: 28,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 18px 42px rgba(15,23,42,.10)",
        background: "#0F172A",
        minHeight: 280,
      }}
    >
      <Image unoptimized width={1200} height={800}
        src={image}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          minHeight: 280,
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}
