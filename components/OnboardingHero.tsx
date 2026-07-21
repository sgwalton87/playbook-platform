"use client";

type Props = {
  eyebrow: string;
  title: string;
  quote: string;
  description: string;
  icon: string;
};

export default function OnboardingHero({
  eyebrow,
  title,
  quote,
  description,
  icon,
}: Props) {
  return (
    <div
      style={{
        marginBottom: 28,
        background: "linear-gradient(135deg,#F97316,#FB923C)",
        borderRadius: 22,
        padding: 28,
        color: "#fff",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 20px 45px rgba(249,115,22,.25)"
      }}
    >
      <div
        style={{
          position:"absolute",
          right:-20,
          top:-20,
          fontSize:110,
          opacity:.08
        }}
      >
        {icon}
      </div>

      <div
        style={{
          fontSize:11,
          fontWeight:700,
          letterSpacing:".18em",
          textTransform:"uppercase",
          marginBottom:10
        }}
      >
        {eyebrow}
      </div>

      <div
        style={{
          display:"flex",
          alignItems:"center",
          gap:16,
          marginBottom:14
        }}
      >
        <div
          style={{
            width:60,
            height:60,
            borderRadius:16,
            background:"rgba(255,255,255,.18)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            fontSize:30
          }}
        >
          {icon}
        </div>

        <h1
          style={{
            margin:0,
            fontSize:34,
            lineHeight:1,
            fontWeight:800
          }}
        >
          {title}
        </h1>
      </div>

      <p
        style={{
          margin:"0 0 16px",
          fontStyle:"italic",
          fontWeight:600,
          fontSize:17
        }}
      >
        "{quote}"
      </p>

      <p
        style={{
          margin:0,
          lineHeight:1.75,
          maxWidth:760,
          color:"rgba(255,255,255,.95)"
        }}
      >
        {description}
      </p>
    </div>
  );
}
