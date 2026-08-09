import Link from "next/link";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import styles from "./CanonicalPublicNav.module.css";

export default function CanonicalPublicNav() {
  return (
    <nav className={styles.nav} aria-label="Primary navigation">
      <Link href="/" className={styles.brand} aria-label="The Playbook home">
        <PlaybookLogo size={64} priority />
        <span><strong>The Playbook</strong><small>Run it.</small></span>
      </Link>
      <div className={styles.links}>
        <Link href="/about">About</Link>
        <Link href="/news">Newsfeed</Link>
        <Link href="/opportunities">Explore</Link>
        <Link href="/login">Log in</Link>
        <Link href="/login?mode=signup" className={styles.action}>Join The Playbook</Link>
      </div>
    </nav>
  );
}
