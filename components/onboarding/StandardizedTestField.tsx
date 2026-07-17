"use client";

import { useState } from "react";

import {
  createPlannedTestDate,
  createTestAttempt,
  normalizeTestPlan,
  type StandardizedTestAttempt,
  type StandardizedTestName,
  type StandardizedTestPlan,
  type StandardizedTestPlannedDate,
  type StandardizedTestStatus,
} from "@/lib/education";

type Props = {
  fieldKey: string;
  label: string;
  testName: StandardizedTestName;
  value: unknown;
  helpText?: string;
  error?: string;
  onChange: (value: StandardizedTestPlan) => void;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  minWidth: 0,
  boxSizing: "border-box",
  padding: "12px 14px",
  border: "1.5px solid #CBD5E1",
  borderRadius: 10,
  background: "#FFFFFF",
  color: "#0F172A",
  fontSize: 14,
  outline: "none",
};

const STATUS_OPTIONS: Array<{
  value: Exclude<StandardizedTestStatus, "">;
  title: string;
  description: string;
}> = [
  {
    value: "taken",
    title: "Taken",
    description:
      "Save each completed test date and score.",
  },
  {
    value: "planning",
    title: "Planning",
    description:
      "Save one or more future test dates.",
  },
  {
    value: "skip",
    title: "Skip for now",
    description:
      "Save why additional testing is not currently part of your plan.",
  },
];

function emptyAttemptDraft(): StandardizedTestAttempt {
  return createTestAttempt();
}

function emptyPlannedDraft(): StandardizedTestPlannedDate {
  return createPlannedTestDate();
}

function getScoreRange(testName: StandardizedTestName) {
  return testName === "SAT"
    ? {
        min: 400,
        max: 1600,
        placeholder: "400–1600",
      }
    : {
        min: 1,
        max: 36,
        placeholder: "1–36",
      };
}

export default function StandardizedTestField({
  fieldKey,
  label,
  testName,
  value,
  helpText,
  error,
  onChange,
}: Props) {
  const plan = normalizeTestPlan(value);
  const range = getScoreRange(testName);

  const [attemptDraft, setAttemptDraft] =
    useState<StandardizedTestAttempt>(
      emptyAttemptDraft
    );

  const [plannedDraft, setPlannedDraft] =
    useState<StandardizedTestPlannedDate>(
      emptyPlannedDraft
    );

  const [
    editingAttemptId,
    setEditingAttemptId,
  ] = useState<string | null>(null);

  const [
    editingPlannedId,
    setEditingPlannedId,
  ] = useState<string | null>(null);

  function updatePlan(
    patch: Partial<StandardizedTestPlan>
  ) {
    onChange({
      ...plan,
      ...patch,
    });
  }

  function chooseStatus(
    status: Exclude<StandardizedTestStatus, "">
  ) {
    updatePlan({
      status,
    });
  }

  function resetAttemptDraft() {
    setAttemptDraft(
      emptyAttemptDraft()
    );

    setEditingAttemptId(null);
  }

  function resetPlannedDraft() {
    setPlannedDraft(
      emptyPlannedDraft()
    );

    setEditingPlannedId(null);
  }

  function saveAttempt() {
    const date =
      attemptDraft.date.trim();

    const score =
      attemptDraft.score.trim();

    if (!date || !score) {
      return;
    }

    const numericScore =
      Number(score);

    if (
      !Number.isFinite(numericScore) ||
      numericScore < range.min ||
      numericScore > range.max
    ) {
      return;
    }

    const savedAttempt: StandardizedTestAttempt = {
      ...attemptDraft,
      id:
        editingAttemptId ||
        attemptDraft.id ||
        createTestAttempt().id,
      date,
      score,
    };

    const completedAttempts =
      editingAttemptId
        ? plan.completedAttempts.map(
            (attempt) =>
              attempt.id ===
              editingAttemptId
                ? savedAttempt
                : attempt
          )
        : [
            ...plan.completedAttempts,
            savedAttempt,
          ];

    updatePlan({
      status: "taken",
      completedAttempts,
    });

    resetAttemptDraft();
  }

  function editAttempt(
    attempt: StandardizedTestAttempt
  ) {
    setAttemptDraft({
      ...attempt,
    });

    setEditingAttemptId(
      attempt.id
    );

    updatePlan({
      status: "taken",
    });
  }

  function removeAttempt(
    attemptId: string
  ) {
    updatePlan({
      completedAttempts:
        plan.completedAttempts.filter(
          (attempt) =>
            attempt.id !== attemptId
        ),
    });

    if (
      editingAttemptId ===
      attemptId
    ) {
      resetAttemptDraft();
    }
  }

  function savePlannedDate() {
    const date =
      plannedDraft.date.trim();

    if (!date) {
      return;
    }

    const savedPlan: StandardizedTestPlannedDate = {
      ...plannedDraft,
      id:
        editingPlannedId ||
        plannedDraft.id ||
        createPlannedTestDate().id,
      date,
    };

    const plannedDates =
      editingPlannedId
        ? plan.plannedDates.map(
            (planned) =>
              planned.id ===
              editingPlannedId
                ? savedPlan
                : planned
          )
        : [
            ...plan.plannedDates,
            savedPlan,
          ];

    updatePlan({
      status: "planning",
      plannedDates,
    });

    resetPlannedDraft();
  }

  function editPlannedDate(
    planned: StandardizedTestPlannedDate
  ) {
    setPlannedDraft({
      ...planned,
    });

    setEditingPlannedId(
      planned.id
    );

    updatePlan({
      status: "planning",
    });
  }

  function removePlannedDate(
    plannedId: string
  ) {
    updatePlan({
      plannedDates:
        plan.plannedDates.filter(
          (planned) =>
            planned.id !== plannedId
        ),
    });

    if (
      editingPlannedId ===
      plannedId
    ) {
      resetPlannedDraft();
    }
  }

  function saveSkipReason() {
    if (
      !plan.skipReason.trim()
    ) {
      return;
    }

    updatePlan({
      status: "skip",
      skipReason:
        plan.skipReason,
      skipSavedAt:
        new Date().toISOString(),
    });
  }

  return (
    <section
      data-field-key={fieldKey}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: 18,
        border:
          "1px solid #E2E8F0",
        borderRadius: 14,
        background: "#F8FAFC",
      }}
    >
      <div
        style={{
          color: "#0F172A",
          fontSize: 15,
          fontWeight: 900,
        }}
      >
        {label}
      </div>

      {helpText ? (
        <p
          style={{
            margin: "6px 0 14px",
            color: "#64748B",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {helpText}
        </p>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(145px, 1fr))",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {STATUS_OPTIONS.map(
          (option) => {
            const active =
              plan.status ===
              option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  chooseStatus(
                    option.value
                  )
                }
                style={{
                  padding: 12,
                  border: `1.5px solid ${
                    active
                      ? "#F97316"
                      : "#CBD5E1"
                  }`,
                  borderRadius: 12,
                  background: active
                    ? "#FFF7ED"
                    : "#FFFFFF",
                  color: active
                    ? "#C2410C"
                    : "#0F172A",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {option.title}
                </div>

                <div
                  style={{
                    marginTop: 4,
                    color: "#64748B",
                    fontSize: 11,
                    lineHeight: 1.4,
                  }}
                >
                  {
                    option.description
                  }
                </div>
              </button>
            );
          }
        )}
      </div>

      {plan.status === "taken" ? (
        <div>
          <div
            style={{
              color: "#475569",
              fontSize: 12,
              fontWeight: 900,
              marginBottom: 8,
            }}
          >
            Add a completed{" "}
            {testName} attempt
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(160px,1fr) minmax(130px,.8fr)",
              gap: 10,
              padding: 12,
              border:
                "1px solid #E2E8F0",
              borderRadius: 12,
              background: "#FFFFFF",
            }}
          >
            <label
              style={{
                color: "#475569",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Test date

              <input
                type="date"
                value={
                  attemptDraft.date
                }
                onChange={(event) =>
                  setAttemptDraft(
                    (current) => ({
                      ...current,
                      date:
                        event.target
                          .value,
                    })
                  )
                }
                style={{
                  ...inputStyle,
                  marginTop: 6,
                }}
              />
            </label>

            <label
              style={{
                color: "#475569",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Score

              <input
                type="number"
                min={range.min}
                max={range.max}
                value={
                  attemptDraft.score
                }
                placeholder={
                  range.placeholder
                }
                onChange={(event) =>
                  setAttemptDraft(
                    (current) => ({
                      ...current,
                      score:
                        event.target
                          .value,
                    })
                  )
                }
                style={{
                  ...inputStyle,
                  marginTop: 6,
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button
              type="button"
              disabled={
                !attemptDraft.date ||
                !attemptDraft.score
              }
              onClick={saveAttempt}
              style={{
                padding:
                  "10px 14px",
                border: 0,
                borderRadius: 10,
                background:
                  attemptDraft.date &&
                  attemptDraft.score
                    ? "#0F172A"
                    : "#CBD5E1",
                color:
                  attemptDraft.date &&
                  attemptDraft.score
                    ? "#FFFFFF"
                    : "#64748B",
                cursor:
                  attemptDraft.date &&
                  attemptDraft.score
                    ? "pointer"
                    : "not-allowed",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {editingAttemptId
                ? "Update Attempt"
                : "Save Attempt"}
            </button>

            {editingAttemptId ? (
              <button
                type="button"
                onClick={
                  resetAttemptDraft
                }
                style={{
                  padding:
                    "10px 14px",
                  border:
                    "1px solid #CBD5E1",
                  borderRadius: 10,
                  background:
                    "#FFFFFF",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {plan.status ===
      "planning" ? (
        <div>
          <div
            style={{
              color: "#475569",
              fontSize: 12,
              fontWeight: 900,
              marginBottom: 8,
            }}
          >
            Add a future{" "}
            {testName} date
          </div>

          <div
            style={{
              padding: 12,
              border:
                "1px solid #E2E8F0",
              borderRadius: 12,
              background: "#FFFFFF",
            }}
          >
            <label
              style={{
                color: "#475569",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Future test date

              <input
                type="date"
                value={
                  plannedDraft.date
                }
                onChange={(event) =>
                  setPlannedDraft(
                    (current) => ({
                      ...current,
                      date:
                        event.target
                          .value,
                    })
                  )
                }
                style={{
                  ...inputStyle,
                  marginTop: 6,
                }}
              />
            </label>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
            }}
          >
            <button
              type="button"
              disabled={
                !plannedDraft.date
              }
              onClick={
                savePlannedDate
              }
              style={{
                padding:
                  "10px 14px",
                border: 0,
                borderRadius: 10,
                background:
                  plannedDraft.date
                    ? "#0F172A"
                    : "#CBD5E1",
                color:
                  plannedDraft.date
                    ? "#FFFFFF"
                    : "#64748B",
                cursor:
                  plannedDraft.date
                    ? "pointer"
                    : "not-allowed",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              {editingPlannedId
                ? "Update Planned Date"
                : "Save Planned Date"}
            </button>

            {editingPlannedId ? (
              <button
                type="button"
                onClick={
                  resetPlannedDraft
                }
                style={{
                  padding:
                    "10px 14px",
                  border:
                    "1px solid #CBD5E1",
                  borderRadius: 10,
                  background:
                    "#FFFFFF",
                  color: "#475569",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </div>
      ) : null}

      {plan.status === "skip" ? (
        <div>
          <label
            style={{
              display: "block",
              color: "#475569",
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            Why are you skipping the{" "}
            {testName} for now?

            <textarea
              value={
                plan.skipReason
              }
              onChange={(event) =>
                updatePlan({
                  skipReason:
                    event.target
                      .value,
                })
              }
              rows={3}
              placeholder={
                testName === "SAT"
                  ? "Example: I am focusing on the ACT or my target colleges are currently test-optional."
                  : "Example: I am focusing on the SAT or my target colleges are currently test-optional."
              }
              style={{
                ...inputStyle,
                minHeight: 96,
                marginTop: 7,
                resize: "vertical",
              }}
            />
          </label>

          <button
            type="button"
            disabled={
              !plan.skipReason.trim()
            }
            onClick={
              saveSkipReason
            }
            style={{
              marginTop: 10,
              padding:
                "10px 14px",
              border: 0,
              borderRadius: 10,
              background:
                plan.skipReason.trim()
                  ? "#0F172A"
                  : "#CBD5E1",
              color:
                plan.skipReason.trim()
                  ? "#FFFFFF"
                  : "#64748B",
              cursor:
                plan.skipReason.trim()
                  ? "pointer"
                  : "not-allowed",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            Save Explanation
          </button>

          {plan.skipSavedAt ? (
            <div
              style={{
                marginTop: 7,
                color: "#15803D",
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Explanation saved.
            </div>
          ) : null}
        </div>
      ) : null}

      <div
        style={{
          marginTop: 18,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        {plan.completedAttempts
          .length ? (
          <div>
            <div
              style={{
                marginBottom: 8,
                color: "#0F172A",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Saved {testName} attempts
            </div>

            <ol
              style={{
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                listStyle: "none",
              }}
            >
              {plan.completedAttempts.map(
                (attempt, index) => (
                  <li
                    key={attempt.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "34px minmax(0,1fr) auto",
                      gap: 10,
                      alignItems:
                        "center",
                      padding: 11,
                      border:
                        "1px solid #E2E8F0",
                      borderRadius: 11,
                      background:
                        "#FFFFFF",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        borderRadius:
                          "50%",
                        background:
                          "#FFF7ED",
                        color:
                          "#C2410C",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div>
                      <div
                        style={{
                          color:
                            "#0F172A",
                          fontSize: 13,
                          fontWeight: 900,
                        }}
                      >
                        {attempt.score}
                      </div>

                      <div
                        style={{
                          marginTop: 2,
                          color:
                            "#64748B",
                          fontSize: 11,
                        }}
                      >
                        {attempt.date}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 7,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          editAttempt(
                            attempt
                          )
                        }
                        style={{
                          padding:
                            "7px 9px",
                          border:
                            "1px solid #CBD5E1",
                          borderRadius: 8,
                          background:
                            "#FFFFFF",
                          cursor:
                            "pointer",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeAttempt(
                            attempt.id
                          )
                        }
                        style={{
                          padding:
                            "7px 9px",
                          border:
                            "1px solid #FECACA",
                          borderRadius: 8,
                          background:
                            "#FEF2F2",
                          color:
                            "#B91C1C",
                          cursor:
                            "pointer",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              )}
            </ol>
          </div>
        ) : null}

        {plan.plannedDates
          .length ? (
          <div>
            <div
              style={{
                marginBottom: 8,
                color: "#0F172A",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Saved planned{" "}
              {testName} dates
            </div>

            <ol
              style={{
                margin: 0,
                padding: 0,
                display: "flex",
                flexDirection: "column",
                gap: 8,
                listStyle: "none",
              }}
            >
              {plan.plannedDates.map(
                (planned, index) => (
                  <li
                    key={planned.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "34px minmax(0,1fr) auto",
                      gap: 10,
                      alignItems:
                        "center",
                      padding: 11,
                      border:
                        "1px solid #E2E8F0",
                      borderRadius: 11,
                      background:
                        "#FFFFFF",
                    }}
                  >
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        borderRadius:
                          "50%",
                        background:
                          "#EFF6FF",
                        color:
                          "#1D4ED8",
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {index + 1}
                    </div>

                    <div
                      style={{
                        color:
                          "#0F172A",
                        fontSize: 13,
                        fontWeight: 900,
                      }}
                    >
                      {planned.date}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: 7,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          editPlannedDate(
                            planned
                          )
                        }
                        style={{
                          padding:
                            "7px 9px",
                          border:
                            "1px solid #CBD5E1",
                          borderRadius: 8,
                          background:
                            "#FFFFFF",
                          cursor:
                            "pointer",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removePlannedDate(
                            planned.id
                          )
                        }
                        style={{
                          padding:
                            "7px 9px",
                          border:
                            "1px solid #FECACA",
                          borderRadius: 8,
                          background:
                            "#FEF2F2",
                          color:
                            "#B91C1C",
                          cursor:
                            "pointer",
                          fontSize: 11,
                          fontWeight: 800,
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              )}
            </ol>
          </div>
        ) : null}

        {plan.skipReason.trim() &&
        plan.skipSavedAt ? (
          <div
            style={{
              padding: 12,
              border:
                "1px solid #E2E8F0",
              borderRadius: 11,
              background: "#FFFFFF",
            }}
          >
            <div
              style={{
                color: "#0F172A",
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Saved skip explanation
            </div>

            <p
              style={{
                margin:
                  "6px 0 0",
                color: "#475569",
                fontSize: 12,
                lineHeight: 1.5,
              }}
            >
              {plan.skipReason}
            </p>
          </div>
        ) : null}
      </div>

      {error ? (
        <div
          role="alert"
          style={{
            marginTop: 10,
            color: "#B91C1C",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {error}
        </div>
      ) : null}
    </section>
  );
}
