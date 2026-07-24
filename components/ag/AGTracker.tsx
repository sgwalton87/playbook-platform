"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { AG_SUBJECT_NAMES, AG_REQUIREMENTS } from "@/lib/agCourses";

type AGRow = {
  subject: string;
  years_completed: number | string | null;
  years_required: number | string | null;
  in_progress?: boolean | null;
  courses_taken?: string[] | null;
  current_course?: string | null;
};

type Props = {
  userId?: string;
  compact?: boolean;
  rows?: AGRow[];
};

const SUBJECTS = ["A", "B", "C", "D", "E", "F", "G"];

const COLORS = {
  navy: "#0F172A",
  ink: "#0F172A",
  muted: "#64748B",
  faint: "#94A3B8",
  line: "#E2E8F0",
  surface: "#FFFFFF",
  surface2: "#F8FAFC",
  orange: "#F97316",
  orangeLight: "#FFF7ED",
  green: "#10B981",
  greenLight: "#ECFDF5",
  amber: "#F59E0B",
  mono: "'Space Mono', monospace",
};

export default function AGTracker({
  userId,
  compact = false,
  rows: providedRows,
}: Props) {
  const [fetchedRows, setFetchedRows] = useState<AGRow[]>([]);
  const [loading, setLoading] = useState(!providedRows);

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      if (providedRows) return;

      setLoading(true);

      let resolvedUserId = userId;

      if (!resolvedUserId) {
        const { data } = await supabase.auth.getUser();
        resolvedUserId = data.user?.id;
      }

      if (!resolvedUserId) {
        if (active) {
          setFetchedRows([]);
          setLoading(false);
        }
        return;
      }

      const { data, error } = await supabase
        .from("ag_progress")
        .select(
          "subject, years_completed, years_required, in_progress, courses_taken, current_course"
        )
        .eq("user_id", resolvedUserId)
        .order("updated_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Unable to load A-G progress:", error);
        setFetchedRows([]);
      } else {
        const latestBySubject = new Map<string, AGRow>();

        for (const row of (data || []) as AGRow[]) {
          if (!latestBySubject.has(row.subject)) {
            latestBySubject.set(row.subject, row);
          }
        }

        setFetchedRows(Array.from(latestBySubject.values()));
      }

      setLoading(false);
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, [providedRows, userId]);

  const rows = providedRows || fetchedRows;

  const progress = useMemo(() => {
    return SUBJECTS.map((subject) => {
      const existing = rows.find((row) => row.subject === subject);

      const required = Number(
        existing?.years_required ?? AG_REQUIREMENTS[subject] ?? 0
      );

      const completed = Number(existing?.years_completed ?? 0);

      return {
        subject,
        name: AG_SUBJECT_NAMES[subject],
        required,
        completed,
        inProgress: Boolean(existing?.in_progress),
        courses: existing?.courses_taken || [],
        currentCourse: existing?.current_course || null,
        met: completed >= required,
      };
    });
  }, [rows]);

  const subjectsMet = progress.filter((item) => item.met).length;

  const totalRequired = progress.reduce(
    (sum, item) => sum + item.required,
    0
  );

  const totalCompleted = progress.reduce(
    (sum, item) => sum + Math.min(item.completed, item.required),
    0
  );

  const completionPercent =
    totalRequired > 0
      ? Math.round((totalCompleted / totalRequired) * 100)
      : 0;

  if (loading) {
    return (
      <div
        style={{
          border: `1px solid ${COLORS.line}`,
          borderRadius: 18,
          padding: 20,
          background: COLORS.surface,
          color: COLORS.muted,
          fontFamily: COLORS.mono,
          fontSize: 12,
        }}
      >
        Loading academic progress...
      </div>
    );
  }

  return (
    <div
      style={{
        border: `1px solid ${COLORS.line}`,
        borderRadius: 20,
        background: COLORS.surface,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: COLORS.navy,
          padding: compact ? 18 : 22,
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            fontFamily: COLORS.mono,
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: COLORS.orange,
            marginBottom: 8,
          }}
        >
          Academic Readiness
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            alignItems: "flex-end",
          }}
        >
          <div>
            <div
              style={{
                fontSize: compact ? 28 : 36,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {completionPercent}%
            </div>

            <div
              style={{
                marginTop: 7,
                color: "rgba(255,255,255,.65)",
                fontSize: 13,
              }}
            >
              {subjectsMet}/7 A-G subject areas met
            </div>
          </div>

          <div
            style={{
              fontFamily: COLORS.mono,
              fontSize: 11,
              color: "rgba(255,255,255,.6)",
            }}
          >
            {totalCompleted}/{totalRequired} years
          </div>
        </div>

        <div
          style={{
            height: 7,
            background: "rgba(255,255,255,.12)",
            borderRadius: 999,
            overflow: "hidden",
            marginTop: 16,
          }}
        >
          <div
            style={{
              width: `${Math.min(completionPercent, 100)}%`,
              height: "100%",
              background:
                completionPercent >= 100
                  ? COLORS.green
                  : COLORS.orange,
              borderRadius: 999,
              transition: "width .35s ease",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gap: 0,
        }}
      >
        {progress.map((item) => {
          const pct =
            item.required > 0
              ? Math.min((item.completed / item.required) * 100, 100)
              : 0;

          return (
            <div
              key={item.subject}
              style={{
                padding: compact ? "12px 16px" : "15px 18px",
                borderBottom: `1px solid ${COLORS.line}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: item.met
                        ? COLORS.greenLight
                        : item.inProgress
                        ? COLORS.orangeLight
                        : COLORS.surface2,
                      color: item.met
                        ? COLORS.green
                        : item.inProgress
                        ? COLORS.amber
                        : COLORS.muted,
                      fontFamily: COLORS.mono,
                      fontWeight: 700,
                    }}
                  >
                    {item.subject}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        color: COLORS.ink,
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {item.name}
                    </div>

                    {!compact && item.courses.length > 0 && (
                      <div
                        style={{
                          color: COLORS.muted,
                          fontSize: 11,
                          marginTop: 3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.courses.join(" · ")}
                      </div>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      fontFamily: COLORS.mono,
                      fontSize: 11,
                      fontWeight: 700,
                      color: item.met
                        ? COLORS.green
                        : item.inProgress
                        ? COLORS.amber
                        : COLORS.muted,
                    }}
                  >
                    {item.completed}/{item.required} yr
                  </div>

                  <div
                    style={{
                      fontSize: 10,
                      marginTop: 3,
                      color: item.met
                        ? COLORS.green
                        : item.inProgress
                        ? COLORS.amber
                        : COLORS.faint,
                    }}
                  >
                    {item.met
                      ? "Met"
                      : item.inProgress
                      ? "In progress"
                      : "Action needed"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  height: 4,
                  background: COLORS.line,
                  borderRadius: 999,
                  overflow: "hidden",
                  marginTop: 9,
                }}
              >
                <div
                  style={{
                    width: `${pct}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: item.met
                      ? COLORS.green
                      : COLORS.orange,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
