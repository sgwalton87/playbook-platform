import Link from "next/link";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import styles from "./CanonicalPublicFooter.module.css";

const productLinks = [
  ["Explore The Playbook", "/preview"], ["Community newsfeed", "/news"],
  ["Choose your role", "/role-select"], ["About us", "/about"],
] as const;
const journeyLinks = [
  ["Scholar-Athlete", "/scholar-athlete-os"], ["Academic readiness", "/academic-readiness"],
  ["Athlete Abroad", "/athlete-abroad-os"], ["Brand partners", "/brand-partner-os"],
] as const;

export default function CanonicalPublicFooter() {
  return (
    <footer className={styles.footer} data-testid="canonical-public-footer">
      <div className={styles.top}>
        <div className={styles.identity}>
          <Link href="/" className={styles.brand} aria-label="The Playbook home">
            <PlaybookLogo size={78} />
            <span><strong>The Playbook</strong><small>Run it.</small></span>
          </Link>
          <p>One living record connecting people, progress, trusted support, and opportunity.</p>
        </div>
        <FooterLinks title="The platform" links={productLinks} />
        <FooterLinks title="Featured journeys" links={journeyLinks} />
        <div className={styles.action}>
          <p className={styles.label}>Build your next play</p>
          <h2>Your future deserves a connected system.</h2>
          <Link href="/login?mode=signup">Join The Playbook →</Link>
        </div>
      </div>
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Playbook Series Inc.</span>
        <span>Responsive web access. Role-aware journeys. User-owned progress.</span>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }: { title: string; links: ReadonlyArray<readonly [string, string]> }) {
  return <nav className={styles.column} aria-label={title}>
    <p className={styles.label}>{title}</p>
    {links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
  </nav>;
}
