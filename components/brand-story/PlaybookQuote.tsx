type Props = {
  quote: string;
  attribution?: string;
  eyebrow?: string;
};

export default function PlaybookQuote({
  quote,
  attribution,
  eyebrow = "The Playbook",
}: Props) {
  return (
    <section style={wrap}>
      <div style={quoteMark}>“</div>

      <div style={eyebrowStyle}>{eyebrow}</div>

      <blockquote style={quoteStyle}>{quote}</blockquote>

      {attribution && <div style={attributionStyle}>— {attribution}</div>}
    </section>
  );
}

const wrap: React.CSSProperties = {
  background: "#0F172A",
  borderRadius: 24,
  padding: "clamp(24px,4vw,42px)",
  position: "relative",
  overflow: "hidden",
};

const quoteMark: React.CSSProperties = {
  position: "absolute",
  right: 24,
  top: -34,
  fontFamily: "Georgia, serif",
  fontSize: 170,
  lineHeight: 1,
  color: "rgba(249,115,22,.12)",
};

const eyebrowStyle: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 9,
  fontWeight: 900,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  color: "#F97316",
  marginBottom: 14,
};

const quoteStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: 820,
  fontFamily: "'Anton', sans-serif",
  fontSize: "clamp(26px,4vw,44px)",
  fontWeight: 400,
  lineHeight: 1.08,
  textTransform: "uppercase",
  color: "#F8F7F4",
};

const attributionStyle: React.CSSProperties = {
  marginTop: 16,
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  color: "rgba(248,247,244,.58)",
};
