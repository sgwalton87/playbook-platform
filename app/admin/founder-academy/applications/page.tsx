"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Status =
  | "draft"
  | "submitted"
  | "under_review"
  | "interview"
  | "accepted"
  | "waitlisted"
  | "declined";

type Application = {
  id: string;
  applicant_id: string;
  full_name: string | null;
  email: string | null;
  age: number | null;
  school_name: string | null;
  referral_organization: string | null;
  business_name: string | null;
  business_description: string | null;
  product_or_service: string | null;
  target_customer: string | null;
  problem_solved: string | null;
  competitive_difference: string | null;
  program_motivation: string | null;
  funding_plan: string | null;
  eight_week_goal: string | null;
  selection_case: string | null;
  bonus_video_path: string | null;
  status: Status;
  motivation_score: number | null;
  feasibility_score: number | null;
  customer_score: number | null;
  coachability_score: number | null;
  communication_score: number | null;
  reviewer_notes: string | null;
  submitted_at: string | null;
};

const statusOptions: Status[] = [
  "submitted",
  "under_review",
  "interview",
  "accepted",
  "waitlisted",
  "declined",
];

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "10px 11px",
  borderRadius: 10,
  border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(255,255,255,.06)",
  color: "#fff8e8",
};

export default function FounderApplicationsAdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selected, setSelected] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [message, setMessage] = useState("");

  useEffect(() => {
    void loadApplications();
  }, []);

  const filteredApplications = useMemo(() => {
    if (filter === "all") return applications;

    return applications.filter(
      (application) => application.status === filter
    );
  }, [applications, filter]);

  function totalScore(application: Application) {
    return (
      (application.motivation_score || 0) +
      (application.feasibility_score || 0) +
      (application.customer_score || 0) +
      (application.coachability_score || 0) +
      (application.communication_score || 0)
    );
  }

  async function loadApplications() {
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase
      .from("founder_applications")
      .select("*")
      .neq("status", "draft")
      .order("submitted_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const rows = (data || []) as Application[];
    setApplications(rows);

    if (!selected && rows.length) {
      setSelected(rows[0]);
    }

    setLoading(false);
  }

  async function saveReview() {
    if (!selected) return;

    setSaving(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("founder_applications")
      .update({
        status: selected.status,
        motivation_score: selected.motivation_score,
        feasibility_score: selected.feasibility_score,
        customer_score: selected.customer_score,
        coachability_score: selected.coachability_score,
        communication_score: selected.communication_score,
        reviewer_notes: selected.reviewer_notes,
        reviewed_by: user?.id || null,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selected.id)
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    const updated = data as Application;

    setSelected(updated);
    setApplications((current) =>
      current.map((application) =>
        application.id === updated.id ? updated : application
      )
    );

    setMessage("Review saved.");
  }

  async function openBonusVideo() {
    if (!selected?.bonus_video_path) return;

    const { data, error } = await supabase.storage
      .from("founder-application-videos")
      .createSignedUrl(selected.bonus_video_path, 60 * 15);

    if (error) {
      setMessage(error.message);
      return;
    }

    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  function updateSelected<K extends keyof Application>(
    key: K,
    value: Application[K]
  ) {
    setSelected((current) =>
      current ? { ...current, [key]: value } : current
    );
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#071713",
          color: "#fff8e8",
        }}
      >
        Loading Founder applications...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "34px 22px 80px",
        background: "#071713",
        color: "#fff8e8",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <section style={{ maxWidth: 1380, margin: "0 auto" }}>
        <header style={{ marginBottom: 25 }}>
          <div
            style={{
              color: "#f5aa30",
              fontSize: 12,
              fontWeight: 1000,
              textTransform: "uppercase",
              letterSpacing: 1.2,
            }}
          >
            Playbook Administration
          </div>

          <h1
            style={{
              fontSize: "clamp(38px, 6vw, 62px)",
              letterSpacing: -2,
              margin: "8px 0",
            }}
          >
            Founder Applications
          </h1>

          <p style={{ color: "#aebdb5", fontSize: 17 }}>
            Review, score, interview, and select the inaugural cohort.
          </p>
        </header>

        {message && (
          <div
            style={{
              marginBottom: 18,
              padding: 14,
              borderRadius: 12,
              background: "rgba(245,170,48,.12)",
              border: "1px solid rgba(245,170,48,.3)",
              color: "#ffd17d",
            }}
          >
            {message}
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          {[
            "all",
            "submitted",
            "under_review",
            "interview",
            "accepted",
            "waitlisted",
            "declined",
          ].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              style={{
                padding: "9px 12px",
                borderRadius: 999,
                border:
                  filter === value
                    ? "1px solid #f5aa30"
                    : "1px solid rgba(255,255,255,.12)",
                background:
                  filter === value
                    ? "rgba(245,170,48,.16)"
                    : "rgba(255,255,255,.04)",
                color: filter === value ? "#ffc867" : "#c5d0ca",
                fontWeight: 800,
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {value.replaceAll("_", " ")}
            </button>
          ))}
        </div>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(280px, .72fr) minmax(0, 1.55fr)",
            gap: 18,
            alignItems: "start",
          }}
        >
          <aside
            style={{
              borderRadius: 22,
              background: "rgba(255,255,255,.045)",
              border: "1px solid rgba(255,255,255,.08)",
              overflow: "hidden",
              maxHeight: "78vh",
              overflowY: "auto",
            }}
          >
            {filteredApplications.length === 0 ? (
              <div style={{ padding: 24, color: "#9cacA3" }}>
                No applications in this category.
              </div>
            ) : (
              filteredApplications.map((application) => {
                const active = selected?.id === application.id;

                return (
                  <button
                    key={application.id}
                    type="button"
                    onClick={() => setSelected(application)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      border: 0,
                      borderBottom:
                        "1px solid rgba(255,255,255,.07)",
                      background: active
                        ? "rgba(245,170,48,.14)"
                        : "transparent",
                      color: "#fff8e8",
                      padding: 18,
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                      }}
                    >
                      <strong>
                        {application.full_name || "Unnamed Applicant"}
                      </strong>

                      <span style={{ color: "#ffc867" }}>
                        {totalScore(application)}/100
                      </span>
                    </div>

                    <div
                      style={{
                        color: "#9cadA4",
                        marginTop: 6,
                        fontSize: 13,
                      }}
                    >
                      {application.business_name ||
                        application.product_or_service ||
                        "Business idea pending"}
                    </div>

                    <div
                      style={{
                        marginTop: 10,
                        color: "#c8d3cd",
                        fontSize: 12,
                        textTransform: "capitalize",
                      }}
                    >
                      {application.status.replaceAll("_", " ")}
                    </div>
                  </button>
                );
              })
            )}
          </aside>

          {selected ? (
            <article
              style={{
                padding: "26px clamp(20px, 4vw, 36px)",
                borderRadius: 24,
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.09)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 15,
                  flexWrap: "wrap",
                  alignItems: "start",
                }}
              >
                <div>
                  <h2 style={{ fontSize: 31, margin: 0 }}>
                    {selected.full_name}
                  </h2>

                  <div
                    style={{
                      marginTop: 7,
                      color: "#9cadA4",
                      lineHeight: 1.5,
                    }}
                  >
                    {selected.age ? `Age ${selected.age} · ` : ""}
                    {selected.school_name || "School not listed"}
                    <br />
                    {selected.email}
                  </div>
                </div>

                <div
                  style={{
                    padding: "11px 15px",
                    borderRadius: 14,
                    background: "rgba(245,170,48,.14)",
                    color: "#ffc867",
                    fontWeight: 1000,
                    fontSize: 20,
                  }}
                >
                  {totalScore(selected)}/100
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: 19,
                  marginTop: 28,
                }}
              >
                {[
                  ["Business", selected.business_name],
                  ["Business idea", selected.business_description],
                  ["Product or service", selected.product_or_service],
                  ["Target customer", selected.target_customer],
                  ["Problem solved", selected.problem_solved],
                  [
                    "Competitive difference",
                    selected.competitive_difference,
                  ],
                  [
                    "Why they want to participate",
                    selected.program_motivation,
                  ],
                  ["Funding plan", selected.funding_plan],
                  ["Eight-week goal", selected.eight_week_goal],
                  ["Why they should be selected", selected.selection_case],
                ].map(([label, value]) => (
                  <section key={label}>
                    <div
                      style={{
                        color: "#f5aa30",
                        fontSize: 11,
                        fontWeight: 1000,
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 5,
                      }}
                    >
                      {label}
                    </div>

                    <div
                      style={{
                        color: "#d5dfda",
                        lineHeight: 1.65,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {value || "No response provided."}
                    </div>
                  </section>
                ))}
              </div>

              {selected.bonus_video_path && (
                <button
                  type="button"
                  onClick={() => void openBonusVideo()}
                  style={{
                    marginTop: 24,
                    padding: "12px 16px",
                    borderRadius: 12,
                    border: "1px solid rgba(245,170,48,.4)",
                    background: "rgba(245,170,48,.1)",
                    color: "#ffc867",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ▶ Watch Bonus Video
                </button>
              )}

              <hr
                style={{
                  margin: "29px 0",
                  border: 0,
                  borderTop: "1px solid rgba(255,255,255,.1)",
                }}
              />

              <h3 style={{ fontSize: 25 }}>Reviewer Scorecard</h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 14,
                }}
              >
                {[
                  ["motivation_score", "Motivation", 30],
                  ["feasibility_score", "Feasibility", 25],
                  ["customer_score", "Customer Clarity", 20],
                  ["coachability_score", "Coachability", 15],
                  ["communication_score", "Communication", 10],
                ].map(([key, label, max]) => (
                  <label
                    key={String(key)}
                    style={{ display: "grid", gap: 7 }}
                  >
                    <span
                      style={{
                        color: "#cbd6d0",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {label} / {max}
                    </span>

                    <input
                      type="number"
                      min={0}
                      max={Number(max)}
                      style={inputStyle}
                      value={
                        selected[
                          key as keyof Application
                        ] as number | ""
                      }
                      onChange={(e) =>
                        updateSelected(
                          key as
                            | "motivation_score"
                            | "feasibility_score"
                            | "customer_score"
                            | "coachability_score"
                            | "communication_score",
                          e.target.value
                            ? Number(e.target.value)
                            : null
                        )
                      }
                    />
                  </label>
                ))}
              </div>

              <label
                style={{
                  display: "grid",
                  gap: 8,
                  marginTop: 20,
                }}
              >
                <span style={{ fontWeight: 900 }}>Reviewer notes</span>

                <textarea
                  style={{ ...inputStyle, minHeight: 130 }}
                  value={selected.reviewer_notes || ""}
                  onChange={(e) =>
                    updateSelected(
                      "reviewer_notes",
                      e.target.value
                    )
                  }
                />
              </label>

              <label
                style={{
                  display: "grid",
                  gap: 8,
                  marginTop: 18,
                }}
              >
                <span style={{ fontWeight: 900 }}>
                  Application status
                </span>

                <select
                  style={inputStyle}
                  value={selected.status}
                  onChange={(e) =>
                    updateSelected(
                      "status",
                      e.target.value as Status
                    )
                  }
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={() => void saveReview()}
                disabled={saving}
                style={{
                  marginTop: 22,
                  padding: "13px 20px",
                  border: 0,
                  borderRadius: 12,
                  background: "#f5aa30",
                  color: "#102019",
                  fontWeight: 1000,
                  cursor: "pointer",
                }}
              >
                {saving ? "Saving..." : "Save Review"}
              </button>
            </article>
          ) : (
            <article
              style={{
                padding: 30,
                borderRadius: 22,
                background: "rgba(255,255,255,.045)",
              }}
            >
              Select an application to begin reviewing.
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
