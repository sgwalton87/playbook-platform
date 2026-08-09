import CanonicalPublicNav from "@/components/public/CanonicalPublicNav";
import PublicNewsFeed from "@/components/public/PublicNewsFeed";

export default function PublicNewsPage() {
  return (
    <main style={page} data-testid="public-newsfeed" data-visual-canon="PGNF-001">
      <CanonicalPublicNav />
      <section style={hero}>
        <p style={eyebrow}>The Playbook Newsfeed</p>
        <h1 style={title}>Real progress. Public stories. New possibilities.</h1>
        <p style={lead}>Read updates that Playbook members intentionally published for the community. Private records, support conversations, and unpublished activity stay private.</p>
      </section>
      <PublicNewsFeed />
    </main>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", padding: "0 clamp(18px,4vw,54px) 70px", color: "#F8FAFC", background: "radial-gradient(circle at 88% 8%,rgba(249,115,22,.2),transparent 25rem),linear-gradient(145deg,#031023,#071B34 58%,#181327)" };
const hero: React.CSSProperties = { maxWidth: 1180, margin: "0 auto", padding: "clamp(58px,9vw,112px) 0 50px" };
const eyebrow: React.CSSProperties = { color: "#FF7A2F", fontSize: 11, fontWeight: 950, letterSpacing: ".18em", textTransform: "uppercase" };
const title: React.CSSProperties = { maxWidth: 1000, margin: "15px 0", fontFamily: "Anton, sans-serif", fontSize: "clamp(52px,8vw,104px)", fontWeight: 400, lineHeight: .9, textTransform: "uppercase" };
const lead: React.CSSProperties = { maxWidth: 830, color: "#C9D8E8", fontSize: 18, lineHeight: 1.65 };
