"use client";

import { useEffect, useMemo, useState } from "react";
import AGTracker from "@/components/ag/AGTracker";
import {
  PlaybookButton,
  PlaybookCard,
  PlaybookHero,
  PlaybookMetric,
  PlaybookMetrics,
  PlaybookPage,
} from "@/components/ui";
import { buildScholarRecord, type ScholarRecord } from "@/lib/scholar";
import { supabase } from "@/lib/supabaseClient";

type DashboardState = {
  record: ScholarRecord;
  loading: boolean;
};

const emptyRecord = buildScholarRecord({});

export default function DashboardPage() {
  const [{ record, loading }, setState] = useState<DashboardState>({ record: emptyRecord, loading: true });

  useEffect(() => {
    let active = true;

    async function loadScholarRecord() {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        if (active) setState({ record: emptyRecord, loading: false });
        return;
      }

      const [profileResult, certificateResult, badgeResult, activityResult, postResult, agResult] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("certificates").select("*").eq("user_id", userId).order("issued_at", { ascending: false }),
        supabase.from("user_badges").select("id,awarded_at,badges(id,name,description,image_url)").eq("user_id", userId).order("awarded_at", { ascending: false }),
        supabase.from("student_activities").select("*").eq("student_id", userId).order("created_at", { ascending: false }),
        supabase.from("feed_posts").select("id,content,created_at,visibility").eq("user_id", userId).order("created_at", { ascending: false }).limit(5),
        supabase.from("ag_progress").select("subject, years_completed, years_required, in_progress, courses_taken, current_course").eq("user_id", userId).order("updated_at", { ascending: false }),
      ]);

      if (!active) return;

      const agBySubject = new Map<string, ScholarRecord["progress"]["ag"][number]>();
      for (const row of agResult.data || []) {
        if (!agBySubject.has(row.subject)) agBySubject.set(row.subject, row);
      }

      setState({
        loading: false,
        record: buildScholarRecord({
          profile: profileResult.data || { id: userId },
          certificates: certificateResult.data || [],
          badges: badgeResult.data || [],
          activities: activityResult.data || [],
          posts: postResult.data || [],
          agProgress: Array.from(agBySubject.values()),
          notifications: [
            { id: "transcript", label: "Transcript powers dashboard readiness", detail: "Keep A-G progress current.", href: "/transcript" },
            { id: "support", label: "Support network can help close gaps", detail: "Invite helpers when a blocker appears.", href: "/support-network" },
          ],
          upcomingDeadlines: [
            { id: "fafsa", label: "Review FAFSA and scholarship milestones", href: "/academic-readiness" },
            { id: "transcript-request", label: "Request official transcript early", href: "/transcript" },
          ],
        }),
      });
    }

    loadScholarRecord();

    return () => {
      active = false;
    };
  }, []);

  const dashboard = useMemo(() => buildDashboardView(record), [record]);

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
        {dashboard.metrics.map((metric) => <PlaybookMetric key={metric.label} label={metric.label} value={loading ? "Loading" : metric.value} />)}
      </PlaybookMetrics>

      <div style={mainGrid}>
        <section style={stack}>
          <AGTracker rows={record.progress.ag} />
          <DashboardCard title="Transcript Progress" value={`${record.readiness.transcriptCompletion}%`} detail="Transcript readiness is calculated from ScholarRecord A-G progress." />
          <DashboardList title="Activities" items={dashboard.activities} empty="No activities recorded yet." />
          <DashboardList title="Recent Activity" items={record.activity.recent.map((item) => item.label)} empty="No recent activity yet." />
        </section>

        <section style={sideStack}>
          <DashboardCard title="College Readiness" value={`${record.readiness.collegeReadiness}%`} detail="Combines transcript progress, portfolio completion, verified signals, and service." />
          <DashboardCard title="Leadership" value={`${record.leadership.leadershipScore}`} detail={`${record.leadership.leadershipPositions.length} leadership positions in ScholarRecord.`} />
          <DashboardCard title="Athletics" value={dashboard.athletics} detail="Scholar-athlete fields are read from ScholarRecord only." />
          <DashboardCard title="Certificates" value={`${record.achievements.certificates.length}`} detail="Verified learning artifacts." />
          <DashboardCard title="Badges" value={`${record.achievements.badges.length}`} detail="Earned Playbook achievements." />
          <DashboardCard title="Coins" value={`${record.economy.coins}`} detail="Reward balance from ScholarRecord." />
          <DashboardCard title="XP" value={`${record.economy.xp}`} detail="Experience balance from ScholarRecord." />
          <DashboardList title="Notifications" items={record.activity.notifications.map((item) => item.label)} empty="No notifications." />
          <DashboardList title="Upcoming Deadlines" items={record.activity.upcomingDeadlines.map((item) => item.label)} empty="No upcoming deadlines." />
        </section>
      </div>
    </PlaybookPage>
  );
}

function buildDashboardView(record: ScholarRecord) {
  return {
    metrics: [
      { label: "Academic Progress", value: `${record.readiness.transcriptCompletion}%` },
      { label: "College Readiness", value: `${record.readiness.collegeReadiness}%` },
      { label: "Transcript Upload", value: record.progress.ag.length ? "Live" : "Ready" },
      { label: "Next Step", value: "Compass" },
    ],
    activities: record.community.activities.slice(0, 4).map((activity) => activity.name),
    athletics: record.athletics.sport || record.athletics.position || "Not added",
  };
}

function DashboardCard({ title, value, detail }: { title: string; value: string; detail: string }) {
  return <PlaybookCard eyebrow={title} title={value}><p style={body}>{detail}</p></PlaybookCard>;
}

function DashboardList({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <PlaybookCard eyebrow={title} title={items.length ? `${items.length} items` : "None yet"}>{items.length ? <ul style={list}>{items.map((item) => <li key={item}>{item}</li>)}</ul> : <p style={body}>{empty}</p>}</PlaybookCard>;
}

const mainGrid: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, .6fr)",
  gap: 18,
  alignItems: "start",
};

const stack: React.CSSProperties = { display: "grid", gap: 14 };
const sideStack: React.CSSProperties = { display: "grid", gap: 14 };
const body: React.CSSProperties = { color: "#64748B", lineHeight: 1.6 };
const list: React.CSSProperties = { ...body, margin: 0, paddingLeft: 18 };
