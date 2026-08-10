import Image from "next/image";
import Link from "next/link";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import styles from "./CanonicalAuthShell.module.css";

export default function CanonicalAuthShell({ eyebrow, title, description, children }: { eyebrow:string; title:string; description:string; children:React.ReactNode }) {
  return <main className={styles.page} data-visual-canon="PGDS-001">
    <section className={styles.story} aria-label="The Playbook Scholar experience">
      <Image src="/brand/scholar-dashboard/scholar-future-hero-v1.png" alt="A Black male Scholar holding a tablet and looking confidently toward his future" fill priority sizes="(max-width:820px) 100vw,45vw" className={styles.image}/>
      <div className={styles.shade}/><div className={styles.storyContent}>
        <Link href="/" className={styles.home} aria-label="The Playbook home"><PlaybookLogo size={72} priority/></Link>
        <div className={styles.copy}><div className={styles.eyebrow}>{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      </div>
    </section>
    <section className={styles.content}><div className={styles.panel}>{children}</div></section>
  </main>;
}
