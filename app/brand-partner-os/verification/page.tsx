import BrandPartnerVerificationGate from "@/components/brand/BrandPartnerVerificationGate";
import Link from "next/link";
export default function BrandPartnerVerificationPage() {
  return <BrandPartnerVerificationGate>
    <main style={{ maxWidth: 800, margin: "24px auto", padding: 24 }}>
      <h1>Brand Partner verification complete</h1>
      <p>Your organization's approved activities are available in your Brand Partner workspace.</p>
      <Link href="/brand-partner-os">Continue to Brand Partner OS →</Link>
    </main>
  </BrandPartnerVerificationGate>;
}
