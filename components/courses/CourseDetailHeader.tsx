"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  title: string;
  pillar: string;
  pillarColor: string;
  image: string;
  description: string;
  completedCount: number;
  totalModules: number;
  percent: number;
  xpEarned: number;
  coinsEarned: number;
};

export default function CourseDetailHeader({
  title,
  pillar,
  pillarColor,
  image,
  description,
  completedCount,
  totalModules,
  percent,
  xpEarned,
  coinsEarned,
}: Props) {
  const router = useRouter();

  return (
    <>
      <section
        style={{
          position: "relative",
          minHeight: 320,
          borderRadius: 24,
          overflow: "hidden",
          marginBottom: 20,
          boxShadow: "0 18px 50px rgba(15,23,42,.12)",
        }}
      >
        <Image unoptimized width={1200} height={800}
          src={image}
          alt={title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,rgba(15,23,42,.96) 0%,rgba(15,23,42,.78) 52%,rgba(15,23,42,.28) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            zIndex: 1,
            minHeight: 320,
            padding: "30px clamp(22px,4vw,42px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => router.push("/courses")}
            style={{
              alignSelf: "flex-start",
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              color: "#F8F7F4",
              background: "rgba(255,255,255,.1)",
              border: "1px solid rgba(255,255,255,.18)",
              borderRadius: 999,
              padding: "9px 15px",
              cursor: "pointer",
              backdropFilter: "blur(10px)",
            }}
          >
            ← Course Library
          </button>

          <div style={{ maxWidth: 660 }}>
            <span
              style={{
                display: "inline-block",
                background: pillarColor,
                color: "#fff",
                borderRadius: 999,
                padding: "5px 11px",
                fontFamily: "'Space Mono', monospace",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              {pillar}
            </span>

            <h1
              style={{
                fontFamily: "'Anton', sans-serif",
                fontWeight: 400,
                fontSize: "clamp(36px,6vw,68px)",
                lineHeight: .94,
                textTransform: "uppercase",
                color: "#F8F7F4",
                marginBottom: 14,
              }}
            >
              {title}
            </h1>

            <p
              style={{
                fontSize: 15,
                lineHeight: 1.65,
                color: "rgba(248,247,244,.72)",
                maxWidth: 620,
              }}
            >
              {description}
            </p>
          </div>
        </div>
      </section>

      <section
        style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: 18,
          padding: "20px 22px",
          marginBottom: 22,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 12,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: "#0F172A",
                marginBottom: 3,
              }}
            >
              Course progress
            </div>

            <div
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10,
                color: "#64748B",
              }}
            >
              {completedCount} OF {totalModules} MODULES COMPLETE
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <Metric label="Progress" value={`${percent}%`} />
            <Metric label="XP earned" value={`+${xpEarned}`} />
            <Metric label="Coins" value={`+${coinsEarned}`} />
          </div>
        </div>

        <div
          style={{
            height: 9,
            borderRadius: 999,
            background: "#E2E8F0",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              borderRadius: 999,
              background: "linear-gradient(90deg,#F97316,#F59E0B)",
              transition: "width .5s ease",
            }}
          />
        </div>
      </section>
    </>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background: "#F8FAFC",
        border: "1px solid #E2E8F0",
        borderRadius: 12,
        padding: "8px 12px",
        minWidth: 82,
      }}
    >
      <div
        style={{
          fontFamily: "'Space Mono', monospace",
          fontSize: 8,
          color: "#94A3B8",
          textTransform: "uppercase",
          letterSpacing: ".08em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: "#0F172A",
        }}
      >
        {value}
      </div>
    </div>
  );
}
