"use client";

import Image from "next/image";
import Link from "next/link";
import AGTracker from "@/components/ag/AGTracker";
import ExperienceModeBanner from "@/components/experience/ExperienceModeBanner";
import type { ScholarRecord } from "@/lib/scholar";
import styles from "./ScholarDashboardExperience.module.css";

type ScholarDashboardExperienceProps = {
  record: ScholarRecord | null;
  loading: boolean;
  loadError: string | null;
};

const nextActions = [
  { href: "/transcript", icon: "↗", title: "Build your academic record", detail: "Upload or review your transcript" },
  { href: "/compass", icon: "✦", title: "Open your Compass plan", detail: "Turn readiness gaps into action" },
  { href: "/support-network", icon: "◎", title: "Activate your Starting Five", detail: "Invite the people behind your goals" },
];

export default function ScholarDashboardExperience({
  record,
  loading,
  loadError,
}: ScholarDashboardExperienceProps) {
  const firstName = record?.identity.firstName || record?.identity.fullName.split(" ")[0] || "Scholar";
  const academics = record?.academics;
  const readiness = academics?.agSummary.percent ?? 0;
  const currentCourses = academics?.currentCourses.length ?? 0;
  const achievementCount = record?.achievements.total ?? 0;
  const portfolioCompletion = record?.readiness.portfolioCompletion ?? 0;

  return (
    <main className={styles.page} data-visual-canon="PGSL-007"
      data-record-state={loading ? "loading" : loadError ? "error" : "ready"}
      data-testid="scholar-dashboard-canon">
      <ExperienceModeBanner />

      {loadError && (
        <div className={styles.error} role="alert">
          <strong>We could not refresh your dashboard.</strong>
          <span>{loadError}</span>
        </div>
      )}

      <header className={styles.welcome}>
        <div>
          <p className={styles.kicker}>Scholar Dashboard</p>
          <h1>Welcome back, {firstName}.</h1>
          <p>Your goals, your progress, and your next play—together in one place.</p>
        </div>
        <div className={styles.statusPill} aria-label={loading ? "Scholar Record loading" : "Scholar Record active"}>
          <span aria-hidden="true" />
          {loading ? "Syncing your record" : "Scholar Record live"}
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="scholar-next-play">
        <Image
          className={styles.heroImage}
          src="/brand/scholar-dashboard/scholar-future-hero-v1.png"
          alt="A Black male Scholar holding a tablet and looking confidently toward his future"
          fill
          priority
          sizes="(max-width: 760px) 100vw, (max-width: 1200px) 70vw, 900px"
        />
        <div className={styles.heroShade} />
        <div className={styles.heroContent}>
          <p className={styles.kicker}>Your next play</p>
          <h2 id="scholar-next-play">Own the record that opens your next door.</h2>
          <p>
            Build verified academic momentum, discover opportunities, and keep your trusted people connected to the journey.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/transcript">Continue your journey <span aria-hidden="true">→</span></Link>
            <Link className={styles.secondaryAction} href="/profile">View your Playbook</Link>
          </div>
        </div>
        <div className={styles.heroSignal} aria-label={`${readiness}% academic readiness`}>
          <strong>{readiness}%</strong>
          <span>Academic readiness</span>
          <div><i style={{ width: `${Math.max(4, readiness)}%` }} /></div>
        </div>
      </section>

      <section className={styles.metrics} aria-label="Scholar progress overview">
        <Metric icon="△" label="A–G readiness" value={`${readiness}%`} detail={`${academics?.agSummary.subjectsMet ?? 0}/7 areas complete`} />
        <Metric icon="◇" label="Current courses" value={String(currentCourses)} detail={currentCourses ? "Active this term" : "Add your first course"} />
        <Metric icon="✦" label="Achievements" value={String(achievementCount)} detail="Badges, certificates, and activity" />
        <Metric icon="◎" label="Portfolio" value={`${portfolioCompletion}%`} detail="Opportunity-ready profile" />
      </section>

      <div className={styles.contentGrid}>
        <section className={styles.panel} aria-labelledby="continue-learning-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.kicker}>Continue building</p>
              <h2 id="continue-learning-title">Your academic momentum</h2>
            </div>
            <Link href="/academic-readiness">View readiness <span aria-hidden="true">→</span></Link>
          </div>
          <AGTracker compact />
        </section>

        <aside className={styles.panel} aria-labelledby="next-actions-title">
          <div className={styles.panelHeading}>
            <div>
              <p className={styles.kicker}>Built around you</p>
              <h2 id="next-actions-title">Your next actions</h2>
            </div>
          </div>
          <div className={styles.actionList}>
            {nextActions.map((action) => (
              <Link href={action.href} key={action.href}>
                <span className={styles.actionIcon} aria-hidden="true">{action.icon}</span>
                <span><strong>{action.title}</strong><small>{action.detail}</small></span>
                <b aria-hidden="true">→</b>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      <section className={styles.opportunityBand} aria-labelledby="opportunity-title">
        <div>
          <p className={styles.kicker}>Opportunity is already moving</p>
          <h2 id="opportunity-title">Turn your progress into possibilities.</h2>
          <p>Compass connects your verified record to scholarships, programs, mentors, courses, and career pathways.</p>
        </div>
        <Link className={styles.primaryAction} href="/opportunities">Explore opportunities <span aria-hidden="true">→</span></Link>
      </section>
    </main>
  );
}

function Metric({ icon, label, value, detail }: { icon: string; label: string; value: string; detail: string }) {
  return (
    <article className={styles.metric}>
      <span className={styles.metricIcon} aria-hidden="true">{icon}</span>
      <div><small>{label}</small><strong>{value}</strong><p>{detail}</p></div>
    </article>
  );
}
