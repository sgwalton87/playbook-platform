import Image from "next/image";
import Link from "next/link";
import CanonicalPublicNav from "@/components/public/CanonicalPublicNav";
import CanonicalPublicFooter from "@/components/public/CanonicalPublicFooter";
import styles from "./home.module.css";

const signals = [
  ["14", "Role pathways"],
  ["1", "Living record"],
  ["Web", "Responsive access"],
  ["You", "Own the journey"],
] as const;

export default function HomePage() {
  return (
    <main className={styles.page} data-visual-canon="PLAYBOOK-LANDING-001">
      <CanonicalPublicNav />

      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>Built for your future</p>
          <h1>Your Playbook.<br />Your team.<br /><em>Your future.</em></h1>
          <p className={styles.lede}>
            Turn school, goals, mentors, opportunities, and your support network into one clear path forward.
          </p>
          <div className={styles.actions}>
            <Link href="/login?mode=signup" className={styles.primary}>Join The Playbook <span>→</span></Link>
            <Link href="/login" className={styles.secondary}>Log in</Link>
          </div>
          <dl className={styles.signals}>
            {signals.map(([value, label]) => <div key={label}><dt>{value}</dt><dd>{label}</dd></div>)}
          </dl>
        </div>

        <div className={styles.visual}>
          <div className={styles.signalCard}><span>Scholar Record</span><strong>Build what opens doors.</strong></div>
          <Image
            src="/brand/scholar-dashboard/scholar-future-hero-v1.png"
            alt="A Black male Scholar holding a tablet and looking confidently toward his future"
            fill
            priority
            sizes="(max-width: 820px) 100vw, 52vw"
            className={styles.heroImage}
          />
          <div className={styles.futureCard}><span>Next play</span><strong>Own your record.</strong><small>Connect goals to real opportunity.</small></div>
        </div>
      </section>

      <section id="about" className={styles.story} aria-labelledby="about-title">
        <p className={styles.eyebrow}>One connected platform</p>
        <div className={styles.storyGrid}>
          <h2 id="about-title">Your future should not live in disconnected systems.</h2>
          <div>
            <p>The Playbook connects academic evidence, goals, trusted people, opportunities, and next actions around one role-aware record.</p>
            <p>You choose your pathway. Your permissions shape what people can see and do. Your progress moves with you.</p>
          </div>
        </div>
      </section>

      <section id="explore" className={styles.explore} aria-labelledby="explore-title">
        <div>
          <p className={styles.eyebrow}>See what is possible</p>
          <h2 id="explore-title">Build the record. Find the opportunity. Bring your team.</h2>
        </div>
        <div className={styles.exploreActions}>
          <Link href="/login?mode=signup" className={styles.primary}>Choose your pathway <span>→</span></Link>
          <Link href="/opportunities" className={styles.secondary}>Explore opportunities</Link>
        </div>
      </section>
      <CanonicalPublicFooter />
    </main>
  );
}
