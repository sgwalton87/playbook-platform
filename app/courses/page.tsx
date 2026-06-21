"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Course = {
  slug: string;
  title: string;
  pillar: string | null;
  description: string | null;
  xp_reward: number | null;
  coin_reward: number | null;
  is_available: boolean | null;
  image_url?: string | null;
  flagship_order?: number | null;
};

const FILTERS = ["All", "Flagship", "Leadership", "Finance", "Civic", "SEL", "College"];

const surface = "#ffffff";
const soft = "#fbf7f1";
const ink = "#100c0a";
const muted = "#6b5f55";
const line = "#ddd2c7";
const accent = "#ff6a2c";
const mono = "'Space Mono', monospace";
const anton = "'Anton', sans-serif";

export default function CoursesPage() {
  const router = useRouter();

  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [showAllCourses, setShowAllCourses] = useState(false);

  useEffect(() => {
    const loadCourses = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .not("slug", "is", null)
        .order("flagship_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      setCourses(data || []);
      setLoading(false);
    };

    loadCourses();
  }, [router]);

  const flagshipCourses = useMemo(
    () =>
      courses
        .filter((course) => course.pillar === "Flagship")
        .sort((a, b) => (a.flagship_order || 999) - (b.flagship_order || 999)),
    [courses]
  );

  const otherCourses = useMemo(
    () =>
      courses.filter(
        (course) => course.pillar !== "Flagship" || !course.flagship_order
      ),
    [courses]
  );

  const filteredOtherCourses =
    filter === "All"
      ? otherCourses
      : courses.filter((course) => course.pillar === filter);

  if (loading) {
    return (
      <AppShell title="Courses">
        <p>Loading courses...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Courses">
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 28,
            padding: 30,
          }}
        >
          <p
            style={{
              fontFamily: mono,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: accent,
              margin: "0 0 8px",
            }}
          >
            Playbook Learning Pathway
          </p>

          <h1
            style={{
              fontFamily: anton,
              fontSize: "clamp(38px,5vw,64px)",
              lineHeight: 0.92,
              margin: 0,
              color: ink,
              textTransform: "uppercase",
            }}
          >
            Start with the <span style={{ color: accent }}>Flagship Five</span>
          </h1>

          <p style={{ color: muted, marginTop: 14, maxWidth: 760, lineHeight: 1.6 }}>
            These five courses are the core Playbook pathway for scholar-athletes:
            college readiness, leadership, social-emotional growth, NIL readiness,
            and civic voice.
          </p>

          <button
            onClick={() => router.push("/transcript")}
            style={{
              marginTop: 18,
              background: accent,
              color: ink,
              border: `1px solid ${accent}`,
              borderRadius: 999,
              padding: "12px 18px",
              fontWeight: 900,
              cursor: "pointer",
            }}
          >
            View My Transcript →
          </button>
        </section>

        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 28,
            padding: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 18,
            }}
          >
            {flagshipCourses.map((course) => (
              <article
                key={course.slug}
                onClick={() =>
                  course.is_available && router.push(`/courses/${course.slug}`)
                }
                style={{
                  border: `1px solid ${line}`,
                  borderRadius: 24,
                  overflow: "hidden",
                  background: soft,
                  cursor: course.is_available ? "pointer" : "default",
                  opacity: course.is_available ? 1 : 0.55,
                }}
              >
                <div
                  style={{
                    height: 180,
                    position: "relative",
                    background: "#ddd2c7",
                    overflow: "hidden",
                  }}
                >
                  {course.image_url && (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  )}

                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(16,12,10,0.05), rgba(16,12,10,0.55))",
                    }}
                  />

                  <div
                    style={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      background: accent,
                      color: ink,
                      width: 46,
                      height: 46,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: anton,
                      fontSize: 24,
                    }}
                  >
                    {course.flagship_order}
                  </div>

                  <span
                    style={{
                      position: "absolute",
                      bottom: 14,
                      left: 14,
                      fontFamily: mono,
                      fontSize: 10,
                      fontWeight: 900,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      background: "#ffffff",
                      color: ink,
                      padding: "6px 10px",
                      borderRadius: 999,
                    }}
                  >
                    Flagship Course
                  </span>
                </div>

                <div style={{ padding: 20 }}>
                  <h2
                    style={{
                      fontFamily: anton,
                      textTransform: "uppercase",
                      fontSize: 28,
                      lineHeight: 0.95,
                      margin: "0 0 10px",
                      color: ink,
                    }}
                  >
                    {course.title}
                  </h2>

                  <p style={{ color: muted, lineHeight: 1.55, minHeight: 70 }}>
                    {course.description}
                  </p>

                  <div
                    style={{
                      borderTop: `1px solid ${line}`,
                      paddingTop: 14,
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: mono,
                      fontSize: 11,
                      color: muted,
                    }}
                  >
                    <span>⚡ {course.xp_reward || 0} XP</span>
                    <span>💰 {course.coin_reward || 0} coins</span>
                  </div>

                  <p style={{ color: accent, fontWeight: 900, marginBottom: 0 }}>
                    Open Course →
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div style={{ marginTop: 24, display: "flex", justifyContent: "center" }}>
            <button
              onClick={() => setShowAllCourses(true)}
              style={{
                background: accent,
                color: ink,
                border: `1px solid ${accent}`,
                borderRadius: 999,
                padding: "14px 22px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Browse All Courses ↓
            </button>
          </div>
        </section>

        {showAllCourses && (
          <section
            style={{
              background: surface,
              border: `1px solid ${line}`,
              borderRadius: 28,
              padding: 24,
            }}
          >
            <h2
              style={{
                fontFamily: anton,
                textTransform: "uppercase",
                fontSize: 38,
                margin: "0 0 18px",
                color: ink,
              }}
            >
              All Courses
            </h2>

            <div
              style={{
                display: "flex",
                gap: 8,
                marginBottom: 20,
                flexWrap: "wrap",
              }}
            >
              {FILTERS.map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  style={{
                    fontFamily: mono,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    background: filter === item ? accent : "transparent",
                    color: filter === item ? ink : muted,
                    border: `1px solid ${filter === item ? accent : line}`,
                    borderRadius: 999,
                    padding: "8px 16px",
                    cursor: "pointer",
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: 16,
              }}
            >
              {filteredOtherCourses.map((course) => (
                <div
                  key={course.slug}
                  onClick={() =>
                    course.is_available &&
                    router.push(`/courses/${course.slug}`)
                  }
                  style={{
                    background: surface,
                    border: `1px solid ${line}`,
                    borderRadius: 18,
                    overflow: "hidden",
                    cursor: course.is_available ? "pointer" : "default",
                    opacity: course.is_available ? 1 : 0.5,
                  }}
                >
                  <div
                    style={{
                      height: 130,
                      background: soft,
                      borderBottom: `1px solid ${line}`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: muted,
                          fontWeight: 900,
                        }}
                      >
                        Playbook Course
                      </div>
                    )}

                    <span
                      style={{
                        position: "absolute",
                        top: 12,
                        left: 12,
                        fontFamily: mono,
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        background: accent,
                        color: ink,
                        padding: "4px 10px",
                        borderRadius: 999,
                      }}
                    >
                      {course.pillar || "Course"}
                    </span>
                  </div>

                  <div style={{ padding: 20 }}>
                    <h3
                      style={{
                        fontFamily: anton,
                        fontSize: 24,
                        margin: "0 0 8px",
                        textTransform: "uppercase",
                        color: ink,
                      }}
                    >
                      {course.title}
                    </h3>

                    <p style={{ color: muted, lineHeight: 1.5 }}>
                      {course.description}
                    </p>

                    <div
                      style={{
                        borderTop: `1px solid ${line}`,
                        marginTop: 16,
                        paddingTop: 14,
                        display: "flex",
                        justifyContent: "space-between",
                        color: muted,
                        fontFamily: mono,
                        fontSize: 11,
                      }}
                    >
                      <span>⚡ {course.xp_reward || 0} XP</span>
                      <span>💰 {course.coin_reward || 0} coins</span>
                    </div>

                    <p
                      style={{
                        color: accent,
                        fontWeight: 900,
                        marginBottom: 0,
                      }}
                    >
                      {course.is_available ? "Open Course →" : "Coming Soon"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </AppShell>
  );
}
