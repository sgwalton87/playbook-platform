"use client";

type Opportunity = {
  title: string;
  readiness: number;
};

const opportunities: Opportunity[] = [
  { title: "Scholarships", readiness: 82 },
  { title: "College Applications", readiness: 74 },
  { title: "Internships", readiness: 63 },
  { title: "Career Readiness", readiness: 59 },
  { title: "Leadership Programs", readiness: 91 },
];

export default function OpportunityMeter() {
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
      <h2 style={{ marginBottom: 20 }}>
        Opportunity Meter
      </h2>

      {opportunities.map((item) => (
        <div key={item.title} style={{ marginBottom: 18 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <span>{item.title}</span>
            <strong>{item.readiness}%</strong>
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
                width: `${item.readiness}%`,
                background: "#10B981",
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
