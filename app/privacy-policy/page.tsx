import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Privacy Policy — Playbook Series Inc.", description: "How Playbook Series Inc. handles account, learning, and community information." };
const heading: React.CSSProperties = { color: "#10213A", marginTop: 30 };
const paragraph: React.CSSProperties = { lineHeight: 1.75, color: "#334155" };
export default function PrivacyPolicy() {
  return <main style={{ background: "#F8FAFC", minHeight: "100vh", padding: "32px 16px" }}>
    <article style={{ maxWidth: 850, margin: "0 auto", padding: "clamp(24px,5vw,52px)", background: "#FFFFFF", borderRadius: 20, borderTop: "6px solid #F97316" }}>
      <p style={{ color: "#B45309", fontWeight: 800, letterSpacing: 2 }}>PLAYBOOK SERIES INC.</p>
      <h1 style={{ color: "#10213A", fontSize: "clamp(32px,5vw,46px)" }}>Privacy Policy</h1>
      <p style={paragraph}><strong>Effective date:</strong> October 23, 2026</p>
      <p style={paragraph}>Playbook Series Inc. (“Playbook,” “we,” or “us”) provides education, mentoring, community and opportunity-related services through playbookseriesinc.org and app.playbookseriesinc.org. This policy explains the information involved in those services, why we use it, and the choices available to account holders, parents and guardians.</p>
      <h2 style={heading}>1. Information we receive</h2>
      <p style={paragraph}>Depending on the services you choose, information can include your name, email address, account role, profile and onboarding responses, educational and extracurricular interests, uploaded content, course participation, preferences, support relationships, communications, reports and technical information such as device/browser details and security logs. If you use Google Sign-In, Playbook requests basic account identity information, including your name, email address and profile image as permitted by Google. We do not request access to your Gmail messages or Google Drive merely to sign you in.</p>
      <h2 style={heading}>2. Why we process information</h2>
      <p style={paragraph}>We use information to authenticate accounts, operate role-specific experiences, deliver courses and mentoring, manage permissions and partnerships, support applications and opportunities, respond to inquiries, maintain records required for operation and safety, prevent misuse, and improve reliability. Some functionality remains restricted until identity, relationship or organizational authorization is approved.</p>
      <h2 style={heading}>3. Scholars, minors and families</h2>
      <p style={paragraph}>Playbook serves young people, including minors. Scholar-related information requires special care. Family, educator, coach, mentor and organizational access must follow applicable consent, role and relationship requirements; registering an account does not automatically authorize access to a scholar’s private information. Children under 13 must not independently create or use an account without an authorized process satisfying applicable parental consent requirements. Parents and guardians may contact us about a minor’s account, access, correction or deletion requests.</p>
      <h2 style={heading}>4. Sharing and visibility</h2>
      <p style={paragraph}>Some information is visible to people you intentionally interact with or share it with through permitted platform features. We may disclose the minimum information needed to authorized service providers that support hosting, authentication, delivery or security; to verified partners when expressly permitted for a requested opportunity; or when required by law or necessary to address safety concerns. We do not treat a role selection as permission for unrelated individuals to view private educational records. We do not sell personal information to advertisers.</p>
      <h2 style={heading}>5. Messaging, meetings and third-party services</h2>
      <p style={paragraph}>Approved communication features may share messages, files and meeting links with authorized participants. If you open a Zoom or other external meeting link, that provider’s privacy terms also apply. A saved personal meeting link is not intended as a public contact directory listing. Google and our authentication provider process sign-in information according to their separate applicable terms.</p>
      <h2 style={heading}>6. Security and retention</h2>
      <p style={paragraph}>We use account authentication, role-related access controls and other operational safeguards. No online system is guaranteed to be completely secure. Records are retained as needed for service delivery, security, applicable obligations, dispute resolution and account administration; retention periods vary by record type. Requests for access, correction or deletion are reviewed subject to identity verification, safety and legal obligations.</p>
      <h2 style={heading}>7. Your choices</h2>
      <p style={paragraph}>You may update available profile information and communication preferences through the app. You may request help with account access, consent, correction, deletion or privacy concerns using the contact information below. We may need to verify your identity or relationship to an account before acting.</p>
      <h2 style={heading}>8. Changes and contact</h2>
      <p style={paragraph}>We may update this policy as services or legal requirements change and will publish a revised effective date. For privacy questions, contact <a href="mailto:connect@playbookseriesinc.org">connect@playbookseriesinc.org</a>. Organization: Playbook Series Inc., Oakland, California.</p>
      <p style={{ marginTop: 38 }}><Link href="/terms-of-service">Terms of Service</Link> · <a href="https://playbookseriesinc.org">Playbook home</a></p>
    </article>
  </main>;
}
