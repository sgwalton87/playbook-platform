"use client";

import Link from "next/link";
import { useState } from "react";

const modules = [
  {
    week: "Orientation",
    title: "Welcome, Founder",
    description: "Meet your cohort, choose your founder goals, and sign the Founder Agreement.",
    icon: "👋",
    status: "Complete",
  },
  {
    week: "Week 1",
    title: "Dream",
    description: "Turn your interests, skills, and lived experiences into a business idea.",
    icon: "💭",
    status: "Current",
  },
  {
    week: "Week 2",
    title: "Discover",
    description: "Identify your customer, the problem you solve, and why your idea matters.",
    icon: "🔎",
    status: "Locked",
  },
  {
    week: "Week 3",
    title: "Design",
    description: "Create your one-page business plan and build your first $100 startup budget.",
    icon: "🧠",
    status: "Locked",
  },
  {
    week: "Week 4",
    title: "Build",
    description: "Purchase approved supplies and create your first product or service.",
    icon: "🛠️",
    status: "Locked",
  },
  {
    week: "Week 5",
    title: "Launch",
    description: "Introduce your business, reach customers, and make your first offer.",
    icon: "🚀",
    status: "Locked",
  },
  {
    week: "Week 6",
    title: "Sell",
    description: "Practice your pitch, respond to objections, and pursue your first sale.",
    icon: "💵",
    status: "Locked",
  },
  {
    week: "Week 7",
    title: "Grow",
    description: "Track revenue, expenses, profit, customer feedback, and business improvements.",
    icon: "📈",
    status: "Locked",
  },
  {
    week: "Week 8",
    title: "Pitch",
    description: "Build your founder story and prepare for the final startup showcase.",
    icon: "🎤",
    status: "Locked",
  },
];

const founderRules = [
  "Show up prepared.",
  "Stay curious.",
  "Respect your customers.",
  "Use startup funds responsibly.",
  "Ask for help when you need it.",
  "Finish what you start.",
];

export default function StartupCoursePage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "course" | "business" | "funding"
  >("overview");

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(245,170,48,.16), transparent 35%), #071713",
        color: "#f8f3e7",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          padding: "38px 24px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            flexWrap: "wrap",
            marginBottom: 32,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                padding: "8px 13px",
                borderRadius: 999,
                background: "rgba(245,170,48,.14)",
                border: "1px solid rgba(245,170,48,.4)",
                color: "#ffc867",
                fontWeight: 800,
                fontSize: 12,
                letterSpacing: 1.3,
                textTransform: "uppercase",
              }}
            >
              The Playbook Series · Founder Academy
            </div>

            <h1
              style={{
                margin: "18px 0 8px",
                fontSize: "clamp(38px, 7vw, 78px)",
                lineHeight: 0.95,
                letterSpacing: -3,
              }}
            >
              The $100
              <br />
              <span style={{ color: "#f5aa30" }}>Startup Fellowship</span>
            </h1>

            <p
              style={{
                maxWidth: 690,
                color: "#b8c6bf",
                fontSize: 18,
                lineHeight: 1.6,
                marginBottom: 0,
              }}
            >
              Five young founders. Eight weeks. One hundred dollars.
              A real opportunity to build, launch, sell, learn, and grow.
            </p>
          </div>

          <div
            style={{
              width: 180,
              minHeight: 180,
              borderRadius: 34,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              background:
                "linear-gradient(145deg, #f8d895, #b56d27 45%, #6b3517)",
              boxShadow: "0 22px 70px rgba(0,0,0,.38)",
              border: "5px solid rgba(255,255,255,.15)",
              color: "#111",
              fontWeight: 1000,
              transform: "rotate(2deg)",
            }}
          >
            <div>
              <div style={{ fontSize: 66, lineHeight: 1 }}>P</div>
              <div style={{ fontSize: 15 }}>THE PLAYBOOK</div>
              <div style={{ fontSize: 20 }}>RUN IT!</div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            padding: 7,
            borderRadius: 18,
            background: "rgba(255,255,255,.05)",
            border: "1px solid rgba(255,255,255,.08)",
            marginBottom: 24,
          }}
        >
          {[
            ["overview", "Founder Dashboard"],
            ["course", "Course Roadmap"],
            ["business", "My Business"],
            ["funding", "Funding Center"],
          ].map(([value, label]) => {
            const active = activeTab === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() =>
                  setActiveTab(
                    value as "overview" | "course" | "business" | "funding"
                  )
                }
                style={{
                  border: 0,
                  borderRadius: 13,
                  padding: "12px 17px",
                  cursor: "pointer",
                  fontWeight: 800,
                  background: active ? "#f5aa30" : "transparent",
                  color: active ? "#102019" : "#dce5df",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: 16,
                marginBottom: 22,
              }}
            >
              {[
                ["Founder Number", "#003", "Your place in Playbook history"],
                ["Course Progress", "18%", "Orientation completed"],
                ["Startup Funding", "$100", "Available after plan approval"],
                ["Revenue", "$0", "Your first sale is ahead"],
              ].map(([label, value, note]) => (
                <article
                  key={label}
                  style={{
                    padding: 22,
                    borderRadius: 22,
                    background: "rgba(255,255,255,.055)",
                    border: "1px solid rgba(255,255,255,.09)",
                  }}
                >
                  <div
                    style={{
                      color: "#95a89e",
                      fontSize: 12,
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 34,
                      fontWeight: 1000,
                      margin: "10px 0 5px",
                    }}
                  >
                    {value}
                  </div>
                  <div style={{ color: "#9fb0a7", fontSize: 13 }}>{note}</div>
                </article>
              ))}
            </section>

            <section
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.5fr) minmax(280px, .7fr)",
                gap: 18,
              }}
            >
              <article
                style={{
                  padding: 28,
                  borderRadius: 25,
                  background:
                    "linear-gradient(135deg, rgba(245,170,48,.15), rgba(255,255,255,.04))",
                  border: "1px solid rgba(245,170,48,.25)",
                }}
              >
                <div
                  style={{
                    color: "#ffc867",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: 1.2,
                    fontSize: 12,
                  }}
                >
                  Your next mission
                </div>

                <h2 style={{ fontSize: 31, margin: "10px 0 8px" }}>
                  Discover Your Big Idea
                </h2>

                <p style={{ color: "#c1cec7", lineHeight: 1.65 }}>
                  Complete the Founder Discovery activity. Identify three
                  problems you care about solving and choose one potential
                  customer to interview.
                </p>

                <div
                  style={{
                    height: 10,
                    background: "rgba(255,255,255,.09)",
                    borderRadius: 999,
                    overflow: "hidden",
                    margin: "22px 0 8px",
                  }}
                >
                  <div
                    style={{
                      width: "18%",
                      height: "100%",
                      background: "#f5aa30",
                    }}
                  />
                </div>

                <div style={{ color: "#99aaa1", fontSize: 13 }}>
                  2 of 11 course milestones complete
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab("course")}
                  style={{
                    marginTop: 22,
                    border: 0,
                    borderRadius: 13,
                    padding: "13px 18px",
                    background: "#f5aa30",
                    color: "#102019",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  Continue Course →
                </button>
              </article>

              <article
                style={{
                  padding: 25,
                  borderRadius: 25,
                  background: "rgba(255,255,255,.055)",
                  border: "1px solid rgba(255,255,255,.09)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>Founder Rules</h3>

                <div style={{ display: "grid", gap: 12 }}>
                  {founderRules.map((rule) => (
                    <div
                      key={rule}
                      style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        color: "#cbd6d0",
                      }}
                    >
                      <span
                        style={{
                          width: 27,
                          height: 27,
                          display: "grid",
                          placeItems: "center",
                          borderRadius: 999,
                          background: "rgba(245,170,48,.16)",
                          color: "#ffc867",
                          fontWeight: 900,
                        }}
                      >
                        ✓
                      </span>
                      {rule}
                    </div>
                  ))}
                </div>
              </article>
            </section>
          </>
        )}

        {activeTab === "course" && (
          <section>
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontSize: 34, marginBottom: 8 }}>
                Your Founder Roadmap
              </h2>
              <p style={{ color: "#aebdb5" }}>
                Each milestone moves your business from an idea to a real launch.
              </p>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {modules.map((module, index) => (
                <article
                  key={module.title}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px minmax(0, 1fr) auto",
                    gap: 17,
                    alignItems: "center",
                    padding: 20,
                    borderRadius: 20,
                    background:
                      module.status === "Current"
                        ? "rgba(245,170,48,.13)"
                        : "rgba(255,255,255,.045)",
                    border:
                      module.status === "Current"
                        ? "1px solid rgba(245,170,48,.45)"
                        : "1px solid rgba(255,255,255,.08)",
                    opacity: module.status === "Locked" ? 0.7 : 1,
                  }}
                >
                  <div
                    style={{
                      width: 55,
                      height: 55,
                      display: "grid",
                      placeItems: "center",
                      borderRadius: 17,
                      fontSize: 27,
                      background: "rgba(255,255,255,.07)",
                    }}
                  >
                    {module.icon}
                  </div>

                  <div>
                    <div
                      style={{
                        color: "#f5aa30",
                        fontSize: 11,
                        fontWeight: 900,
                        textTransform: "uppercase",
                        letterSpacing: 1.1,
                      }}
                    >
                      {module.week}
                    </div>
                    <h3 style={{ margin: "4px 0", fontSize: 21 }}>
                      {index + 1}. {module.title}
                    </h3>
                    <p
                      style={{
                        color: "#aebdb5",
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {module.description}
                    </p>
                  </div>

                  <span
                    style={{
                      padding: "8px 11px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 900,
                      background:
                        module.status === "Complete"
                          ? "rgba(74,222,128,.12)"
                          : module.status === "Current"
                          ? "rgba(245,170,48,.2)"
                          : "rgba(255,255,255,.07)",
                      color:
                        module.status === "Complete"
                          ? "#7ee2a4"
                          : module.status === "Current"
                          ? "#ffc867"
                          : "#89978f",
                    }}
                  >
                    {module.status}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}

        {activeTab === "business" && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
              gap: 18,
            }}
          >
            <article
              style={{
                padding: 28,
                borderRadius: 25,
                background: "rgba(255,255,255,.055)",
                border: "1px solid rgba(255,255,255,.09)",
              }}
            >
              <div style={{ fontSize: 45 }}>💡</div>
              <h2>My Business Builder</h2>
              <p style={{ color: "#aebdb5", lineHeight: 1.6 }}>
                Your answers from each lesson will automatically become your
                living business plan.
              </p>

              {[
                ["Business name", "Not chosen yet"],
                ["Product or service", "Discovery in progress"],
                ["Ideal customer", "Not identified"],
                ["Launch goal", "Make the first sale"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: "14px 0",
                    borderBottom: "1px solid rgba(255,255,255,.08)",
                  }}
                >
                  <div style={{ color: "#8fa097", fontSize: 12 }}>{label}</div>
                  <div style={{ fontWeight: 800, marginTop: 4 }}>{value}</div>
                </div>
              ))}
            </article>

            <article
              style={{
                padding: 28,
                borderRadius: 25,
                background:
                  "linear-gradient(145deg, rgba(245,170,48,.16), rgba(255,255,255,.04))",
                border: "1px solid rgba(245,170,48,.27)",
              }}
            >
              <div style={{ fontSize: 45 }}>🏆</div>
              <h2>Founder Milestones</h2>

              {[
                ["Choose a business idea", false],
                ["Interview a customer", false],
                ["Submit a startup budget", false],
                ["Launch a product or service", false],
                ["Make the first sale", false],
                ["Complete the final pitch", false],
              ].map(([label, done]) => (
                <div
                  key={String(label)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    color: done ? "#7ee2a4" : "#c8d3cd",
                  }}
                >
                  <span
                    style={{
                      width: 23,
                      height: 23,
                      borderRadius: 7,
                      border: "1px solid rgba(255,255,255,.2)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {done ? "✓" : ""}
                  </span>
                  {label}
                </div>
              ))}
            </article>
          </section>
        )}

        {activeTab === "funding" && (
          <section>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
                marginBottom: 20,
              }}
            >
              {[
                ["Approved Budget", "$0.00"],
                ["Funds Available", "$100.00"],
                ["Funds Used", "$0.00"],
                ["Receipts Logged", "0"],
              ].map(([label, value]) => (
                <article
                  key={label}
                  style={{
                    padding: 23,
                    borderRadius: 22,
                    background: "rgba(255,255,255,.055)",
                    border: "1px solid rgba(255,255,255,.09)",
                  }}
                >
                  <div style={{ color: "#91a198", fontSize: 12 }}>{label}</div>
                  <div
                    style={{
                      fontWeight: 1000,
                      fontSize: 32,
                      marginTop: 8,
                    }}
                  >
                    {value}
                  </div>
                </article>
              ))}
            </div>

            <article
              style={{
                padding: 30,
                borderRadius: 25,
                background:
                  "linear-gradient(135deg, rgba(245,170,48,.16), rgba(255,255,255,.04))",
                border: "1px solid rgba(245,170,48,.25)",
              }}
            >
              <div style={{ fontSize: 46 }}>💰</div>
              <h2 style={{ fontSize: 30, marginBottom: 8 }}>
                Unlock Your Startup Funding
              </h2>
              <p
                style={{
                  color: "#b7c5be",
                  lineHeight: 1.65,
                  maxWidth: 720,
                }}
              >
                Complete your one-page business plan and submit an itemized
                startup budget. Approved materials may be purchased directly or
                reimbursed after receipts are verified.
              </p>

              <div
                style={{
                  marginTop: 22,
                  padding: 18,
                  borderRadius: 16,
                  background: "rgba(0,0,0,.2)",
                  color: "#d9e2dd",
                }}
              >
                🔒 Funding requests unlock after the Design module.
              </div>
            </article>
          </section>
        )}

        <section
          style={{
            marginTop: 35,
            padding: 28,
            borderRadius: 25,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 18,
            background: "#f5aa30",
            color: "#102019",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: 1000,
                fontSize: 26,
                marginBottom: 5,
              }}
            >
              Applications are now open.
            </div>
            <div style={{ fontWeight: 700 }}>
              Apply to become one of five inaugural $100 Startup Fellows.
            </div>
          </div>

          <Link
            href="/courses/100-startup/apply"
            
            style={{
              display: "inline-flex",
              padding: "14px 20px",
              borderRadius: 13,
              background: "#102019",
              color: "#fff8e8",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            Apply Now →
          </Link>
        </section>
      </section>
    </main>
  );
}
