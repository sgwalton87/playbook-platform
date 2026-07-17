"use client";

import { useMemo, useState } from "react";

import {
  ACTIVITY_CATEGORIES,
  getActivityOptions,
  searchActivities,
  type ActivityCategory,
} from "@/lib/education";

import SportPositionField from "@/components/onboarding/SportPositionField";

export type ScholarActivityEntry = {
  id: string;
  category: ActivityCategory | "";
  activity: string;
  roleTitle: string;
  organization: string;
  supervisor: string;
  hoursPerWeek: string;
  totalHours: string;
  description: string;
};

type Props = {
  fieldKey: string;
  label: string;
  value: unknown;
  helpText?: string;
  error?: string;
  onChange: (
    activities: ScholarActivityEntry[]
  ) => void;
  onBlur?: (value: string) => void;
};

const EMPTY_DRAFT: ScholarActivityEntry = {
  id: "",
  category: "",
  activity: "",
  roleTitle: "",
  organization: "",
  supervisor: "",
  hoursPerWeek: "",
  totalHours: "",
  description: "",
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

function createId(): string {
  return (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}`
  );
}

function normalizeEntry(
  value: any,
  index: number
): ScholarActivityEntry {
  return {
    id:
      String(value?.id || "").trim() ||
      `activity-${index}`,
    category:
      (value?.category ||
        value?.activity_type ||
        "") as ActivityCategory | "",
    activity: String(
      value?.activity ||
        value?.activity_name ||
        ""
    ),
    roleTitle: String(
      value?.roleTitle ||
        value?.role_title ||
        ""
    ),
    organization: String(
      value?.organization || ""
    ),
    supervisor: String(
      value?.supervisor ||
        value?.mentor_supervisor ||
        ""
    ),
    hoursPerWeek: String(
      value?.hoursPerWeek ||
        value?.hours_per_week ||
        ""
    ),
    totalHours: String(
      value?.totalHours ||
        value?.total_hours ||
        value?.hours ||
        ""
    ),
    description: String(
      value?.description || ""
    ),
  };
}

export default function ActivityListField({
  fieldKey,
  label,
  value,
  helpText,
  error,
  onChange,
  onBlur,
}: Props) {
  const activities = Array.isArray(value)
    ? value.map(normalizeEntry)
    : [];

  const [draft, setDraft] =
    useState<ScholarActivityEntry>({
      ...EMPTY_DRAFT,
    });

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [activityMenuOpen, setActivityMenuOpen] =
    useState(false);

  const activityOptions = useMemo(
    () =>
      getActivityOptions(
        draft.category
      ),
    [draft.category]
  );

  const activityMatches = useMemo(
    () =>
      searchActivities(
        draft.category,
        draft.activity
      ),
    [
      draft.category,
      draft.activity,
    ]
  );

  function updateDraft(
    patch: Partial<ScholarActivityEntry>
  ) {
    setDraft((current) => ({
      ...current,
      ...patch,
    }));
  }

  function resetDraft() {
    setDraft({
      ...EMPTY_DRAFT,
    });

    setEditingId(null);
    setActivityMenuOpen(false);
  }

  function saveActivity() {
    if (!draft.category) {
      return;
    }

    if (!draft.activity.trim()) {
      return;
    }

    const entry: ScholarActivityEntry = {
      ...draft,
      id:
        editingId ||
        draft.id ||
        createId(),
      activity: draft.activity.trim(),
      roleTitle: draft.roleTitle.trim(),
      organization:
        draft.organization.trim(),
      supervisor: draft.supervisor.trim(),
      hoursPerWeek:
        draft.hoursPerWeek.trim(),
      totalHours:
        draft.totalHours.trim(),
      description:
        draft.description.trim(),
    };

    const next = editingId
      ? activities.map((activity) =>
          activity.id === editingId
            ? entry
            : activity
        )
      : [...activities, entry];

    onChange(next);
    onBlur?.(entry.activity);
    resetDraft();
  }

  function editActivity(
    activity: ScholarActivityEntry
  ) {
    setDraft({
      ...activity,
    });

    setEditingId(activity.id);
    setActivityMenuOpen(false);
  }

  function removeActivity(id: string) {
    onChange(
      activities.filter(
        (activity) =>
          activity.id !== id
      )
    );

    if (editingId === id) {
      resetDraft();
    }
  }

  return (
    <section
      data-field-key={fieldKey}
      style={{
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          marginBottom: 6,
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
            margin: "0 0 16px",
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
          padding: 18,
          border: "1px solid #E2E8F0",
          borderRadius: 14,
          background: "#F8FAFC",
        }}
      >
        <div
          style={{
            marginBottom: 14,
          }}
        >
          <label
            htmlFor={`${fieldKey}-category`}
            style={{
              display: "block",
              marginBottom: 6,
              color: "#475569",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            1. Category
          </label>

          <select
            id={`${fieldKey}-category`}
            value={draft.category}
            onChange={(event) => {
              updateDraft({
                category:
                  event.target
                    .value as ActivityCategory,
                activity: "",
              });

              setActivityMenuOpen(false);
            }}
            style={{
              ...inputStyle,
              cursor: "pointer",
            }}
          >
            <option value="">
              Choose a category...
            </option>

            {ACTIVITY_CATEGORIES.map(
              (category) => (
                <option
                  key={category}
                  value={category}
                >
                  {category}
                </option>
              )
            )}
          </select>
        </div>

        <div
          style={{
            position: "relative",
            marginBottom: 14,
            zIndex:
              activityMenuOpen
                ? 100
                : 1,
          }}
        >
          <label
            htmlFor={`${fieldKey}-activity`}
            style={{
              display: "block",
              marginBottom: 6,
              color: "#475569",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            2. Activity
          </label>

          <input
            id={`${fieldKey}-activity`}
            type="text"
            autoComplete="off"
            disabled={!draft.category}
            value={draft.activity}
            placeholder={
              draft.category
                ? `Select or type an activity within ${draft.category}...`
                : "Choose a category first"
            }
            onFocus={() => {
              if (draft.category) {
                setActivityMenuOpen(true);
              }
            }}
            onChange={(event) => {
              updateDraft({
                activity:
                  event.target.value,
              });

              setActivityMenuOpen(true);
            }}
            onBlur={() => {
              setTimeout(
                () =>
                  setActivityMenuOpen(
                    false
                  ),
                150
              );
            }}
            style={{
              ...inputStyle,
              cursor: draft.category
                ? "text"
                : "not-allowed",
              background:
                draft.category
                  ? "#FFFFFF"
                  : "#F1F5F9",
            }}
          />

          {activityMenuOpen &&
          draft.category ? (
            <div
              role="listbox"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                width: "100%",
                maxHeight: 280,
                overflowY: "auto",
                border:
                  "1px solid #CBD5E1",
                borderRadius: 12,
                background: "#FFFFFF",
                boxShadow:
                  "0 18px 45px rgba(15,23,42,.18)",
                zIndex: 10000,
              }}
            >
              {activityMatches.length ? (
                activityMatches.map(
                  (activity) => (
                    <button
                      key={activity}
                      type="button"
                      onMouseDown={(
                        event
                      ) => {
                        event.preventDefault();

                        updateDraft({
                          activity,
                        });

                        setActivityMenuOpen(
                          false
                        );
                      }}
                      style={{
                        display: "block",
                        width: "100%",
                        padding:
                          "11px 14px",
                        border: 0,
                        borderBottom:
                          "1px solid #E2E8F0",
                        background:
                          "#FFFFFF",
                        color:
                          "#0F172A",
                        textAlign:
                          "left",
                        cursor:
                          "pointer",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {activity}
                    </button>
                  )
                )
              ) : (
                <div
                  style={{
                    padding: 14,
                    color: "#64748B",
                    fontSize: 13,
                  }}
                >
                  No existing activity
                  matched. You may use the
                  activity you typed.
                </div>
              )}
            </div>
          ) : null}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <label
            style={{
              color: "#475569",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {draft.category === "Athletics"
              ? "Position, role, or title"
              : "Role or title"}

            {draft.category === "Athletics" &&
            draft.activity ? (
              <SportPositionField
                fieldId={`${fieldKey}-sport-position`}
                sport={draft.activity}
                value={draft.roleTitle}
                onChange={(roleTitle) =>
                  updateDraft({
                    roleTitle,
                  })
                }
              />
            ) : (
              <input
                value={draft.roleTitle}
                placeholder="Captain, president, volunteer..."
                onChange={(event) =>
                  updateDraft({
                    roleTitle:
                      event.target.value,
                  })
                }
                style={{
                  ...inputStyle,
                  marginTop: 6,
                }}
              />
            )}
          </label>

          <label
            style={{
              color: "#475569",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            Organization

            <input
              value={
                draft.organization
              }
              placeholder="School, nonprofit, company..."
              onChange={(event) =>
                updateDraft({
                  organization:
                    event.target.value,
                })
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
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <label
            style={{
              color: "#475569",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            Hours per week

            <input
              type="number"
              min="0"
              step="0.5"
              value={
                draft.hoursPerWeek
              }
              placeholder="Example: 5"
              onChange={(event) =>
                updateDraft({
                  hoursPerWeek:
                    event.target.value,
                })
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
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            Total hours

            <input
              type="number"
              min="0"
              step="0.5"
              value={draft.totalHours}
              placeholder="Example: 100"
              onChange={(event) =>
                updateDraft({
                  totalHours:
                    event.target.value,
                })
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
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            Mentor or supervisor

            <input
              value={draft.supervisor}
              placeholder="Coach, teacher, manager..."
              onChange={(event) =>
                updateDraft({
                  supervisor:
                    event.target.value,
                })
              }
              style={{
                ...inputStyle,
                marginTop: 6,
              }}
            />
          </label>
        </div>

        <label
          style={{
            display: "block",
            color: "#475569",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          Description

          <textarea
            rows={4}
            value={draft.description}
            placeholder="What did you do? What impact did you make? What did you learn?"
            onChange={(event) =>
              updateDraft({
                description:
                  event.target.value,
              })
            }
            style={{
              ...inputStyle,
              minHeight: 110,
              marginTop: 6,
              resize: "vertical",
            }}
          />
        </label>

        <div
          style={{
            display: "flex",
            gap: 10,
            marginTop: 14,
          }}
        >
          <button
            type="button"
            disabled={
              !draft.category ||
              !draft.activity.trim()
            }
            onClick={saveActivity}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: 0,
              borderRadius: 11,
              background:
                draft.category &&
                draft.activity.trim()
                  ? "#F97316"
                  : "#CBD5E1",
              color:
                draft.category &&
                draft.activity.trim()
                  ? "#FFFFFF"
                  : "#64748B",
              cursor:
                draft.category &&
                draft.activity.trim()
                  ? "pointer"
                  : "not-allowed",
              fontSize: 12,
              fontWeight: 900,
            }}
          >
            {editingId
              ? "Update Entry"
              : "Add Entry"}
          </button>

          {editingId ? (
            <button
              type="button"
              onClick={resetDraft}
              style={{
                padding:
                  "12px 16px",
                border:
                  "1px solid #CBD5E1",
                borderRadius: 11,
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

      <div
        style={{
          marginTop: 18,
        }}
      >
        {activities.length ? (
          <ol
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              margin: 0,
              padding: 0,
              listStyle: "none",
            }}
          >
            {activities.map(
              (activity, index) => (
                <li
                  key={activity.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "42px minmax(0, 1fr) auto",
                    gap: 12,
                    alignItems: "start",
                    padding: 14,
                    border:
                      "1px solid #E2E8F0",
                    borderRadius: 13,
                    background:
                      "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius:
                        "50%",
                      display: "flex",
                      alignItems:
                        "center",
                      justifyContent:
                        "center",
                      background:
                        "#FFF7ED",
                      color:
                        "#C2410C",
                      fontSize: 13,
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
                        fontSize: 14,
                        fontWeight: 900,
                      }}
                    >
                      {activity.activity}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        color:
                          "#64748B",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {activity.category}

                      {activity.roleTitle
                        ? ` · ${activity.roleTitle}`
                        : ""}

                      {activity.organization
                        ? ` · ${activity.organization}`
                        : ""}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        color:
                          "#64748B",
                        fontSize: 12,
                        lineHeight: 1.5,
                      }}
                    >
                      {activity.hoursPerWeek
                        ? `${activity.hoursPerWeek} hrs/week`
                        : "Weekly hours not listed"}

                      {" · "}

                      {activity.totalHours
                        ? `${activity.totalHours} total hrs`
                        : "Total hours not listed"}

                      {activity.supervisor
                        ? ` · ${activity.supervisor}`
                        : ""}
                    </div>

                    {activity.description ? (
                      <p
                        style={{
                          margin:
                            "7px 0 0",
                          color:
                            "#475569",
                          fontSize: 13,
                          lineHeight: 1.5,
                        }}
                      >
                        {
                          activity.description
                        }
                      </p>
                    ) : null}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        editActivity(
                          activity
                        )
                      }
                      style={{
                        padding:
                          "8px 10px",
                        border:
                          "1px solid #CBD5E1",
                        borderRadius: 9,
                        background:
                          "#FFFFFF",
                        color:
                          "#0F172A",
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
                        removeActivity(
                          activity.id
                        )
                      }
                      style={{
                        padding:
                          "8px 10px",
                        border:
                          "1px solid #FECACA",
                        borderRadius: 9,
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
        ) : (
          <p
            style={{
              margin: 0,
              color: "#64748B",
              fontSize: 13,
            }}
          >
            No activity entries added yet.
          </p>
        )}
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
