"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

type Module = {
  module_key: string;
  position: number;
  title: string;
  duration_minutes: number;
  module_type: string;
  summary: string;
  content: string;
  completion_mode: "acknowledge" | "reflection";
  required: boolean;
  progress: { module_key: string; reflection: string | null; completed_at: string } | null;
};

type Course = {
  slug: string;
  title: string;
  description: string;
  pillar: string;
  image_url: string | null;
  status: string;
  xp_per_module: number;
  coins_per_module: number;
  course_xp_bonus: number;
  course_coin_bonus: number;
  certificate_name: string;
};

type CourseResponse = { course?: Course; modules?: Module[]; credential?: { id: string; credential_name: string; issued_at: string } | null; error?: string };

async function getCourse(slug: string): Promise<CourseResponse> {
  const response = await fetch(`/api/learning/courses/${encodeURIComponent(slug)}`, { cache: "no-store" });
  const result = await response.json() as CourseResponse;
  if (!response.ok) throw new Error(result.error || "Course could not be loaded.");
  return result;
}

export default function CoursePage() {
  const params = useParams<{ slug: string }>();
  const slug = String(params?.slug || "");
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [credential, setCredential] = useState<CourseResponse["credential"]>(null);
  const [openModule, setOpenModule] = useState<string | null>(null);
  const [reflections, setReflections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("Loading course…");
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const result = await getCourse(slug);
    setCourse(result.course || null);
    setModules(result.modules || []);
    setCredential(result.credential || null);
    const firstOpen = (result.modules || []).find((module) => !module.progress)?.module_key || result.modules?.[0]?.module_key || null;
    setOpenModule((current) => current || firstOpen);
    setMessage(result.credential ? "Course complete. Credential issued." : "Course progress is current.");
    setLoading(false);
  }

  useEffect(() => {
    if (!slug) return;
    let active = true;
    void getCourse(slug).then((result) => {
      if (!active) return;
      setCourse(result.course || null); setModules(result.modules || []); setCredential(result.credential || null);
      setOpenModule((result.modules || []).find((module) => !module.progress)?.module_key || result.modules?.[0]?.module_key || null);
      setMessage(result.credential ? "Course complete. Credential issued." : "Course progress is current.");
    }).catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Course could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [slug]);

  async function complete(module: Module) {
    if (module.progress) return;
    const reflection = (reflections[module.module_key] || "").trim();
    if (module.completion_mode === "reflection" && reflection.length < 20) {
      setError("Write a meaningful reflection of at least 20 characters before completing this module.");
      return;
    }
    setBusy(module.module_key); setError("");
    try {
      const response = await fetch(`/api/learning/courses/${encodeURIComponent(slug)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ moduleKey: module.module_key, reflection: reflection || null }),
      });
      const result = await response.json() as { outcome?: { course_completed?: boolean; coins_awarded?: number; xp_awarded?: number }; error?: string };
      if (!response.ok) throw new Error(result.error || "Module could not be completed.");
      const outcome = result.outcome;
      setMessage(outcome?.course_completed
        ? `Course complete. +${outcome.xp_awarded || 0} XP and +${outcome.coins_awarded || 0} coins were issued idempotently.`
        : `Module complete. +${outcome?.xp_awarded || 0} XP and +${outcome?.coins_awarded || 0} coins were issued.`);
      await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Module could not be completed."); }
    finally { setBusy(null); }
  }

  const completedCount = modules.filter((module) => module.progress).length;
  const requiredCount = modules.filter((module) => module.required).length;
  const percent = requiredCount ? Math.round(completedCount / requiredCount * 100) : 0;
  const totalMinutes = useMemo(() => modules.reduce((total, module) => total + module.duration_minutes, 0), [modules]);

  if (loading) return <PlaybookPage><div style={state}>Loading canonical course…</div></PlaybookPage>;
  if (!course) return <PlaybookPage><PlaybookCard eyebrow="Learning" title="Course not found"><Link href="/courses">Return to Courses</Link></PlaybookCard></PlaybookPage>;

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow={`${course.pillar} · Canonical Learning`} title={course.title} subtitle={course.description} />
      <PlaybookMetrics>
        <PlaybookMetric label="Progress" value={`${percent}%`} />
        <PlaybookMetric label="Modules" value={`${completedCount}/${requiredCount}`} />
        <PlaybookMetric label="Learning time" value={`${totalMinutes} min`} />
        <PlaybookMetric label="Credential" value={credential ? "Earned" : "Locked"} />
      </PlaybookMetrics>
      <div role="status" aria-live="polite" style={status}>{message}</div>
      {error && <div role="alert" style={alert}>{error}</div>}

      {course.image_url && <div style={heroMedia}><Image unoptimized fill src={course.image_url} alt="" style={{ objectFit: "cover" }} /></div>}

      {credential && <PlaybookCard eyebrow="Credential issued" title={credential.credential_name}>
        <p style={copy}>Issued {new Date(credential.issued_at).toLocaleDateString()}. This credential is backed by durable completion evidence.</p>
        <div style={buttonRow}><Link href="/certificates" style={primaryLink}>Open credential vault</Link><Link href="/badges" style={secondaryLink}>View badges</Link></div>
      </PlaybookCard>}

      <section style={sectionHeader}><p style={eyebrow}>Course modules</p><h2 style={heading}>Learn → reflect → prove completion</h2></section>
      <PlaybookGrid min={340}>
        {modules.map((module) => {
          const open = openModule === module.module_key;
          return <PlaybookCard key={module.module_key} eyebrow={`Module ${module.position} · ${module.module_type}`} title={module.title}>
            <div style={moduleMeta}><PlaybookPill>{module.duration_minutes} min</PlaybookPill><PlaybookPill>{module.completion_mode === "reflection" ? "Reflection required" : "Acknowledge"}</PlaybookPill>{module.progress && <PlaybookPill>Completed</PlaybookPill>}</div>
            <p style={copy}>{module.summary}</p>
            <button onClick={() => setOpenModule(open ? null : module.module_key)} style={secondaryButton}>{open ? "Hide lesson" : "Open lesson"}</button>
            {open && <div style={lesson}>
              <p style={lessonCopy}>{module.content}</p>
              {module.progress ? <div style={completedBox}>
                <strong>Completed {new Date(module.progress.completed_at).toLocaleString()}</strong>
                {module.progress.reflection && <p style={copy}>Your reflection: {module.progress.reflection}</p>}
              </div> : <>
                {module.completion_mode === "reflection" && <label style={reflectionLabel}>Your reflection
                  <textarea value={reflections[module.module_key] || ""} onChange={(event) => setReflections((current) => ({ ...current, [module.module_key]: event.target.value }))} minLength={20} maxLength={4000} rows={5} style={textarea} placeholder="What did you learn, decide, or plan to do next?" />
                </label>}
                <button onClick={() => void complete(module)} disabled={busy === module.module_key} style={primaryButton}>{busy === module.module_key ? "Recording…" : "Complete module"}</button>
              </>}
            </div>}
          </PlaybookCard>;
        })}
      </PlaybookGrid>
      <div style={buttonRow}><Link href="/courses" style={secondaryLink}>← All courses</Link><Link href="/store" style={secondaryLink}>Reward Store</Link></div>
    </PlaybookPage>
  );
}

const state: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: 30, borderRadius: 20, background: "#FFFFFF", color: "#64748B" };
const status: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", color: "#334155" };
const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 14px", padding: 13, borderRadius: 12, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" };
const heroMedia: React.CSSProperties = { position: "relative", maxWidth: 1180, minHeight: 280, margin: "0 auto 22px", borderRadius: "28px 8px 28px 8px", overflow: "hidden", background: "#E2E8F0" };
const sectionHeader: React.CSSProperties = { maxWidth: 1180, margin: "30px auto 16px" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#EA580C", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const heading: React.CSSProperties = { margin: "7px 0", color: "#0F172A", fontSize: "clamp(28px,4vw,42px)" };
const moduleMeta: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const lesson: React.CSSProperties = { marginTop: 15, padding: 16, borderRadius: 16, background: "#F8FAFC", border: "1px solid #E2E8F0" };
const lessonCopy: React.CSSProperties = { color: "#334155", lineHeight: 1.75, fontSize: 16 };
const completedBox: React.CSSProperties = { marginTop: 14, padding: 13, borderRadius: 12, background: "#ECFDF5", border: "1px solid #A7F3D0", color: "#065F46" };
const reflectionLabel: React.CSSProperties = { display: "grid", gap: 7, marginTop: 14, color: "#0F172A", fontWeight: 850 };
const textarea: React.CSSProperties = { width: "100%", resize: "vertical", border: "1px solid #CBD5E1", borderRadius: 12, padding: 12, background: "#FFFFFF", color: "#0F172A" };
const buttonRow: React.CSSProperties = { maxWidth: 1180, margin: "18px auto", display: "flex", gap: 9, flexWrap: "wrap" };
const baseButton: React.CSSProperties = { borderRadius: 999, padding: "10px 14px", fontWeight: 900, cursor: "pointer" };
const primaryButton: React.CSSProperties = { ...baseButton, marginTop: 13, border: 0, background: "#F97316", color: "#FFFFFF" };
const secondaryButton: React.CSSProperties = { ...baseButton, border: "1px solid #CBD5E1", background: "#FFFFFF", color: "#0F172A" };
const primaryLink: React.CSSProperties = { display: "inline-block", padding: "10px 14px", borderRadius: 999, background: "#F97316", color: "#FFFFFF", textDecoration: "none", fontWeight: 900 };
const secondaryLink: React.CSSProperties = { ...primaryLink, background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" };
