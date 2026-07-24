"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import PlaybookLogo from "@/components/brand/PlaybookLogo";

export default function BrandPartnerOSPage() {
  const [profile, setProfile] = useState<LegacyValue>(null);

  useEffect(() => {
    async function load() {
      const { data: u } = await supabase.auth.getUser();

      if (!u.user) {
        window.location.href = "/login";
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.user.id)
        .maybeSingle();

      setProfile(data);
    }

    load();
  }, []);

  const data = profile?.onboarding_data || {};

  return (
    <main style={page}>
      <section style={hero}>
        <div>
          <PlaybookLogo size={112} priority />
          <p style={eyebrow}>Brand Partner OS</p>
          <h1 style={title}>Power the next play.</h1>
          <p style={lead}>
            Build campaigns, rewards, sponsorships, NIL education, internships,
            events, and opportunity pathways for scholars and scholar-athletes.
          </p>
        </div>
      </section>

      <section style={grid}>
        <Card label="Organization" value={data.organization_name || profile?.full_name || "Not set"} />
        <Card label="Brand Category" value={data.brand_category || "Not set"} />
        <Card label="Partnership Goals" value={(data.partnership_goals || []).join(", ") || "Not set"} />
        <Card label="Budget Range" value={data.monthly_budget_range || "Not set"} />
      </section>

      <section style={panel}>
        <p style={eyebrow}>Campaign Builder</p>
        <h2>Start with one opportunity.</h2>
        <div style={actionGrid}>
          <Action title="Create Reward Campaign" body="Offer rewards, points, products, services, or sponsored experiences." />
          <Action title="Sponsor Scholar-Athletes" body="Create compliance-aware NIL education and visibility opportunities." />
          <Action title="Offer Internships" body="Build work-based learning and career exposure opportunities." />
          <Action title="Fund a Course" body="Sponsor a learning path in money, leadership, wellness, or career readiness." />
        </div>
      </section>
    </main>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <article style={card}>
      <p style={eyebrow}>{label}</p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </article>
  );
}

function Action({ title, body }: { title: string; body: string }) {
  return (
    <article style={action}>
      <h3>{title}</h3>
      <p>{body}</p>
      <button style={button}>Coming Next</button>
    </article>
  );
}

const page: React.CSSProperties = { minHeight: "100vh", background: "#F8F7F4", color: "#0F172A", padding: 24 };
const hero: React.CSSProperties = { background: "#0F172A", color: "#F8F7F4", borderRadius: 34, padding: "clamp(34px,6vw,80px)", marginBottom: 18 };
const eyebrow: React.CSSProperties = { fontFamily: "'Space Mono', monospace", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: "#F97316", fontWeight: 900 };
const title: React.CSSProperties = { fontFamily: "'Anton', sans-serif", fontSize: "clamp(52px,8vw,96px)", lineHeight: .9, textTransform: "uppercase", margin: "12px 0" };
const lead: React.CSSProperties = { fontSize: 22, lineHeight: 1.45, color: "rgba(248,247,244,.76)", maxWidth: 900 };
const grid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14, marginBottom: 18 };
const card: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 22, padding: 22 };
const panel: React.CSSProperties = { background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 28, padding: 28 };
const actionGrid: React.CSSProperties = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 };
const action: React.CSSProperties = { border: "1px solid #E2E8F0", borderRadius: 20, padding: 20, background: "#F8FAFC" };
const button: React.CSSProperties = { border: "none", borderRadius: 999, background: "#F97316", color: "#FFFFFF", padding: "10px 16px", fontWeight: 950 };
