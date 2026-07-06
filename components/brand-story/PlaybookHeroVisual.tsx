type Props = {
  image: string;
  alt: string;
};

export default function PlaybookHeroVisual({ image, alt }: Props) {
  return (
    <div
      style={{
        margin: "18px 0 24px",
        borderRadius: 28,
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 18px 42px rgba(15,23,42,.10)",
        background: "#0F172A",
      }}
    >
      <img
        src={image}
        alt={alt}
        style={{
          width: "100%",
          height: "clamp(220px, 32vw, 380px)",
          objectFit: "cover",
          display: "block",
        }}
      />
    </div>
  );
}
