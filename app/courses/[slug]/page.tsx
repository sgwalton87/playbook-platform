"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type Course = {
  slug: string;
  title: string;
  pillar: string;
  description: string;
  xp_reward: number;
  coin_reward: number;
};

type Module = {
  module_order: number;
  title: string;
  content: string;
};

const surface = "#ffffff";
const soft = "#fbf7f1";
const ink = "#100c0a";
const muted = "#6b5f55";
const line = "#ddd2c7";
const accent = "#ff6a2c";

const badgeTriggerMap: Record<string, number> = {
  "college-application-playbook": 1,
  "captains-mindset": 2,
  "social-emotional-foundations": 3,
  "nil-readiness-for-athletes": 4,
  "civic-engagement-for-young-leaders": 5,
  "money-in-the-game": 6,
  "credit-and-debt": 7,
};

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [userId, setUserId] = useState("");
  const [studentName, setStudentName] = useState("Playbook Scholar-Athlete");
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [courseComplete, setCourseComplete] = useState(false);
  const [alreadyRewarded, setAlreadyRewarded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [savingReward, setSavingReward] = useState(false);

  const printStyles = `
    @media print {
      body * {
        visibility: hidden;
      }

      #playbook-certificate,
      #playbook-certificate * {
        visibility: visible;
      }

      #playbook-certificate {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        max-width: none !important;
        margin: 0 !important;
        border-radius: 0 !important;
      }

      .no-print {
        display: none !important;
      }
    }
  `;

  useEffect(() => {
    const loadCourse = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      setUserId(userData.user.id);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", userData.user.id)
        .single();

      const fullName =
        `${profileData?.first_name || ""} ${profileData?.last_name || ""}`.trim();

      if (fullName) setStudentName(fullName);

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .single();

      if (courseError || !courseData) {
        setLoading(false);
        return;
      }

      const { data: moduleData } = await supabase
        .from("course_modules")
        .select("*")
        .eq("course_slug", slug)
        .order("module_order", { ascending: true });

      const { data: progressData } = await supabase
        .from("course_progress")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("course_slug", slug)
        .maybeSingle();

      const { data: certificateData } = await supabase
        .from("certificates")
        .select("id")
        .eq("user_id", userData.user.id)
        .eq("course_slug", slug)
        .maybeSingle();

      setCourse(courseData);
      setModules(moduleData || []);
      setCompletedModules(progressData?.completed_modules || []);
      setCourseComplete(progressData?.completed || !!certificateData);
      setAlreadyRewarded(!!certificateData);
      setLoading(false);
    };

    loadCourse();
  }, [router, slug]);

  const fireConfetti = async () => {
    const confetti = (await import("canvas-confetti")).default;

    confetti({
      particleCount: 140,
      spread: 90,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      confetti({
        particleCount: 90,
        spread: 120,
        origin: { y: 0.7 },
      });
    }, 250);
  };

  const awardBadgeIfAvailable = async () => {
    const triggerValue = badgeTriggerMap[slug];

    if (!triggerValue || !userId) return;

    const { data: badge } = await supabase
      .from("badges")
      .select("id, name")
      .eq("trigger_type", "course_completed")
      .eq("trigger_value", triggerValue)
      .maybeSingle();

    if (!badge?.id) return;

    const { data: existingUserBadge } = await supabase
      .from("user_badges")
      .select("id")
      .eq("user_id", userId)
      .eq("badge_id", badge.id)
      .maybeSingle();

    if (existingUserBadge) return;

    await supabase.from("user_badges").insert({
      user_id: userId,
      badge_id: badge.id,
    });
  };

  const completeCourse = async (showConfetti = true) => {
    if (!course || !userId || savingReward) return;

    setSavingReward(true);

    if (showConfetti) {
      await fireConfetti();
    }

    const allModules = modules.map((m) => m.module_order);

    await supabase.from("course_progress").upsert({
      user_id: userId,
      course_slug: slug,
      completed_modules: allModules,
      completed: true,
      completed_at: new Date().toISOString(),
    });

    const { data: existingCertificate } = await supabase
      .from("certificates")
      .select("id")
      .eq("user_id", userId)
      .eq("course_slug", slug)
      .maybeSingle();

    if (existingCertificate) {
      setCompletedModules(allModules);
      setCourseComplete(true);
      setAlreadyRewarded(true);
      setSavingReward(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, coin_balance, first_name, last_name")
      .eq("id", userId)
      .single();

    await supabase
      .from("profiles")
      .update({
        xp: (profile?.xp || 0) + course.xp_reward,
        coin_balance: (profile?.coin_balance || 0) + course.coin_reward,
      })
      .eq("id", userId);

    await supabase.from("certificates").insert({
      user_id: userId,
      course_slug: slug,
      certificate_name: `${course.title} Certificate`,
    });

    await awardBadgeIfAvailable();

    const feedName =
      `${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() ||
      "A Playbook scholar";

    await supabase.from("feed_posts").insert({
      user_id: userId,
      post_type: "course_completed",
      title: `🎓 ${feedName} completed ${course.title}`,
      body: `+${course.xp_reward} XP · +${course.coin_reward} coins · Certificate unlocked`,
    });

    setCompletedModules(allModules);
    setCourseComplete(true);
    setAlreadyRewarded(true);
    setSavingReward(false);
  };

  const toggleModule = async (moduleOrder: number) => {
    if (!userId || !course) return;

    const nextCompleted = completedModules.includes(moduleOrder)
      ? completedModules.filter((m) => m !== moduleOrder)
      : [...completedModules, moduleOrder];

    const isComplete =
      modules.length > 0 && nextCompleted.length === modules.length;

    setCompletedModules(nextCompleted);
    setCourseComplete(isComplete);

    await supabase.from("course_progress").upsert({
      user_id: userId,
      course_slug: slug,
      completed_modules: nextCompleted,
      completed: isComplete,
      completed_at: isComplete ? new Date().toISOString() : null,
    });

    if (isComplete && !alreadyRewarded) {
      await completeCourse(true);
    }
  };

  if (loading) {
    return (
      <AppShell title="Course">
        <p>Loading course...</p>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell title="Course">
        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h2>Course not found</h2>
          <button onClick={() => router.push("/courses")}>Back to Courses</button>
        </section>
      </AppShell>
    );
  }

  const progress =
    modules.length === 0
      ? 0
      : Math.round((completedModules.length / modules.length) * 100);

  return (
    <AppShell title={course.title}>
      <style>{printStyles}</style>

      <div style={{ display: "grid", gap: 24 }}>
        <section
          className="no-print"
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 28,
          }}
        >
          <h1 style={{ marginTop: 0, color: ink }}>{course.title}</h1>

          <p style={{ color: muted, lineHeight: 1.6 }}>{course.description}</p>

          <p style={{ color: muted }}>
            ⚡ {course.xp_reward} XP · 💰 {course.coin_reward} coins
          </p>

          <div
            style={{
              height: 12,
              background: soft,
              border: `1px solid ${line}`,
              borderRadius: 999,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: accent,
              }}
            />
          </div>

          <p style={{ color: muted }}>{progress}% complete</p>
        </section>

        <section
          className="no-print"
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h2 style={{ marginTop: 0 }}>Modules</h2>

          <div style={{ display: "grid", gap: 12 }}>
            {modules.map((module) => {
              const done = completedModules.includes(module.module_order);

              return (
                <div
                  key={module.module_order}
                  style={{
                    background: done ? "#fff3eb" : soft,
                    border: `1px solid ${done ? accent : line}`,
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>
                    Module {module.module_order}: {module.title}
                  </h3>

                  <p style={{ color: muted }}>{module.content}</p>

                  <button
                    onClick={() => toggleModule(module.module_order)}
                    style={{
                      background: done ? soft : accent,
                      color: ink,
                      border: `1px solid ${done ? line : accent}`,
                      borderRadius: 12,
                      padding: "10px 14px",
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {done ? "Completed ✓" : "Mark Complete"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 24,
            padding: 24,
          }}
        >
          <h2 className="no-print" style={{ marginTop: 0 }}>
            Certificate
          </h2>

          {courseComplete ? (
            <>
              <div
                id="playbook-certificate"
                style={{
                  background: "#fffdf8",
                  border: `3px solid ${accent}`,
                  borderRadius: 24,
                  padding: 40,
                  textAlign: "center",
                  color: ink,
                  maxWidth: 850,
                  margin: "0 auto",
                }}
              >
                <img
                  src="/assets/pb-logo-framed.png"
                  alt="Playbook Series"
                  style={{
                    width: 120,
                    height: 120,
                    objectFit: "contain",
                    marginBottom: 20,
                  }}
                />

                <p
                  style={{
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: accent,
                    fontWeight: 900,
                  }}
                >
                  Playbook Series Inc.
                </p>

                <h1
                  style={{
                    fontSize: 52,
                    margin: "12px 0",
                    textTransform: "uppercase",
                  }}
                >
                  Certificate of Completion
                </h1>

                <p style={{ color: muted }}>This certifies that</p>

                <h2 style={{ fontSize: 34, margin: "16px 0" }}>
                  {studentName}
                </h2>

                <p style={{ color: muted }}>has successfully completed</p>

                <h2
                  style={{
                    fontSize: 38,
                    color: accent,
                    margin: "16px 0",
                  }}
                >
                  {course.title}
                </h2>

                <p style={{ color: muted }}>
                  Awarded {new Date().toLocaleDateString()}
                </p>

                <div
                  style={{
                    marginTop: 30,
                    borderTop: `1px solid ${line}`,
                    paddingTop: 18,
                    color: muted,
                  }}
                >
                  ⚡ {course.xp_reward} XP · 💰 {course.coin_reward} Coins ·
                  Playbook Certified
                </div>
              </div>

              <button
                className="no-print"
                onClick={() => window.print()}
                style={{
                  marginTop: 20,
                  background: accent,
                  color: ink,
                  border: `1px solid ${accent}`,
                  borderRadius: 12,
                  padding: "14px 18px",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Download / Print Certificate
              </button>
            </>
          ) : (
            <div
              style={{
                border: `2px dashed ${line}`,
                borderRadius: 20,
                padding: 32,
                textAlign: "center",
                color: muted,
              }}
            >
              Complete all modules to unlock your certificate.
            </div>
          )}

          <button
            className="no-print"
            onClick={() => completeCourse(true)}
            disabled={courseComplete || savingReward}
            style={{
              marginTop: 20,
              background: courseComplete ? soft : accent,
              color: ink,
              border: `1px solid ${courseComplete ? line : accent}`,
              borderRadius: 12,
              padding: "14px 18px",
              fontWeight: 900,
              cursor: courseComplete ? "not-allowed" : "pointer",
            }}
          >
            {savingReward
              ? "Saving..."
              : courseComplete
              ? alreadyRewarded
                ? "Course Complete ✓ Rewards Issued"
                : "Course Complete ✓"
              : "Complete Full Course"}
          </button>
        </section>
      </div>
    </AppShell>
  );
}
