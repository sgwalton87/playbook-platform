import Image from "next/image";
import Link from "next/link";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import styles from "./home.module.css";

const signals = [
  ["120K+", "Scholars"],
  ["25K+", "Mentors"],
  ["2K+", "Schools"],
  ["50+", "States"],
] as const;

export default function HomePage() {
  return (
    <main className={styles.page} data-visual-canon="PLAYBOOK-LANDING-001">
      <nav className={styles.nav} aria-label="Primary navigation">
        <Link href="/" className={styles.brand} aria-label="The Playbook home">
          <PlaybookLogo size={54} priority />
          <span><strong>The Playbook</strong><small>Run it.</small></span>
        </Link>
        <div className={styles.navLinks}>
          <Link href="/about">About</Link>
          <Link href="/opportunities">Explore</Link>
          <Link href="/login">Log in</Link>
          <Link href="/login?mode=signup" className={styles.navAction}>Join The Playbook</Link>
        </div>
      </nav>

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
    </main>
  );
}
