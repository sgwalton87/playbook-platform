import PlaybookLogo from "@/components/brand/PlaybookLogo";

type Props = {
  eyebrow?: string;
  title: string;
  body: string;
  imageSrc?: string;
  imageAlt?: string;
};

export default function PlaybookStoryBanner({
  eyebrow = "The Playbook",
  title,
  body,
  imageSrc,
  imageAlt = "",
}: Props) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: imageSrc ? "repeat(auto-fit,minmax(280px,1fr))" : "1fr",
        background: "#0F172A",
        borderRadius: 28,
        overflow: "hidden",
        minHeight: 320,
        boxShadow: "0 18px 42px rgba(15,23,42,.10)",
      }}
    >
      <div style={copyWrap}>
        <div style={{ marginBottom: 22 }}>
          <PlaybookLogo size={54} priority />
        </div>

        <div style={eyebrowStyle}>{eyebrow}</div>

        <h2 style={titleStyle}>{title}</h2>

        <p style={bodyStyle}>{body}</p>
      </div>

      {imageSrc && (
        <div style={{ minHeight: 320 }}>
          <img src={imageSrc} alt={imageAlt} style={imageStyle} />
        </div>
      )}
    </section>
  );
}

const copyWrap: React.CSSProperties = {
  padding: "clamp(28px,5vw,54px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "#F97316",
  marginBottom: 12,
};

const titleStyle: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontWeight: 400,
  fontSize: "clamp(34px,5vw,60px)",
  lineHeight: .98,
  textTransform: "uppercase",
  color: "#F8F7F4",
  margin: "0 0 16px",
};

const bodyStyle: React.CSSProperties = {
  maxWidth: 650,
  fontSize: 16,
  lineHeight: 1.7,
  color: "rgba(248,247,244,.70)",
  margin: 0,
};

const imageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 320,
  objectFit: "cover",
  display: "block",
};
