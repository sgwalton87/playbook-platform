import Image from "next/image";
import Link from "next/link";
import CanonicalPublicNav from "@/components/public/CanonicalPublicNav";
import CanonicalPublicFooter from "@/components/public/CanonicalPublicFooter";
import styles from "./about.module.css";

export default function AboutPage() {
  return (
    <main className={styles.page} data-visual-canon="PGDS-001">
      <CanonicalPublicNav />
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>About The Playbook</p>
          <h1>One record.<br />Every next play.</h1>
          <p>The Playbook is a role-aware opportunity operating system built around the person—not disconnected programs, portals, and paperwork.</p>
          <div className={styles.actions}>
            <Link href="/login?mode=signup">Choose your pathway <span>→</span></Link>
            <Link href="/opportunities">Explore opportunities</Link>
          </div>
        </div>
        <div className={styles.visual}>
          <Image src="/brand/scholar-dashboard/scholar-future-hero-v1.png" alt="A Black male Scholar building his future with The Playbook" fill priority sizes="(max-width: 820px) 100vw, 48vw" />
        </div>
      </section>
      <section className={styles.principles} aria-label="How The Playbook works">
        <article><span>01</span><h2>Own your record</h2><p>Your evidence, goals, and progress stay connected to one living journey.</p></article>
        <article><span>02</span><h2>Bring your people</h2><p>Families, mentors, educators, coaches, and partners act through scoped relationships.</p></article>
        <article><span>03</span><h2>Turn progress into opportunity</h2><p>Readiness becomes clear next actions, applications, support, and durable outcomes.</p></article>
      </section>
      <CanonicalPublicFooter />
    </main>
  );
}
