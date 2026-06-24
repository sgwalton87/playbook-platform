"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Confetti from "react-confetti";
import { supabase } from "@/lib/supabaseClient";

const T = {
  navy: "#0F172A",
  cream: "#F8F7F4",
  surface: "#FFFFFF",
  ink: "#0F172A",
  muted: "#64748B",
  line: "#E2E8F0",
  orange: "#F97316",
  green: "#10B981",
  amber: "#F59E0B",
  red: "#EF4444",
  mono: "'Space Mono', monospace",
  sans: "'Hanken Grotesk', system-ui, sans-serif",
  anton: "'Anton', sans-serif",
};

export default function DashboardPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [confetti, setConfetti] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();

      setProfile(p);

      const profileCreated = sessionStorage.getItem("pb_profile_created");

      if (profileCreated) {
        setConfetti(true);
        sessionStorage.removeItem("pb_profile_created");

        setTimeout(() => {
          setConfetti(false);
        }, 5000);
      }

      setLoading(false);
    }

    loadDashboard();
  }, [router]);

  if (loading) {
    return (
      <main style={{
        minHeight: "100vh",
        background: T.cream,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: T.sans,
        color: T.ink,
      }}>
        Loading dashboard...
      </main>
    );
  }

  const name =
    profile?.full_name ||
    profile?.username ||
    "Scholar";

  return (
    <main style={{
      minHeight: "100vh",
      background: T.cream,
      color: T.ink,
      fontFamily: T.sans,
      padding: "32px",
    }}>
      {confetti && <Confetti />}

      <section style={{ maxWidth: 1120, margin: "0 auto" }}>
        <p style={{
          fontFamily: T.mono,
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: T.orange,
          marginBottom: 8,
        }}>
          Your Playbook
        </p>

        <h1 style={{
          fontFamily: T.anton,
          fontWeight: 400,
          fontSize: "clamp(36px,4vw,56px)",
          textTransform: "uppercase",
          color: T.ink,
          lineHeight: 0.95,
          marginBottom: 28,
        }}>
          Welcome back,<br />
          <span style={{ color: T.orange }}>{name}!</span>
        </h1>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}>
          <DashboardCard title="A-G Progress" value="Ready to build" status="Academic tracker" />
          <DashboardCard title="FAFSA" value="Not started" status="Financial aid" />
          <DashboardCard title="Applications" value="0 schools" status="College tracker" />
          <DashboardCard title="Playbook Coins" value={profile?.coin_balance ?? 0} status="Rewards" />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 16,
        }}>
          <Panel title="Academic Readiness">
            <p>Track A-G requirements, GPA, transcripts, FAFSA, scholarships, and college applications here.</p>
          </Panel>

          <Panel title="Advisor / Mentor View">
            <p>Assigned mentors, coaches, and academic advisors will be able to view scholar progress and intervention alerts.</p>
          </Panel>

          <Panel title="Next Steps">
            <p>Finish connecting A-G courses, school dropdowns, college deadline tracking, and advisor access permissions.</p>
          </Panel>
        </div>
      </section>
    </main>
  );
}

function DashboardCard({
  title,
  value,
  status,
}: {
  title: string;
  value: string | number;
  status: string;
}) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: 18,
      padding: 20,
      boxShadow: "0 10px 30px rgba(15,23,42,.06)",
    }}>
      <p style={{
        fontFamily: T.mono,
        fontSize: 10,
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        color: T.muted,
        marginBottom: 10,
      }}>
        {title}
      </p>

      <div style={{
        fontFamily: T.anton,
        fontSize: 30,
        color: T.orange,
        marginBottom: 6,
      }}>
        {value}
      </div>

      <p style={{ fontSize: 13, color: T.muted }}>{status}</p>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: T.surface,
      border: `1px solid ${T.line}`,
      borderRadius: 18,
      padding: 22,
    }}>
      <h2 style={{
        fontFamily: T.anton,
        fontWeight: 400,
        fontSize: 24,
        textTransform: "uppercase",
        marginBottom: 10,
      }}>
        {title}
      </h2>

      <div style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
        {children}
      </div>
    </div>
  );
}
