"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlaybookCard, PlaybookGrid, PlaybookHero, PlaybookMetric, PlaybookMetrics, PlaybookPage, PlaybookPill } from "@/components/ui";
import { supabase } from "@/lib/supabaseClient";

type Credential = { id: string; course_slug: string; credential_name: string; issued_at: string; evidence: Record<string, unknown> };
type Course = { slug: string; title: string; pillar: string; status: string; certificate_name: string };

export default function CertificatesPage() {
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) { location.href = "/login?next=/certificates"; return; }
      const [credentialResult, courseResult] = await Promise.all([
        supabase.from("learning_credentials").select("id,course_slug,credential_name,issued_at,evidence").eq("user_id", auth.user.id).order("issued_at", { ascending: false }),
        supabase.from("learning_courses").select("slug,title,pillar,status,certificate_name").in("status", ["published", "coming_soon"]).order("sort_order"),
      ]);
      const failure = credentialResult.error || courseResult.error;
      if (failure) throw failure;
      if (!active) return;
      setCredentials((credentialResult.data || []) as Credential[]);
      setCourses((courseResult.data || []) as Course[]);
    })().catch((cause) => { if (active) setError(cause instanceof Error ? cause.message : "Credentials could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const earned = new Set(credentials.map((credential) => credential.course_slug));
  const locked = courses.filter((course) => !earned.has(course.slug));

  return (
    <PlaybookPage>
      <PlaybookHero eyebrow="Credential Vault" title="Evidence you earned, not decorations you clicked" subtitle="Canonical credentials are issued only after all required course modules are durably complete. Each card points back to stored completion evidence." />
      <PlaybookMetrics>
        <PlaybookMetric label="Earned" value={loading ? "…" : String(credentials.length)} />
        <PlaybookMetric label="Remaining" value={loading ? "…" : String(locked.length)} />
        <PlaybookMetric label="Credential source" value="Learning" />
      </PlaybookMetrics>
      {error && <div role="alert" style={alert}>{error}</div>}
      {loading ? <div style={state}>Loading credential evidence…</div> : credentials.length === 0 ? (
        <PlaybookCard eyebrow="Credential Vault" title="Your first credential is still ahead">
          <p style={copy}>Complete every required module in a published Playbook course. The credential is issued automatically by the governed learning transaction.</p>
          <Link href="/courses" style={primaryLink}>Go to Courses →</Link>
        </PlaybookCard>
      ) : (
        <PlaybookGrid min={300}>
          {credentials.map((credential) => {
            const course = courses.find((item) => item.slug === credential.course_slug);
            return <PlaybookCard key={credential.id} eyebrow={course?.pillar || "Playbook Credential"} title={credential.credential_name}>
              <div style={seal}>🎓</div>
              <PlaybookPill>Verified completion</PlaybookPill>
              <p style={copy}>Issued {new Date(credential.issued_at).toLocaleDateString()} · {Number(credential.evidence?.completed_modules || 0)} required modules recorded.</p>
              <Link href={`/courses/${credential.course_slug}`} style={secondaryLink}>Review evidence</Link>
            </PlaybookCard>;
          })}
        </PlaybookGrid>
      )}
      {locked.length > 0 && <>
        <section style={sectionHeader}><p style={eyebrow}>Still to earn</p><h2 style={heading}>Locked credentials</h2></section>
        <PlaybookGrid min={280}>{locked.map((course) => <PlaybookCard key={course.slug} eyebrow={course.pillar} title={course.certificate_name}><PlaybookPill>{course.status === "coming_soon" ? "Coming soon" : "Locked"}</PlaybookPill><p style={copy}>{course.status === "coming_soon" ? "Curriculum is not published yet." : "Complete the required course modules to issue this credential."}</p>{course.status === "published" && <Link href={`/courses/${course.slug}`} style={secondaryLink}>Open course</Link>}</PlaybookCard>)}</PlaybookGrid>
      </>}
    </PlaybookPage>
  );
}

const alert: React.CSSProperties = { maxWidth: 1180, margin: "0 auto 15px", padding: 13, borderRadius: 12, background: "#FEF2F2", border: "1px solid #FCA5A5", color: "#991B1B" };
const state: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: 28, background: "#FFFFFF", borderRadius: 18, color: "#64748B" };
const copy: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const seal: React.CSSProperties = { width: 76, height: 76, margin: "8px 0 14px", borderRadius: 24, display: "grid", placeItems: "center", fontSize: 38, color: "#FFFFFF", background: "linear-gradient(135deg,#0F172A,#1E3A5F 55%,#F97316)" };
const primaryLink: React.CSSProperties = { display: "inline-block", width: "fit-content", padding: "10px 14px", borderRadius: 999, background: "#F97316", color: "#FFFFFF", fontWeight: 900, textDecoration: "none" };
const secondaryLink: React.CSSProperties = { ...primaryLink, background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" };
const sectionHeader: React.CSSProperties = { maxWidth: 1180, margin: "30px auto 16px" };
const eyebrow: React.CSSProperties = { margin: 0, color: "#EA580C", fontSize: 11, fontWeight: 950, letterSpacing: ".14em", textTransform: "uppercase" };
const heading: React.CSSProperties = { margin: "7px 0", color: "#0F172A", fontSize: "clamp(28px,4vw,42px)" };
