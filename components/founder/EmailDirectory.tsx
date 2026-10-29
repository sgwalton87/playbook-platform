import { emailDirectory } from "@/lib/email/directory";
export default function EmailDirectory() {
  return <section aria-labelledby="email-directory-title" style={{ maxWidth: 1180, margin: "24px auto", padding: "clamp(16px,3vw,28px)", border: "1px solid #CBD5E1", borderRadius: 20, background: "white", color: "#15243A" }}>
    <h2 id="email-directory-title">Playbook email directory</h2>
    <p>One purpose for every inbox. Mailbox ownership does not grant admin access. This directory classifies addresses; provider delivery and mailbox settings are managed separately.</p>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: 16 }}>
      {emailDirectory.map(mailbox => <article key={mailbox.key} style={{ padding: 16, border: "1px solid #E2E8F0", borderRadius: 12, minWidth: 0 }}>
        <h3 style={{ margin: "0 0 8px" }}>{mailbox.label}</h3>
        <a href={`mailto:${mailbox.address}`} style={{ overflowWrap: "anywhere" }}>{mailbox.address}</a>
        <p>{mailbox.purpose}</p><p style={{ fontSize: 13, color: "#52657B" }}>{mailbox.usage}</p>
      </article>)}
    </div>
  </section>;
}
