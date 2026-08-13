"use client";

import { type CSSProperties, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { addReward } from "@/lib/gamification";

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
  prompt?: string;
  label?: string;
};

type CivicModule = {
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

type CivicCourse = {
  slug: string;
  title: string;
  description: string | null;
  duration_mins: number | null;
  lesson_count: number | null;
};

type SavedResponse = {
  module_order: number;
  activity_response: Record<string, unknown>;
  checkpoint_response: Record<string, unknown>;
  interaction_responses: unknown[];
};

const SLUG = "civic-engagement-for-young-leaders";
const XP_PER_MODULE = 60;
const COINS_PER_MODULE = 15;

const P = {
  ink: "#08101f",
  navy: "#071526",
  navy2: "#102b46",
  cream: "#f7f3e9",
  white: "#fff",
  orange: "#ff6b2c",
  cyan: "#42c9d8",
  blue: "#579bff",
  lime: "#a5d66a",
  violet: "#a78bfa",
  muted: "#65758b",
  line: "#dce3ea",
};

export default function YouthCivicFlagshipPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [course, setCourse] = useState<CivicCourse | null>(null);
  const [modules, setModules] = useState<CivicModule[]>([]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [saved, setSaved] = useState<Record<number, SavedResponse>>({});
  const [active, setActive] = useState(1);
  const [activityResponse, setActivityResponse] = useState("");
  const [interactionResponses, setInteractionResponses] = useState<Record<number, string>>({});
  const [checkpointChoice, setCheckpointChoice] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const module = useMemo(
    () => modules.find((item) => item.module_order === active) ?? null,
    [active, modules],
  );

  const checkpointCorrect =
    module && checkpointChoice !== null
      ? checkpointChoice === module.knowledge_checkpoint?.correct_index
      : false;

  const progress = modules.length
    ? Math.round((completed.length / modules.length) * 100)
    : 0;

  useEffect(() => {
    void hydrate();
  }, []);

  useEffect(() => {
    const response = saved[active];
    const activity = response?.activity_response;
    const checkpoint = response?.checkpoint_response;

    setActivityResponse(
      typeof activity?.reflection === "string" ? activity.reflection : "",
    );
    setCheckpointChoice(
      typeof checkpoint?.selected_index === "number"
        ? checkpoint.selected_index
        : null,
    );

    const nextInteractions: Record<number, string> = {};
    if (Array.isArray(response?.interaction_responses)) {
      response.interaction_responses.forEach((entry, index) => {
        if (entry && typeof entry === "object" && "response" in entry) {
          const value = (entry as { response?: unknown }).response;
          nextInteractions[index] = typeof value === "string" ? value : "";
        }
      });
    }
    setInteractionResponses(nextInteractions);
  }, [active, saved]);

  async function hydrate() {
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
          .select("slug,title,description,duration_mins,lesson_count")
          .eq("slug", SLUG)
          .single(),
        supabase
          .from("course_modules")
          .select(
            "id,module_order,title,content,duration_mins,module_type,learning_objectives,activity,knowledge_checkpoint,interactions",
          )
          .eq("course_slug", SLUG)
          .order("module_order"),
      ]);

    if (courseError || moduleError || !courseRow || !moduleRows?.length) {
      setNotice("The civic course could not be loaded.");
      setReady(true);
      return;
    }

    const [{ data: progressRow }, { data: responseRows }] = await Promise.all([
      supabase
        .from("course_progress")
        .select("completed_modules")
        .eq("user_id", user.id)
        .eq("course_slug", SLUG)
        .maybeSingle(),
      supabase
        .from("course_module_responses")
        .select("module_order,activity_response,checkpoint_response,interaction_responses")
        .eq("user_id", user.id)
        .eq("course_slug", SLUG),
    ]);

    const completedModules =
      (progressRow?.completed_modules as number[] | null) ?? [];
    const responseMap: Record<number, SavedResponse> = {};
    for (const response of (responseRows ?? []) as SavedResponse[]) {
      responseMap[response.module_order] = response;
    }

    setCourse(courseRow as CivicCourse);
    setModules(moduleRows as CivicModule[]);
    setCompleted(completedModules);
    setSaved(responseMap);
    setActive(
      (moduleRows as CivicModule[]).find(
        (item) => !completedModules.includes(item.module_order),
      )?.module_order ?? 1,
    );
    setReady(true);
  }

  async function saveModule(markComplete: boolean) {
    if (!userId || !module) return;

    if (markComplete && !activityResponse.trim()) {
      setNotice("Add your activity reflection or evidence note before completing this module.");
      return;
    }

    if (markComplete && !checkpointCorrect) {
      setNotice("Pass the knowledge checkpoint before completing this module.");
      return;
    }

    setSaving(true);
    setNotice(null);

    const interactions = module.interactions.map((interaction, index) => ({
      type: interaction.type ?? "reflection",
      prompt: interaction.prompt ?? interaction.label ?? `Interaction ${index + 1}`,
      response: interactionResponses[index] ?? "",
    }));

    const responsePayload = {
      user_id: userId,
      course_slug: SLUG,
      module_order: module.module_order,
      activity_response: {
        reflection: activityResponse,
        deliverable: module.activity?.deliverable ?? null,
      },
      checkpoint_response: {
        selected_index: checkpointChoice,
        correct: checkpointCorrect,
      },
      interaction_responses: interactions,
      updated_at: new Date().toISOString(),
    };

    const { error: responseError } = await supabase
      .from("course_module_responses")
      .upsert(responsePayload, {
        onConflict: "user_id,course_slug,module_order",
      });

    if (responseError) {
      setNotice(responseError.message);
      setSaving(false);
      return;
    }

    setSaved((current) => ({
      ...current,
      [module.module_order]: responsePayload as unknown as SavedResponse,
    }));

    if (markComplete && !completed.includes(module.module_order)) {
      const nextCompleted = [...completed, module.module_order].sort((a, b) => a - b);
      const isCourseComplete = nextCompleted.length === modules.length;

      const { error: progressError } = await supabase
        .from("course_progress")
        .upsert(
          {
            user_id: userId,
            course_slug: SLUG,
            completed_modules: nextCompleted,
            completed: isCourseComplete,
            completed_at: isCourseComplete ? new Date().toISOString() : null,
          },
          { onConflict: "user_id,course_slug" },
        );

      if (progressError) {
        setNotice(progressError.message);
        setSaving(false);
        return;
      }

      setCompleted(nextCompleted);
      await addReward(userId, {
        xp: XP_PER_MODULE,
        coins: COINS_PER_MODULE,
      });

      setNotice(
        isCourseComplete
          ? "Civic flagship complete. Your 30-day Youth Education Justice Action Plan is ready to become a real-world play."
          : `Module ${module.module_order} complete · +${XP_PER_MODULE} XP · +${COINS_PER_MODULE} coins`,
      );

      const next = modules.find(
        (item) => !nextCompleted.includes(item.module_order),
      );
      if (next) setActive(next.module_order);
    } else {
      setNotice("Your civic work has been saved.");
    }

    setSaving(false);
  }

  if (!ready) {
    return (
      <main style={{ minHeight: "100vh", background: P.cream, padding: 40 }}>
        Loading civic flagship…
      </main>
    );
  }

  if (!course || !module) {
    return (
      <main style={{ minHeight: "100vh", background: P.cream, padding: 40 }}>
        {notice ?? "Course unavailable."}
      </main>
    );
  }

  return (
    <main style={{ minHeight: "100vh", background: P.cream, color: P.ink }}>
      <header style={hero}>
        <button onClick={() => router.push("/courses")} style={ghostButton}>
          ← Courses
        </button>
        <div style={{ maxWidth: 1120, margin: "38px auto 0" }}>
          <div style={heroKicker}>PLAYBOOK FLAGSHIP · CIVIC ENGAGEMENT</div>
          <h1 style={heroTitle}>{course.title}</h1>
          <p style={heroCopy}>{course.description}</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 30 }}>
            <Metric value={`${completed.length}/${modules.length}`} label="modules complete" />
            <Metric value={`${progress}%`} label="pathway progress" />
            <Metric value={`${course.duration_mins ?? 0}m`} label="guided learning" />
            <Metric value={`${XP_PER_MODULE * modules.length}`} label="total XP" />
          </div>
        </div>
      </header>

      <div style={missionStrip}>
        <strong>MISSION:</strong> Understand the public-school system you live in. Read the evidence. Follow the money. Find the decision-maker. Use your voice. Build the coalition. Make the ask.
      </div>

      <section style={layout}>
        <aside style={sidebar}>
          <div style={sidebarLabel}>Your civic power map</div>
          {modules.map((item) => {
            const done = completed.includes(item.module_order);
            const selected = item.module_order === active;
            return (
              <button
                key={item.id}
                onClick={() => setActive(item.module_order)}
                style={{
                  ...moduleButton,
                  borderColor: selected ? P.orange : "transparent",
                  background: selected ? "#fff1e9" : "transparent",
                }}
              >
                <span
                  style={{
                    ...moduleNumber,
                    background: done ? P.lime : P.navy,
                    color: done ? P.navy : P.white,
                  }}
                >
                  {done ? "✓" : item.module_order}
                </span>
                <span>
                  <strong style={{ display: "block", fontSize: 13, lineHeight: 1.25 }}>
                    {stripPrefix(item.title)}
                  </strong>
                  <span style={{ display: "block", marginTop: 4, fontSize: 10, color: P.muted, textTransform: "uppercase", letterSpacing: ".06em" }}>
                    {item.module_type} · {item.duration_mins}m
                  </span>
                </span>
              </button>
            );
          })}
        </aside>

        <article style={{ minWidth: 0 }}>
          {notice && <div style={noticeStyle}>{notice}</div>}

          <section style={card}>
            <div style={eyebrow}>Module {module.module_order} · Public-school civic power</div>
            <h2 style={{ fontSize: "clamp(30px,4vw,52px)", margin: "8px 0 14px", lineHeight: 1.02 }}>
              {stripPrefix(module.title)}
            </h2>
            <p style={{ fontSize: 17, lineHeight: 1.75, color: P.muted }}>{module.content}</p>
          </section>

          <section style={card}>
            <div style={eyebrow}>Your targets</div>
            <h3 style={sectionTitle}>What you should be able to do</h3>
            <div style={{ display: "grid", gap: 11 }}>
              {module.learning_objectives.map((objective, index) => (
                <div key={objective} style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 10, alignItems: "start" }}>
                  <span style={objectiveNumber}>{index + 1}</span>
                  <span style={{ lineHeight: 1.55 }}>{objective}</span>
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...card, borderTop: `4px solid ${P.orange}` }}>
            <div style={eyebrow}>Civic lab</div>
            <h3 style={sectionTitle}>{module.activity?.title ?? "Applied civic activity"}</h3>
            <ol style={{ paddingLeft: 22, lineHeight: 1.7 }}>
              {(module.activity?.instructions ?? []).map((instruction) => (
                <li key={instruction} style={{ marginBottom: 9 }}>{instruction}</li>
              ))}
            </ol>
            {module.activity?.deliverable && (
              <div style={deliverableBox}>
                <strong>Deliverable:</strong> {module.activity.deliverable}
              </div>
            )}
            <label style={label}>Reflection / evidence note</label>
            <textarea
              value={activityResponse}
              onChange={(event) => setActivityResponse(event.target.value)}
              placeholder="What did you learn, create, notice, question, or decide? Capture the evidence you want to keep in your Playbook."
              style={textarea}
            />
          </section>

          <section style={{ ...card, borderTop: `4px solid ${P.violet}` }}>
            <div style={eyebrow}>Use your voice</div>
            <h3 style={sectionTitle}>Interactive civic prompts</h3>
            <div style={{ display: "grid", gap: 18 }}>
              {module.interactions.map((interaction, index) => (
                <div key={`${interaction.type ?? "prompt"}-${index}`}>
                  <label style={label}>{interaction.prompt ?? interaction.label ?? `Prompt ${index + 1}`}</label>
                  <textarea
                    value={interactionResponses[index] ?? ""}
                    onChange={(event) =>
                      setInteractionResponses((current) => ({
                        ...current,
                        [index]: event.target.value,
                      }))
                    }
                    placeholder="Your response…"
                    style={{ ...textarea, minHeight: 92 }}
                  />
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...card, borderTop: `4px solid ${P.cyan}` }}>
            <div style={eyebrow}>Knowledge checkpoint</div>
            <h3 style={sectionTitle}>{module.knowledge_checkpoint?.prompt}</h3>
            <div style={{ display: "grid", gap: 10 }}>
              {(module.knowledge_checkpoint?.options ?? []).map((option, index) => {
                const selected = checkpointChoice === index;
                return (
                  <button
                    key={option}
                    onClick={() => setCheckpointChoice(index)}
                    style={{
                      ...answerButton,
                      borderColor: selected ? P.cyan : P.line,
                      background: selected ? "#eafcff" : P.white,
                    }}
                  >
                    <strong style={{ marginRight: 9 }}>{String.fromCharCode(65 + index)}.</strong>
                    {option}
                  </button>
                );
              })}
            </div>
            {checkpointChoice !== null && (
              <div style={{ ...feedback, background: checkpointCorrect ? "#efffee" : "#fff0ed", color: checkpointCorrect ? "#236329" : "#963426" }}>
                <strong>{checkpointCorrect ? "Correct." : "Try again."}</strong>{" "}
                {checkpointCorrect
                  ? module.knowledge_checkpoint?.explanation
                  : "Go back to the module idea, identify the decision or evidence problem, and choose again."}
              </div>
            )}
          </section>

          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <button disabled={saving} onClick={() => void saveModule(false)} style={secondaryButton}>
              {saving ? "Saving…" : "Save civic work"}
            </button>
            <button
              disabled={saving || completed.includes(active)}
              onClick={() => void saveModule(true)}
              style={primaryButton}
            >
              {completed.includes(active) ? "Module complete ✓" : `Complete Module ${active}`}
            </button>
          </div>
        </article>
      </section>
    </main>
  );
}

function stripPrefix(title: string) {
  return title.replace(/^Module \d+:\s*/, "");
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div style={metric}>
      <strong style={{ display: "block", fontSize: 21 }}>{value}</strong>
      <span style={{ display: "block", marginTop: 2, fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", color: "#aebfd1" }}>
        {label}
      </span>
    </div>
  );
}

const hero: CSSProperties = {
  color: P.white,
  padding: "52px clamp(20px,5vw,76px) 48px",
  background: `radial-gradient(circle at 14% 8%, rgba(255,107,44,.28), transparent 25%), radial-gradient(circle at 86% 20%, rgba(66,201,216,.24), transparent 28%), linear-gradient(135deg, ${P.navy}, ${P.navy2})`,
};
const heroKicker: CSSProperties = { fontSize: 11, fontWeight: 900, letterSpacing: ".18em", color: P.orange };
const heroTitle: CSSProperties = { maxWidth: 920, margin: "13px 0 20px", fontSize: "clamp(42px,7vw,88px)", lineHeight: .93, letterSpacing: "-.035em" };
const heroCopy: CSSProperties = { maxWidth: 800, fontSize: 18, lineHeight: 1.65, color: "#c9d6e5" };
const ghostButton: CSSProperties = { border: "1px solid rgba(255,255,255,.22)", borderRadius: 12, padding: "9px 13px", color: P.white, background: "rgba(255,255,255,.07)", cursor: "pointer" };
const metric: CSSProperties = { minWidth: 138, padding: "12px 15px", borderRadius: 14, background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.12)" };
const missionStrip: CSSProperties = { padding: "15px 20px", textAlign: "center", background: P.orange, color: P.white, fontSize: 12, letterSpacing: ".025em", lineHeight: 1.6 };
const layout: CSSProperties = { maxWidth: 1190, margin: "0 auto", padding: "34px 20px 82px", display: "grid", gridTemplateColumns: "minmax(230px,305px) minmax(0,1fr)", gap: 28 };
const sidebar: CSSProperties = { alignSelf: "start", position: "sticky", top: 20, maxHeight: "calc(100vh - 40px)", overflowY: "auto", borderRadius: 22, padding: 14, background: P.white, border: `1px solid ${P.line}` };
const sidebarLabel: CSSProperties = { padding: "10px 9px 15px", color: P.muted, fontSize: 10, fontWeight: 900, letterSpacing: ".13em", textTransform: "uppercase" };
const moduleButton: CSSProperties = { width: "100%", display: "grid", gridTemplateColumns: "34px 1fr", gap: 9, padding: "12px 9px", marginBottom: 5, textAlign: "left", color: P.ink, border: "1px solid transparent", borderRadius: 14, cursor: "pointer" };
const moduleNumber: CSSProperties = { width: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 9, fontSize: 12, fontWeight: 900 };
const noticeStyle: CSSProperties = { marginBottom: 18, padding: "14px 17px", borderRadius: 14, color: P.white, background: P.navy };
const card: CSSProperties = { marginBottom: 20, padding: "clamp(21px,4vw,35px)", borderRadius: 22, background: P.white, border: `1px solid ${P.line}`, boxShadow: "0 12px 32px rgba(8,16,31,.05)" };
const eyebrow: CSSProperties = { color: P.orange, fontSize: 10, fontWeight: 900, letterSpacing: ".15em", textTransform: "uppercase" };
const sectionTitle: CSSProperties = { margin: "8px 0 18px", fontSize: 24 };
const objectiveNumber: CSSProperties = { width: 29, height: 29, display: "grid", placeItems: "center", borderRadius: 9, color: P.white, background: P.navy, fontSize: 12, fontWeight: 900 };
const deliverableBox: CSSProperties = { marginTop: 16, padding: 14, borderRadius: 12, background: "#fff3eb", lineHeight: 1.55 };
const label: CSSProperties = { display: "block", margin: "18px 0 8px", fontSize: 13, fontWeight: 850 };
const textarea: CSSProperties = { width: "100%", minHeight: 132, padding: 14, border: `1px solid ${P.line}`, borderRadius: 14, resize: "vertical", background: "#fbfcfd", color: P.ink, font: "inherit", lineHeight: 1.55 };
const answerButton: CSSProperties = { padding: "14px 16px", textAlign: "left", border: "1px solid", borderRadius: 14, color: P.ink, cursor: "pointer", fontSize: 15 };
const feedback: CSSProperties = { marginTop: 14, padding: 14, borderRadius: 12, lineHeight: 1.55 };
const primaryButton: CSSProperties = { padding: "14px 20px", border: 0, borderRadius: 14, background: P.orange, color: P.white, fontWeight: 900, cursor: "pointer" };
const secondaryButton: CSSProperties = { padding: "14px 20px", border: `1px solid ${P.line}`, borderRadius: 14, background: P.white, color: P.ink, fontWeight: 850, cursor: "pointer" };
