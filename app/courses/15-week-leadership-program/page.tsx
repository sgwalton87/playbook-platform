"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { addReward } from "@/lib/gamification";

type JsonObject = Record<string, unknown>;

type Activity = {
  title?: string;
  instructions?: string[];
  deliverable?: string;
  estimated_minutes?: number;
};

type Checkpoint = {
  type?: string;
  prompt?: string;
  options?: string[];
  correct_index?: number;
  explanation?: string;
};

type Interaction = {
  type?: string;
  label?: string;
  prompt?: string;
  min?: number;
  max?: number;
};

type CourseModule = {
  id: string;
  module_order: number;
  title: string;
  content: string | null;
  duration_mins: number;
  module_type: string;
  learning_objectives: string[];
  activity: Activity;
  knowledge_checkpoint: Checkpoint;
  interactions: Interaction[];
};

type CourseRecord = {
  slug: string;
  title: string;
  description: string | null;
  pillar: string | null;
  category: string | null;
  duration_mins: number | null;
  lesson_count: number | null;
};

type ModuleResponse = {
  module_order: number;
  activity_response: JsonObject;
  checkpoint_response: JsonObject;
  interaction_responses: unknown[];
};

const COURSE_SLUG = "15-week-leadership-program";
const XP_PER_WEEK = 50;
const COINS_PER_WEEK = 10;

const C = {
  navy: "#08111f",
  navy2: "#0f1f34",
  cream: "#f7f4ed",
  white: "#ffffff",
  orange: "#ff6b2c",
  blue: "#53a7ff",
  green: "#4fd1a5",
  purple: "#9c7cff",
  ink: "#132033",
  muted: "#68758a",
  line: "#dfe5ec",
};

export default function LeadershipCoursePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [course, setCourse] = useState<CourseRecord | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [responses, setResponses] = useState<Record<number, ModuleResponse>>({});
  const [activeWeek, setActiveWeek] = useState(1);
  const [activityText, setActivityText] = useState("");
  const [interactionText, setInteractionText] = useState<Record<number, string>>({});
  const [checkpointChoice, setCheckpointChoice] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void loadCourse();
  }, []);

  const activeModule = useMemo(
    () => modules.find((module) => module.module_order === activeWeek) ?? null,
    [modules, activeWeek],
  );

  const checkpointCorrect =
    activeModule && checkpointChoice !== null
      ? checkpointChoice === activeModule.knowledge_checkpoint?.correct_index
      : false;

  const percent = modules.length
    ? Math.round((completed.length / modules.length) * 100)
    : 0;

  async function loadCourse() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/login");
      return;
    }

    setUserId(user.id);

    const [{ data: courseRow, error: courseError }, { data: moduleRows, error: moduleError }] =
      await Promise.all([
        supabase
          .from("courses")
          .select("slug,title,description,pillar,category,duration_mins,lesson_count")
          .eq("slug", COURSE_SLUG)
          .single(),
        supabase
          .from("course_modules")
          .select(
            "id,module_order,title,content,duration_mins,module_type,learning_objectives,activity,knowledge_checkpoint,interactions",
          )
          .eq("course_slug", COURSE_SLUG)
          .order("module_order"),
      ]);

    if (courseError || moduleError || !courseRow || !moduleRows?.length) {
      setMessage("The leadership course could not be loaded.");
      setLoaded(true);
      return;
    }

    const [{ data: progress }, { data: responseRows }] = await Promise.all([
      supabase
        .from("course_progress")
        .select("completed_modules")
        .eq("user_id", user.id)
        .eq("course_slug", COURSE_SLUG)
        .maybeSingle(),
      supabase
        .from("course_module_responses")
        .select("module_order,activity_response,checkpoint_response,interaction_responses")
        .eq("user_id", user.id)
        .eq("course_slug", COURSE_SLUG),
    ]);

    setCourse(courseRow as CourseRecord);
    setModules(moduleRows as CourseModule[]);
    setCompleted((progress?.completed_modules as number[] | null) ?? []);

    const responseMap: Record<number, ModuleResponse> = {};
    for (const row of (responseRows ?? []) as ModuleResponse[]) {
      responseMap[row.module_order] = row;
    }
    setResponses(responseMap);

    const firstIncomplete = (moduleRows as CourseModule[]).find(
      (module) => !((progress?.completed_modules as number[] | null) ?? []).includes(module.module_order),
    );
    setActiveWeek(firstIncomplete?.module_order ?? 1);
    setLoaded(true);
  }

  useEffect(() => {
    const saved = responses[activeWeek];
    const activity = saved?.activity_response as Record<string, unknown> | undefined;
    const checkpoint = saved?.checkpoint_response as Record<string, unknown> | undefined;

    setActivityText(typeof activity?.reflection === "string" ? activity.reflection : "");
    setCheckpointChoice(typeof checkpoint?.selected_index === "number" ? checkpoint.selected_index : null);

    const interactionMap: Record<number, string> = {};
    if (Array.isArray(saved?.interaction_responses)) {
      saved.interaction_responses.forEach((value, index) => {
        if (value && typeof value === "object" && "response" in value) {
          const response = (value as { response?: unknown }).response;
          interactionMap[index] = typeof response === "string" ? response : String(response ?? "");
        }
      });
    }
    setInteractionText(interactionMap);
  }, [activeWeek, responses]);

  async function saveWork(markComplete = false) {
    if (!userId || !activeModule) return;

    if (markComplete && !activityText.trim()) {
      setMessage("Complete the activity reflection before finishing this week.");
      return;
    }

    if (markComplete && !checkpointCorrect) {
      setMessage("Answer the knowledge checkpoint correctly before finishing this week.");
      return;
    }

    setSaving(true);
    setMessage(null);

    const interactionResponses = activeModule.interactions.map((interaction, index) => ({
      type: interaction.type ?? "reflection",
      prompt: interaction.prompt ?? interaction.label ?? "Interaction",
      response: interactionText[index] ?? "",
    }));

    const payload = {
      user_id: userId,
      course_slug: COURSE_SLUG,
      module_order: activeModule.module_order,
      activity_response: {
        reflection: activityText,
        deliverable: activeModule.activity?.deliverable ?? null,
      },
      checkpoint_response: {
        selected_index: checkpointChoice,
        correct: checkpointCorrect,
      },
      interaction_responses: interactionResponses,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("course_module_responses")
      .upsert(payload, { onConflict: "user_id,course_slug,module_order" });

    if (error) {
      setSaving(false);
      setMessage(error.message);
      return;
    }

    setResponses((current) => ({
      ...current,
      [activeModule.module_order]: payload as unknown as ModuleResponse,
    }));

    if (markComplete && !completed.includes(activeModule.module_order)) {
      const nextCompleted = [...completed, activeModule.module_order].sort((a, b) => a - b);
      const courseComplete = nextCompleted.length === modules.length;

      const { error: progressError } = await supabase.from("course_progress").upsert(
        {
          user_id: userId,
          course_slug: COURSE_SLUG,
          completed_modules: nextCompleted,
          completed: courseComplete,
          completed_at: courseComplete ? new Date().toISOString() : null,
        },
        { onConflict: "user_id,course_slug" },
      );

      if (progressError) {
        setSaving(false);
        setMessage(progressError.message);
        return;
      }

      setCompleted(nextCompleted);
      await addReward(userId, { xp: XP_PER_WEEK, coins: COINS_PER_WEEK });
      setMessage(
        courseComplete
          ? "15 weeks complete. Your leadership capstone pathway is finished."
          : `Week ${activeModule.module_order} complete · +${XP_PER_WEEK} XP · +${COINS_PER_WEEK} coins`,
      );

      const next = modules.find((module) => !nextCompleted.includes(module.module_order));
      if (next) setActiveWeek(next.module_order);
    } else {
      setMessage("Your work has been saved.");
    }

    setSaving(false);
  }

  if (!loaded) {
    return <main style={{ minHeight: "100vh", background: C.cream, padding: 40 }}>Loading leadership course…</main>;
  }

  if (!course || !activeModule) {
    return <main style={{ minHeight: "100vh", background: C.cream, padding: 40 }}>{message ?? "Course unavailable."}</main>;
  }

  return (
    <main style={{ minHeight: "100vh", background: C.cream, color: C.ink }}>
      <header
        style={{
          background: `radial-gradient(circle at 80% 20%, rgba(83,167,255,.28), transparent 28%), radial-gradient(circle at 20% 10%, rgba(255,107,44,.24), transparent 24%), ${C.navy}`,
          color: C.white,
          padding: "52px clamp(20px,5vw,72px) 44px",
        }}
      >
        <button onClick={() => router.push("/courses")} style={ghostButton}>← Courses</button>
        <div style={{ maxWidth: 1100, margin: "34px auto 0" }}>
          <div style={{ fontSize: 12, letterSpacing: ".16em", textTransform: "uppercase", color: C.orange, fontWeight: 800 }}>
            Playbook Series · Youth Leadership
          </div>
          <h1 style={{ fontSize: "clamp(38px,7vw,82px)", lineHeight: .95, margin: "12px 0 20px", maxWidth: 900 }}>
            {course.title}
          </h1>
          <p style={{ maxWidth: 760, fontSize: 18, lineHeight: 1.6, color: "#c8d4e3" }}>{course.description}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 28 }}>
            <Stat value={`${completed.length}/${modules.length}`} label="weeks complete" />
            <Stat value={`${percent}%`} label="course progress" />
            <Stat value={`${course.duration_mins ?? 0}m`} label="guided learning" />
            <Stat value={`${XP_PER_WEEK * modules.length}`} label="total XP" />
          </div>
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: "0 auto", padding: "34px 20px 80px", display: "grid", gridTemplateColumns: "minmax(220px,300px) minmax(0,1fr)", gap: 28 }}>
        <aside style={{ alignSelf: "start", position: "sticky", top: 20, background: C.white, border: `1px solid ${C.line}`, borderRadius: 22, padding: 14, maxHeight: "calc(100vh - 40px)", overflowY: "auto" }}>
          <div style={{ padding: "10px 10px 14px", fontSize: 12, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>15-week pathway</div>
          {modules.map((module) => {
            const done = completed.includes(module.module_order);
            const active = module.module_order === activeWeek;
            return (
              <button
                key={module.id}
                onClick={() => setActiveWeek(module.module_order)}
                style={{
                  width: "100%",
                  border: active ? `1px solid ${C.orange}` : "1px solid transparent",
                  background: active ? "#fff4ee" : "transparent",
                  borderRadius: 14,
                  padding: "12px 10px",
                  marginBottom: 5,
                  cursor: "pointer",
                  textAlign: "left",
                  display: "grid",
                  gridTemplateColumns: "32px 1fr",
                  gap: 8,
                  color: C.ink,
                }}
              >
                <span style={{ width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: 9, background: done ? C.green : C.navy, color: C.white, fontSize: 12, fontWeight: 800 }}>{done ? "✓" : module.module_order}</span>
                <span>
                  <strong style={{ display: "block", fontSize: 13, lineHeight: 1.25 }}>{module.title.replace(/^Week \d+:\s*/, "")}</strong>
                  <span style={{ display: "block", color: C.muted, fontSize: 11, marginTop: 3 }}>{module.duration_mins} min</span>
                </span>
              </button>
            );
          })}
        </aside>

        <article style={{ minWidth: 0 }}>
          {message && <div style={{ marginBottom: 18, padding: "14px 18px", borderRadius: 14, background: C.navy, color: C.white }}>{message}</div>}

          <section style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div>
                <div style={eyebrow}>Week {activeModule.module_order} · {activeModule.module_type}</div>
                <h2 style={{ fontSize: "clamp(28px,4vw,48px)", margin: "7px 0 10px" }}>{activeModule.title.replace(/^Week \d+:\s*/, "")}</h2>
                <p style={{ fontSize: 17, lineHeight: 1.7, color: C.muted }}>{activeModule.content}</p>
              </div>
              <span style={{ background: "#eef6ff", color: C.blue, borderRadius: 999, padding: "8px 12px", fontWeight: 800, fontSize: 12 }}>{activeModule.duration_mins} MIN</span>
            </div>
          </section>

          <section style={card}>
            <div style={eyebrow}>Know what winning looks like</div>
            <h3 style={sectionTitle}>Learning objectives</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {activeModule.learning_objectives.map((objective, index) => (
                <div key={objective} style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: 10, alignItems: "start" }}>
                  <span style={numberDot}>{index + 1}</span>
                  <span style={{ lineHeight: 1.55 }}>{objective}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...card, borderTop: `4px solid ${C.orange}` }}>
            <div style={eyebrow}>Do the work</div>
            <h3 style={sectionTitle}>{activeModule.activity?.title ?? "Leadership activity"}</h3>
            <ol style={{ paddingLeft: 22, lineHeight: 1.7, color: C.ink }}>
              {(activeModule.activity?.instructions ?? []).map((instruction) => <li key={instruction} style={{ marginBottom: 8 }}>{instruction}</li>)}
            </ol>
            {activeModule.activity?.deliverable && <p style={{ marginTop: 16, padding: 14, borderRadius: 12, background: "#fff5ee" }}><strong>Deliverable:</strong> {activeModule.activity.deliverable}</p>}
            <label style={label}>Activity reflection / evidence note</label>
            <textarea
              value={activityText}
              onChange={(event) => setActivityText(event.target.value)}
              placeholder="Capture what you did, what you noticed, and the evidence you want to remember…"
              style={textarea}
            />
          </section>

          <section style={{ ...card, borderTop: `4px solid ${C.purple}` }}>
            <div style={eyebrow}>Interact</div>
            <h3 style={sectionTitle}>Leadership lab</h3>
            <div style={{ display: "grid", gap: 18 }}>
              {activeModule.interactions.map((interaction, index) => (
                <div key={`${interaction.type}-${index}`}>
                  <label style={label}>{interaction.prompt ?? interaction.label ?? `Interaction ${index + 1}`}</label>
                  <textarea
                    value={interactionText[index] ?? ""}
                    onChange={(event) => setInteractionText((current) => ({ ...current, [index]: event.target.value }))}
                    style={{ ...textarea, minHeight: 90 }}
                    placeholder="Your response…"
                  />
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...card, borderTop: `4px solid ${C.blue}` }}>
            <div style={eyebrow}>Knowledge checkpoint</div>
            <h3 style={sectionTitle}>{activeModule.knowledge_checkpoint?.prompt}</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {(activeModule.knowledge_checkpoint?.options ?? []).map((option, index) => {
                const selected = checkpointChoice === index;
                return (
                  <button
                    key={option}
                    onClick={() => setCheckpointChoice(index)}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: 14,
                      border: selected ? `2px solid ${C.blue}` : `1px solid ${C.line}`,
                      background: selected ? "#eef6ff" : C.white,
                      cursor: "pointer",
                      fontSize: 15,
                      color: C.ink,
                    }}
                  >
                    <strong style={{ marginRight: 10 }}>{String.fromCharCode(65 + index)}.</strong>{option}
                  </button>
                );
              })}
            </div>
            {checkpointChoice !== null && (
              <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: checkpointCorrect ? "#edfff8" : "#fff3f1", color: checkpointCorrect ? "#176b50" : "#9f3427" }}>
                <strong>{checkpointCorrect ? "Correct." : "Not yet."}</strong> {checkpointCorrect ? activeModule.knowledge_checkpoint?.explanation : "Review the module and try again."}
              </div>
            )}
          </section>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button disabled={saving} onClick={() => void saveWork(false)} style={secondaryButton}>{saving ? "Saving…" : "Save work"}</button>
            <button disabled={saving || completed.includes(activeWeek)} onClick={() => void saveWork(true)} style={primaryButton}>
              {completed.includes(activeWeek) ? "Week complete ✓" : `Complete Week ${activeWeek}`}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div style={{ minWidth: 130, padding: "12px 15px", borderRadius: 14, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" }}><strong style={{ display: "block", fontSize: 20 }}>{value}</strong><span style={{ fontSize: 11, color: "#9fb0c4", textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</span></div>;
}

const card: React.CSSProperties = { background: C.white, border: `1px solid ${C.line}`, borderRadius: 22, padding: "clamp(20px,4vw,34px)", marginBottom: 20, boxShadow: "0 12px 35px rgba(15,31,52,.05)" };
const eyebrow: React.CSSProperties = { fontSize: 11, textTransform: "uppercase", letterSpacing: ".14em", color: C.orange, fontWeight: 900 };
const sectionTitle: React.CSSProperties = { fontSize: 24, margin: "8px 0 18px" };
const label: React.CSSProperties = { display: "block", margin: "18px 0 8px", fontSize: 13, fontWeight: 800 };
const textarea: React.CSSProperties = { width: "100%", minHeight: 130, resize: "vertical", borderRadius: 14, border: `1px solid ${C.line}`, padding: 14, font: "inherit", lineHeight: 1.55, color: C.ink, background: "#fbfcfd" };
const numberDot: React.CSSProperties = { width: 28, height: 28, display: "grid", placeItems: "center", borderRadius: 9, background: C.navy, color: C.white, fontSize: 12, fontWeight: 800 };
const primaryButton: React.CSSProperties = { border: 0, borderRadius: 14, padding: "14px 20px", background: C.orange, color: C.white, fontWeight: 900, cursor: "pointer" };
const secondaryButton: React.CSSProperties = { border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 20px", background: C.white, color: C.ink, fontWeight: 800, cursor: "pointer" };
const ghostButton: React.CSSProperties = { border: "1px solid rgba(255,255,255,.2)", borderRadius: 12, padding: "9px 12px", background: "rgba(255,255,255,.06)", color: C.white, cursor: "pointer" };
