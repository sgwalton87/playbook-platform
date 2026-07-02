"use client";

type DNAItem = {
  label: string;
  score: number;
};

const traits: DNAItem[] = [
  { label: "Academics", score: 78 },
  { label: "Leadership", score: 84 },
  { label: "Service", score: 65 },
  { label: "Financial Literacy", score: 52 },
  { label: "Career Readiness", score: 60 },
  { label: "Communication", score: 74 },
];

export default function PortfolioDNA() {
  return (
    <section
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 18,
        padding: 24,
        marginTop: 20,
      }}
    >
      <h2
        style={{
          fontSize: 22,
          marginBottom: 20,
        }}
      >
        Portfolio DNA
      </h2>

      {traits.map((trait) => (
        <div key={trait.label} style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span>{trait.label}</span>
            <strong>{trait.score}%</strong>
          </div>

          <div
            style={{
              background: "#EEF2F7",
              borderRadius: 999,
              height: 10,
            }}
          >
            <div
              style={{
                width: `${trait.score}%`,
                background: "#F97316",
                height: "100%",
                borderRadius: 999,
                transition: "width .4s ease",
              }}
            />
          </div>
        </div>
      ))}
    </section>
  );
}
