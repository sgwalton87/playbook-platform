import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Terms of Service — Playbook Series Inc.", description: "Terms for participation in Playbook Series Inc. educational and community services." };
const heading: React.CSSProperties = { color: "#10213A", marginTop: 30 };
const paragraph: React.CSSProperties = { lineHeight: 1.75, color: "#334155" };
export default function TermsOfService() {
  return <main style={{ background: "#F8FAFC", minHeight: "100vh", padding: "32px 16px" }}>
    <article style={{ maxWidth: 850, margin: "0 auto", padding: "clamp(24px,5vw,52px)", background: "#FFFFFF", borderRadius: 20, borderTop: "6px solid #F97316" }}>
      <p style={{ color: "#B45309", fontWeight: 800, letterSpacing: 2 }}>PLAYBOOK SERIES INC.</p>
      <h1 style={{ color: "#10213A", fontSize: "clamp(32px,5vw,46px)" }}>Terms of Service</h1>
      <p style={paragraph}><strong>Effective date:</strong> October 23, 2026</p>
      <p style={paragraph}>These terms describe the rules for accessing and using Playbook Series Inc.’s websites, educational programs, accounts, courses, mentoring, networking and opportunity services. By using a service, you agree to follow these terms and the Community Safety Agreement presented during onboarding where applicable.</p>
      <h2 style={heading}>1. Eligibility and accounts</h2>
      <p style={paragraph}>Provide accurate registration details, maintain the confidentiality of account credentials, and use only accounts and roles you are authorized to hold. Playbook offers services for young people, families, mentors, educators and organizations. Minors must participate through the applicable age, parent or guardian consent, and program safety requirements. Under-13 access requires a separately authorized parental-consent process where applicable.</p>
      <h2 style={heading}>2. Conduct and safety</h2>
      <p style={paragraph}>Do not bully, threaten, harass, discriminate, intimidate, exploit, sexually solicit or retaliate against other participants. Do not disclose someone’s private educational or personal details without permission, impersonate others, circumvent restrictions or misuse communications. Report safety concerns through the platform’s reporting or support pathways.</p>
      <h2 style={heading}>3. Role verification and permitted access</h2>
      <p style={paragraph}>Selecting a mentor, coach, educator, employer, Brand Partner, administrator or other role does not itself grant authority to contact scholars, see restricted records, publish opportunities or initiate regulated activities. Access depends on verified identity, authorized relationships, individual consents and scope-specific approvals. Permissions may be restricted, suspended or revoked for safety or compliance reasons.</p>
      <h2 style={heading}>4. Courses, meetings and opportunities</h2>
      <p style={paragraph}>Playbook facilitates programs, learning activities, approved connections and opportunities but does not guarantee admission, scholarships, recruiting outcomes, employment, financial results or participation in a particular program. External meeting services and third-party opportunities may have additional terms. A meeting link is not an invitation to contact someone without an authorized Playbook relationship.</p>
      <h2 style={heading}>5. Content and intellectual property</h2>
      <p style={paragraph}>You retain rights to original materials you submit, subject to rights held by others. You grant Playbook a limited license to store, process and display the materials as needed to operate features you choose, administer safety and comply with law. Do not upload content you lack permission to share, including another person’s private information or protected media. Playbook’s branding and platform materials remain protected by applicable rights.</p>
      <h2 style={heading}>6. Service availability and enforcement</h2>
      <p style={paragraph}>Features may be introduced, modified, limited or interrupted during platform development and operations. We may investigate potential violations and take proportionate action such as restricting features, removing content, suspending access or terminating accounts, subject to applicable law and safety obligations.</p>
      <h2 style={heading}>7. Privacy and external services</h2>
      <p style={paragraph}>Please read our <Link href="/privacy-policy">Privacy Policy</Link> to understand personal information practices. External providers, including Google sign-in and meeting platforms, may apply their own terms and privacy policies when you choose to use them.</p>
      <h2 style={heading}>8. Legal limitations</h2>
      <p style={paragraph}>Services are provided subject to applicable law. Nothing in these terms limits nonwaivable consumer, child-protection or privacy rights. Playbook does not provide individualized legal, medical or regulated financial advice merely by making educational materials available. Specific paid programs may have additional disclosed terms.</p>
      <h2 style={heading}>9. Questions and updates</h2>
      <p style={paragraph}>We may revise these terms and will post an updated effective date. For questions or account support contact <a href="mailto:connect@playbookseriesinc.org">connect@playbookseriesinc.org</a>. Organization: Playbook Series Inc., Oakland, California.</p>
      <p style={{ marginTop: 38 }}><Link href="/privacy-policy">Privacy Policy</Link> · <a href="https://playbookseriesinc.org">Playbook home</a></p>
    </article>
  </main>;
}
