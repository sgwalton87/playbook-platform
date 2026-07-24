"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { FOUNDER_QUARTERS, getFounderQuarter } from "@/lib/founder-demo";

export default function FounderCaseStudyPage() {
  const router = useRouter();
  const [quarterIndex, setQuarterIndex] = useState(0);
  const quarter = getFounderQuarter(quarterIndex);
  const isFirst = quarterIndex === 0;
  const isLast = quarterIndex === FOUNDER_QUARTERS.length - 1;

  function goToQuarter(index: number) {
    setQuarterIndex(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const heroImage = quarter.images[0];
  const storyImages = quarter.images.slice(1, 7);
  const evidenceImages = quarter.images.slice(7);

  return (
    <main style={{ minHeight: "100vh", background: "#F8F7F4", color: "#0F172A" }}>
      <header style={header}>
        <div style={headerInner}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <PlaybookLogo size={52} priority />
            <div>
              <strong style={{ fontSize: 18 }}>Founder Demo Mode</strong>
              <div style={tiny}>Four Quarters · The Playbook Origin Story</div>
            </div>
          </div>

          <button onClick={() => router.push("/dashboard")} style={outlineButton}>
            Exit Demo
          </button>
        </div>
      </header>

      <div style={{ maxWidth: 1480, margin: "0 auto", padding: "24px" }}>
        <nav style={nav}>
          {FOUNDER_QUARTERS.map((q, index) => {
            const active = index === quarterIndex;

            return (
              <button
                key={q.id}
                onClick={() => goToQuarter(index)}
                style={{
                  ...navButton,
                  background: active ? "#0F172A" : "#FFFFFF",
                  color: active ? "#FFFFFF" : "#0F172A",
                  borderColor: active ? "#0F172A" : "#E2E8F0",
                }}
              >
                {q.quarter}
              </button>
            );
          })}
        </nav>

        <section style={hero}>
          <div style={heroCopy}>
            <div style={eyebrow}>{quarter.quarter}</div>
            <h1 style={h1}>{quarter.title}</h1>
            <p style={subtitle}>{quarter.subtitle}</p>
          </div>

          <div style={heroImageFrame}>
            <Image unoptimized width={1200} height={800} src={heroImage} alt={`${quarter.quarter} archive`} style={heroImageStyle} />
          </div>
        </section>

        <section style={storyLayout}>
          <article style={storyCard}>
            <div style={eyebrow}>The Story</div>
            <p style={leadText}>{quarter.story}</p>

            {storyImages[0] && (
              <StoryImage
                src={storyImages[0]}
                caption="Archive evidence from this stage of the journey."
              />
            )}

            <p style={largeBody}>
              This is the kind of journey The Playbook is built to protect:
              the scholar has talent, evidence, relationships, decisions, and
              pressure — but no single system holding all of it together.
            </p>

            {storyImages[1] && (
              <StoryImage
                src={storyImages[1]}
                caption="The details matter: dates, letters, clippings, and records become part of the scholar's evidence."
              />
            )}

            <p style={largeBody}>
              When the support system is fragmented, opportunity depends too
              much on who already knows the rules. The Playbook turns that
              hidden navigation into visible next steps.
            </p>
          </article>

          <aside style={sideRail}>
            {storyImages.slice(2, 6).map((image, index) => (
              <figure key={image} style={railFigure}>
                <Image unoptimized width={1200} height={800} src={image} alt={`Founder archive ${index + 1}`} style={railImage} />
              </figure>
            ))}
          </aside>
        </section>

        <section style={connectionSection}>
          <div>
            <div style={eyebrow}>The Playbook Connection</div>
            <h2 style={sectionTitle}>Why this quarter matters</h2>
            <p style={connectionText}>{quarter.playbookLesson}</p>

            <button onClick={() => router.push(quarter.route)} style={primaryButton}>
              {quarter.routeLabel} →
            </button>
          </div>

          {evidenceImages[0] && (
            <div style={featuredEvidence}>
              <Image unoptimized width={1200} height={800} src={evidenceImages[0]} alt="Featured archive evidence" style={featuredImage} />
            </div>
          )}
        </section>

        <section style={quoteCard}>
          <div style={bigQuote}>“</div>
          <div style={eyebrow}>The Playbook</div>
          <blockquote style={quote}>{quarter.quote}</blockquote>
        </section>

        {evidenceImages.length > 1 && (
          <section style={{ marginTop: 24 }}>
            <div style={eyebrow}>More Archive Evidence</div>
            <div style={evidenceGrid}>
              {evidenceImages.slice(1).map((image) => (
                <figure key={image} style={evidenceCard}>
                  <Image unoptimized width={1200} height={800} src={image} alt="Founder archive evidence" style={evidenceImage} />
                </figure>
              ))}
            </div>
          </section>
        )}

        <footer style={footer}>
          <button
            onClick={() => goToQuarter(Math.max(0, quarterIndex - 1))}
            disabled={isFirst}
            style={{
              ...outlineButton,
              opacity: isFirst ? 0.35 : 1,
              cursor: isFirst ? "not-allowed" : "pointer",
            }}
          >
            ← Previous Quarter
          </button>

          <div style={tiny}>{quarterIndex + 1} / {FOUNDER_QUARTERS.length}</div>

          {isLast ? (
            <button onClick={() => router.push("/start")} style={primaryButton}>
              Enter The Playbook →
            </button>
          ) : (
            <button
              onClick={() => goToQuarter(Math.min(FOUNDER_QUARTERS.length - 1, quarterIndex + 1))}
              style={primaryButton}
            >
              Next Quarter →
            </button>
          )}
        </footer>
      </div>
    </main>
  );
}

function StoryImage({
  src,
  caption,
}: {
  src: string;
  caption: string;
}) {
  return (
    <figure style={storyFigure}>
      <Image unoptimized width={1200} height={800} src={src} alt="" style={storyImage} />
      <figcaption style={captionStyle}>{caption}</figcaption>
    </figure>
  );
}

const header: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(248,247,244,.96)",
  backdropFilter: "blur(14px)",
  borderBottom: "1px solid #E2E8F0",
};

const headerInner: React.CSSProperties = {
  maxWidth: 1480,
  margin: "0 auto",
  padding: "14px 24px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 14,
};

const tiny: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 10,
  color: "#64748B",
  textTransform: "uppercase",
  letterSpacing: ".12em",
};

const nav: React.CSSProperties = {
  display: "flex",
  gap: 10,
  overflowX: "auto",
  paddingBottom: 14,
  marginBottom: 20,
};

const navButton: React.CSSProperties = {
  flexShrink: 0,
  border: "1px solid #E2E8F0",
  borderRadius: 999,
  padding: "12px 18px",
  cursor: "pointer",
  fontFamily: "'Space Mono', monospace",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
};

const hero: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1fr) minmax(360px,.85fr)",
  background: "#0F172A",
  borderRadius: 34,
  overflow: "hidden",
  boxShadow: "0 18px 42px rgba(15,23,42,.14)",
};

const heroCopy: React.CSSProperties = {
  padding: "clamp(44px,6vw,88px)",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const eyebrow: React.CSSProperties = {
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: ".18em",
  textTransform: "uppercase",
  color: "#F97316",
  marginBottom: 14,
};

const h1: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontWeight: 400,
  fontSize: "clamp(58px,8vw,104px)",
  lineHeight: 0.9,
  textTransform: "uppercase",
  color: "#F8F7F4",
  margin: "0 0 22px",
};

const subtitle: React.CSSProperties = {
  fontSize: "clamp(22px,2.2vw,32px)",
  lineHeight: 1.35,
  color: "rgba(248,247,244,.78)",
  maxWidth: 820,
  fontWeight: 700,
};

const heroImageFrame: React.CSSProperties = {
  minHeight: 620,
  background: "radial-gradient(circle at 30% 20%, rgba(249,115,22,.16), transparent 32%), linear-gradient(145deg,#172033 0%,#0F172A 55%,#111827 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const heroImageStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  maxHeight: 760,
  objectFit: "contain",
  display: "block",
  filter: "drop-shadow(0 24px 42px rgba(0,0,0,.35))",
};

const storyLayout: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0,1.2fr) minmax(260px,.55fr)",
  gap: 22,
  marginTop: 24,
  alignItems: "start",
};

const storyCard: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 30,
  padding: "clamp(30px,5vw,58px)",
};

const leadText: React.CSSProperties = {
  color: "#0F172A",
  fontSize: "clamp(25px,3vw,38px)",
  lineHeight: 1.22,
  fontWeight: 850,
  letterSpacing: "-.02em",
  margin: "0 0 26px",
};

const largeBody: React.CSSProperties = {
  color: "#334155",
  fontSize: "clamp(20px,2vw,27px)",
  lineHeight: 1.5,
  fontWeight: 650,
  margin: "28px 0",
};

const storyFigure: React.CSSProperties = {
  margin: "28px 0",
  background: "#0F172A",
  borderRadius: 24,
  padding: 18,
};

const storyImage: React.CSSProperties = {
  width: "100%",
  maxHeight: 720,
  objectFit: "contain",
  display: "block",
  filter: "drop-shadow(0 24px 42px rgba(0,0,0,.35))",
  borderRadius: 16,
};

const captionStyle: React.CSSProperties = {
  color: "rgba(248,247,244,.65)",
  fontSize: 15,
  lineHeight: 1.5,
  marginTop: 12,
};

const sideRail: React.CSSProperties = {
  display: "grid",
  gap: 16,
  position: "sticky",
  top: 96,
};

const railFigure: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 24,
  padding: 12,
  margin: 0,
};

const railImage: React.CSSProperties = {
  width: "100%",
  maxHeight: 300,
  objectFit: "contain",
  display: "block",
  filter: "drop-shadow(0 24px 42px rgba(0,0,0,.35))",
  borderRadius: 16,
};

const connectionSection: React.CSSProperties = {
  marginTop: 24,
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))",
  gap: 22,
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 30,
  padding: "clamp(30px,5vw,58px)",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "'Anton', sans-serif",
  fontWeight: 400,
  fontSize: "clamp(38px,5vw,70px)",
  lineHeight: .96,
  textTransform: "uppercase",
  margin: "0 0 20px",
  color: "#0F172A",
};

const connectionText: React.CSSProperties = {
  color: "#334155",
  fontSize: "clamp(22px,2.3vw,32px)",
  lineHeight: 1.45,
  fontWeight: 750,
  margin: "0 0 24px",
};

const featuredEvidence: React.CSSProperties = {
  background: "#0F172A",
  borderRadius: 24,
  padding: 18,
};

const featuredImage: React.CSSProperties = {
  width: "100%",
  maxHeight: 620,
  objectFit: "contain",
  display: "block",
  filter: "drop-shadow(0 24px 42px rgba(0,0,0,.35))",
  borderRadius: 16,
};

const quoteCard: React.CSSProperties = {
  marginTop: 24,
  background: "#0F172A",
  borderRadius: 30,
  padding: "clamp(36px,5vw,70px)",
  position: "relative",
  overflow: "hidden",
};

const bigQuote: React.CSSProperties = {
  position: "absolute",
  right: 24,
  top: -48,
  fontFamily: "Georgia, serif",
  fontSize: 210,
  color: "rgba(249,115,22,.12)",
};

const quote: React.CSSProperties = {
  margin: 0,
  maxWidth: 1100,
  fontFamily: "'Anton', sans-serif",
  fontSize: "clamp(36px,5vw,68px)",
  lineHeight: 1.05,
  textTransform: "uppercase",
  color: "#F8F7F4",
};

const evidenceGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))",
  gap: 16,
};

const evidenceCard: React.CSSProperties = {
  background: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: 22,
  padding: 12,
  margin: 0,
};

const evidenceImage: React.CSSProperties = {
  width: "100%",
  height: 260,
  objectFit: "contain",
  display: "block",
  filter: "drop-shadow(0 24px 42px rgba(0,0,0,.35))",
  borderRadius: 14,
};

const footer: React.CSSProperties = {
  marginTop: 28,
  padding: "24px 0 50px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
};

const primaryButton: React.CSSProperties = {
  border: "none",
  borderRadius: 999,
  background: "#F97316",
  color: "#FFFFFF",
  padding: "16px 22px",
  fontFamily: "'Space Mono', monospace",
  fontSize: 12,
  fontWeight: 900,
  textTransform: "uppercase",
  cursor: "pointer",
};

const outlineButton: React.CSSProperties = {
  border: "1px solid #CBD5E1",
  borderRadius: 999,
  background: "#FFFFFF",
  color: "#0F172A",
  padding: "13px 18px",
  fontFamily: "'Space Mono', monospace",
  fontSize: 11,
  fontWeight: 900,
  textTransform: "uppercase",
  cursor: "pointer",
};
