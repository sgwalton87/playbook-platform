"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";

type Course = {
  slug: string;
  title: string;
  description: string;
  pillar: string;
  image_url: string | null;
  status: "published" | "coming_soon";
  xp_per_module: number;
  coins_per_module: number;
  course_xp_bonus: number;
  course_coin_bonus: number;
  certificate_name: string;
  moduleCount: number;
  completedModules: number;
  completed: boolean;
  credential: { id: string; credential_name: string; issued_at: string } | null;
};

type CatalogResponse = { courses?: Course[]; error?: string };

async function loadCatalog(): Promise<Course[]> {
  const response = await fetch("/api/learning/courses", { cache: "no-store" });
  const result = await response.json() as CatalogResponse;
  if (!response.ok) throw new Error(result.error || "Learning catalog could not be loaded.");
  return result.courses || [];
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshCatalog() {
    setLoading(true);
    setError("");
    try {
      setCourses(await loadCatalog());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Learning catalog could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    void loadCatalog().then((items) => { if (active) setCourses(items); })
      .catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Learning catalog could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const published = courses.filter((course) => course.status === "published");
  const comingSoon = courses.filter((course) => course.status === "coming_soon");
  const inProgress = published.filter((course) => course.completedModules > 0 && !course.completed);
  const completed = published.filter((course) => course.completed);
  const nextCourse = inProgress[0] || published.find((course) => !course.completed) || null;
  const totalModules = published.reduce((total, course) => total + course.moduleCount, 0);

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Playbook Learning" title="Build skills that become durable evidence" subtitle="Courses are loaded from the canonical learning catalog. Module progress, reflections, rewards, badges, and credentials persist to your Playbook record instead of living in page constants." />
      <PlaybookMetrics>
        <PlaybookMetric label="Available courses" value={loading ? "…" : String(published.length)} />
        <PlaybookMetric label="In progress" value={loading ? "…" : String(inProgress.length)} />
        <PlaybookMetric label="Completed" value={loading ? "…" : String(completed.length)} />
        <PlaybookMetric label="Modules" value={loading ? "…" : String(totalModules)} />
      </PlaybookMetrics>

      {error && <div role="alert" style={alert}>{error} <button type="button" onClick={() => void refreshCatalog()}>Retry</button></div>}
      {loading ? <div style={state}>Loading canonical learning catalog…</div> : (
        <>
          <section style={actions} aria-label="Learning actions">
            {nextCourse ? <Link href={`/courses/${nextCourse.slug}`} style={primaryLink}>{inProgress.length ? "Continue learning" : "Start learning"} →</Link> : <span style={muted}>All published courses completed.</span>}
            <Link href="/certificates" style={secondaryLink}>Credentials</Link>
            <Link href="/badges" style={secondaryLink}>Badges</Link>
            <Link href="/store" style={secondaryLink}>Reward Store</Link>
          </section>

          <section style={sectionHeader}>
            <p style={eyebrow}>Published curriculum</p>
            <h2 style={heading}>Your learning library</h2>
            <p style={muted}>Every completion below is tied to durable module evidence and idempotent reward issuance.</p>
          </section>

          <PlaybookGrid min={310}>
            {published.map((course) => {
              const percent = course.moduleCount ? Math.round(course.completedModules / course.moduleCount * 100) : 0;
              return (
                <PlaybookCard key={course.slug} eyebrow={course.pillar} title={course.title}>
                  {course.image_url && <div style={media}><Image unoptimized fill src={course.image_url} alt="" style={{ objectFit: "cover" }} /></div>}
                  <p style={copy}>{course.description}</p>
                  <div style={progressTrack}><div style={{ ...progressFill, width: `${percent}%` }} /></div>
                  <div style={progressMeta}><span>{course.completedModules}/{course.moduleCount} modules</span><strong>{percent}%</strong></div>
                  <div style={rewardRow}>
                    <PlaybookPill>+{course.xp_per_module} XP/module</PlaybookPill>
                    <PlaybookPill>+{course.coins_per_module} coins/module</PlaybookPill>
                    {course.credential && <PlaybookPill>Credential earned</PlaybookPill>}
                  </div>
                  <Link href={`/courses/${course.slug}`} style={primaryLink}>{course.completed ? "Review course" : course.completedModules ? "Continue" : "Start course"} →</Link>
                </PlaybookCard>
              );
            })}
          </PlaybookGrid>

          {comingSoon.length > 0 && <>
            <section style={sectionHeader}><p style={eyebrow}>Curriculum pipeline</p><h2 style={heading}>Coming next</h2></section>
            <PlaybookGrid min={300}>{comingSoon.map((course) => <PlaybookCard key={course.slug} eyebrow={course.pillar} title={course.title}><p style={copy}>{course.description}</p><PlaybookPill>Coming soon</PlaybookPill></PlaybookCard>)}</PlaybookGrid>
          </>}
        </>
      )}
    </PlaybookPage>
  );
}

const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 16px", padding: 14, borderRadius: 12, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" };
const state: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: 28, borderRadius: 18, background: "#FFFFFF", color: "#64748B" };
const actions: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 24px", display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" };
const primaryLink: React.CSSProperties = { display: "inline-block", width: "fit-content", padding: "11px 16px", borderRadius: 999, background: "#F97316", color: "#FFFFFF", fontWeight: 900, textDecoration: "none" };
const secondaryLink: React.CSSProperties = { ...primaryLink, background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" };
const sectionHeader: React.CSSProperties = { maxWidth: 1180, margin: "28px auto 16px" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#EA580C", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const heading: React.CSSProperties = { margin: "7px 0", color: "#0F172A", fontSize: "clamp(28px,4vw,42px)" };
const muted: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const copy: React.CSSProperties = { color: "#475569", lineHeight: 1.6 };
const media: React.CSSProperties = { position: "relative", minHeight: 190, marginBottom: 16, borderRadius: 18, overflow: "hidden", background: "#E2E8F0" };
const progressTrack: React.CSSProperties = { height: 7, borderRadius: 999, background: "#E2E8F0", overflow: "hidden" };
const progressFill: React.CSSProperties = { height: "100%", borderRadius: 999, background: "#F97316" };
const progressMeta: React.CSSProperties = { display: "flex", justifyContent: "space-between", gap: 10, marginTop: 7, color: "#64748B", fontSize: 12 };
const rewardRow: React.CSSProperties = { display: "flex", gap: 7, flexWrap: "wrap", margin: "14px 0" };
