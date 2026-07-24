import Image from "next/image";
type Props = {
  imageSrc: string;
  title: string;
  body: string;
  eyebrow?: string;
};

export default function PlaybookImageCard({
  imageSrc,
  title,
  body,
  eyebrow = "Scholar story",
}: Props) {
  return (
    <article style={card}>
      <Image unoptimized width={1200} height={800} src={imageSrc} alt="" style={image} />
      <div style={content}>
        <div style={eyebrowStyle}>{eyebrow}</div>
        <h3 style={titleStyle}>{title}</h3>
        <p style={bodyStyle}>{body}</p>
      </div>
    </article>
  );
}

const card: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 24,
  overflow: "hidden",
  boxShadow: "0 12px 30px rgba(15,23,42,.04)",
};

const image: React.CSSProperties = {
  width: "100%",
  height: 190,
  objectFit: "cover",
  display: "block",
};

const content: React.CSSProperties = {
  padding: 18,
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  color: "#F97316",
  marginBottom: 8,
};

const titleStyle: React.CSSProperties = {
  color: "#0F172A",
  fontSize: 18,
  margin: "0 0 8px",
};

const bodyStyle: React.CSSProperties = {
  color: "#64748B",
  lineHeight: 1.6,
  margin: 0,
  fontSize: 14,
};
