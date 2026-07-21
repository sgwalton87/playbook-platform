import Link from "next/link";

const fellows = [
  {
    name: "Jordan Smith",
    business: "Dream Dough Cookies",
    stage: "Discovery",
    funding: "$0 / $100",
    progress: "18%",
  },
  {
    name: "Marcus Lee",
    business: "ML Mobile Detailing",
    stage: "Application",
    funding: "$0 / $100",
    progress: "8%",
  },
  {
    name: "Aaliyah Davis",
    business: "Aaliyah Creates",
    stage: "Business Planning",
    funding: "$35 / $100",
    progress: "31%",
  },
  {
    name: "Noah Johnson",
    business: "Tech Tutor",
    stage: "Application",
    funding: "$0 / $100",
    progress: "6%",
  },
  {
    name: "Maya Williams",
    business: "Maya Made Jewelry",
    stage: "Discovery",
    funding: "$0 / $100",
    progress: "20%",
  },
];

export default function FounderAcademyAdminPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px 80px",
        background: "#071713",
        color: "#f8f3e7",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <section style={{ maxWidth: 1240, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <div>
            <div
              style={{
                color: "#f5aa30",
                fontSize: 12,
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: 1.3,
              }}
            >
              Playbook Administration
            </div>
            <h1
              style={{
                fontSize: "clamp(35px, 6vw, 60px)",
                letterSpacing: -2,
                margin: "9px 0",
              }}
            >
              Founder Academy
            </h1>
            <p style={{ color: "#aebdb5", fontSize: 17 }}>
              Manage applicants, Fellows, funding, progress, and showcase readiness.
            </p>
          </div>

          <Link
            href="/courses/100-startup"
            style={{
              padding: "13px 18px",
              borderRadius: 13,
              background: "#f5aa30",
              color: "#102019",
              fontWeight: 900,
              textDecoration: "none",
            }}
          >
            View Student Experience →
          </Link>
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
            gap: 15,
            marginBottom: 22,
          }}
        >
          {[
            ["Applications", "18", "+6 this week"],
            ["Accepted Fellows", "5", "Cohort capacity reached"],
            ["Businesses Launched", "0", "Pre-launch stage"],
            ["Startup Funding", "$500", "Total committed"],
            ["Revenue Generated", "$0", "Updates after launch"],
          ].map(([label, value, note]) => (
            <article
              key={label}
              style={{
                padding: 22,
                borderRadius: 21,
                background: "rgba(255,255,255,.055)",
                border: "1px solid rgba(255,255,255,.09)",
              }}
            >
              <div
                style={{
                  color: "#91a198",
                  fontSize: 11,
                  textTransform: "uppercase",
                  fontWeight: 900,
                  letterSpacing: 1,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 1000,
                  margin: "9px 0 4px",
                }}
              >
                {value}
              </div>
              <div style={{ color: "#92a39a", fontSize: 12 }}>{note}</div>
            </article>
          ))}
        </section>

        <section
          style={{
            padding: 24,
            borderRadius: 24,
            background: "rgba(255,255,255,.045)",
            border: "1px solid rgba(255,255,255,.08)",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 15,
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>Fall 2026 Founders</h2>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#91a198",
                }}
              >
                Prototype cohort management dashboard
              </p>
            </div>

            <button
              type="button"
              style={{
                border: 0,
                borderRadius: 12,
                background: "#f5aa30",
                color: "#102019",
                padding: "11px 15px",
                fontWeight: 900,
              }}
            >
              + Add Fellow
            </button>
          </div>

          <table
            style={{
              width: "100%",
              minWidth: 780,
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr>
                {[
                  "Founder",
                  "Business",
                  "Current Stage",
                  "Funding",
                  "Progress",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign: "left",
                      padding: "13px 12px",
                      color: "#86988e",
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      borderBottom: "1px solid rgba(255,255,255,.09)",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {fellows.map((fellow, index) => (
                <tr key={fellow.name}>
                  <td
                    style={{
                      padding: "17px 12px",
                      borderBottom: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: 11,
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: 39,
                          height: 39,
                          borderRadius: 13,
                          background: "rgba(245,170,48,.17)",
                          display: "grid",
                          placeItems: "center",
                          color: "#ffc867",
                          fontWeight: 1000,
                        }}
                      >
                        #{String(index + 1).padStart(3, "0")}
                      </div>
                      <strong>{fellow.name}</strong>
                    </div>
                  </td>

                  <td
                    style={{
                      padding: "17px 12px",
                      borderBottom: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    {fellow.business}
                  </td>

                  <td
                    style={{
                      padding: "17px 12px",
                      borderBottom: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <span
                      style={{
                        padding: "7px 10px",
                        borderRadius: 999,
                        background: "rgba(245,170,48,.12)",
                        color: "#ffc867",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {fellow.stage}
                    </span>
                  </td>

                  <td
                    style={{
                      padding: "17px 12px",
                      borderBottom: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    {fellow.funding}
                  </td>

                  <td
                    style={{
                      padding: "17px 12px",
                      borderBottom: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    {fellow.progress}
                  </td>

                  <td
                    style={{
                      padding: "17px 12px",
                      borderBottom: "1px solid rgba(255,255,255,.07)",
                    }}
                  >
                    <button
                      type="button"
                      style={{
                        border: "1px solid rgba(255,255,255,.14)",
                        background: "transparent",
                        color: "#f8f3e7",
                        borderRadius: 10,
                        padding: "8px 11px",
                        fontWeight: 800,
                      }}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 17,
          }}
        >
          {[
            [
              "Application Review",
              "Score applicants, review business concepts, watch bonus videos, and select five Fellows.",
            ],
            [
              "Funding Administration",
              "Approve startup budgets, monitor the $100 allocation, and store purchase documentation.",
            ],
            [
              "Cohort Analytics",
              "Track attendance, lessons, businesses launched, customers reached, revenue, and profit.",
            ],
          ].map(([title, text]) => (
            <article
              key={title}
              style={{
                padding: 24,
                borderRadius: 22,
                background:
                  "linear-gradient(135deg, rgba(245,170,48,.12), rgba(255,255,255,.04))",
                border: "1px solid rgba(245,170,48,.2)",
              }}
            >
              <h3 style={{ marginTop: 0 }}>{title}</h3>
              <p style={{ color: "#aebdb5", lineHeight: 1.6, marginBottom: 0 }}>
                {text}
              </p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
