"use client";

import { useEffect, useState } from "react";
import AGTracker from "@/components/ag/AGTracker";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookGrid,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";
import { buildScholarRecord } from "@/lib/scholar";
import type { ScholarRecord } from "@/lib/scholar";
import { supabase } from "@/lib/supabaseClient";

export default function DashboardPage() {
  const [record, setRecord] = useState<ScholarRecord | null>(null);

  useEffect(() => {
    let active = true;
    async function loadScholarRecord() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const [{ data: profile }, { data: agProgress }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).single(),
        supabase.from("ag_progress").select("*").eq("user_id", u.user.id).order("updated_at", { ascending: false }),
      ]);
      if (active) setRecord(buildScholarRecord({ profile, agProgress: agProgress || [] }));
    }
    loadScholarRecord();
    return () => { active = false; };
  }, []);

  const academics = record?.academics;

  return (
    <PlaybookPage>
      <PlaybookHero
        eyebrow="Scholar Dashboard"
        title="Your transcript is the starting point."
        subtitle="Upload your transcript, see A–G readiness, close gaps with Compass, and activate your support network."
      >
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <PlaybookButton href="/transcript">Upload Transcript</PlaybookButton>
          <PlaybookButton href="/compass" variant="secondary">Open Compass Plan</PlaybookButton>
        </div>
      </PlaybookHero>

      <PlaybookMetrics>
        <PlaybookMetric label="Academic Core" value={academics?.weightedGpa || academics?.gpa || "Active"} />
        <PlaybookMetric label="A-G Tracker" value={academics ? `${academics.agSummary.percent}%` : "Live"} />
        <PlaybookMetric label="Credits Earned" value={academics ? String(academics.creditsEarned) : "—"} />
        <PlaybookMetric label="Grad Year" value={academics?.graduationYear || "—"} />
      </PlaybookMetrics>

      <div style={mainGrid}>
        <section>
          <AGTracker />
        </section>

        <section style={sideStack}>
          <PlaybookCard eyebrow="Start Here" title="Upload your transcript">
            <p style={body}>
              This powers A–G readiness, graduation planning, scholar-athlete
              eligibility, opportunity matching, applications, and support actions.
            </p>
            <PlaybookButton href="/transcript">Go to Transcript</PlaybookButton>
          </PlaybookCard>

          <PlaybookCard eyebrow="Academic Summary" title="Canonical Scholar Record">
            <p style={body}>
              {academics
                ? `Class of ${academics.graduationYear || "—"} · ${academics.agSummary.subjectsMet}/7 A–G areas met · ${academics.currentCourses.length} current courses.`
                : "Loading ScholarRecord academic summary..."}
            </p>
            <PlaybookButton href="/profile">Update Academics</PlaybookButton>
          </PlaybookCard>

          <PlaybookCard eyebrow="Compass" title="Turn gaps into action">
            <p style={body}>
              After A–G results are visible, Compass will prioritize what needs
              to happen next and who can help.
            </p>
            <PlaybookButton href="/compass">Open Compass</PlaybookButton>
          </PlaybookCard>

          <PlaybookCard eyebrow="Support Network" title="Do not do this alone">
            <p style={body}>
              Invite family, educators, mentors, coaches, and advocates to help
              close academic and opportunity gaps.
            </p>
            <PlaybookButton href="/support-network">Activate Support</PlaybookButton>
          </PlaybookCard>

          <PlaybookCard eyebrow="Community" title="Share your journey">
            <p style={body}>
              Post updates, photos, accomplishments, questions, club moments,
              sports highlights, and milestones with the Playbook community.
            </p>
            <PlaybookButton href="/feed">Open Community Feed</PlaybookButton>
          </PlaybookCard>
        </section>
      </div>
    </PlaybookPage>
  );
}

const mainGrid: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, .6fr)",
  gap: 18,
  alignItems: "start",
};

const sideStack: React.CSSProperties = { display: "grid", gap: 14 };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
