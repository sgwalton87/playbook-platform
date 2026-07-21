"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import StartingFiveCard from "@/components/onboarding/StartingFiveCard";

export default function StartingFiveOnboardingStep() {
  const [scholarId, setScholarId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadScholar() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error("You must be signed in to build your Starting Five.");
        }

        if (active) {
          setScholarId(user.id);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your Starting Five.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadScholar();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section style={styles.shell}>
      <div style={styles.hero}>
        <div style={styles.heroCopy}>
          <p style={styles.eyebrow}>STARTING FIVE</p>

          <h1 style={styles.title}>
            Build the team behind your dreams.
          </h1>

          <p style={styles.description}>
            Choose five people who will encourage you, celebrate your
            milestones, and help keep you moving forward. You can begin
            with one trusted adult and complete your team later.
          </p>
        </div>

        <div style={styles.badge}>
          <span style={styles.badgeIcon}>★</span>
          <span style={styles.badgeLabel}>YOUR VILLAGE</span>
          <strong style={styles.badgeTitle}>You are not doing this alone.</strong>
        </div>
      </div>

      <div style={styles.tipGrid}>
        <div style={styles.tip}>
          <span style={styles.tipIcon}>1</span>
          <div>
            <strong style={styles.tipTitle}>Add your people</strong>
            <p style={styles.tipText}>
              Parents, guardians, coaches, mentors, counselors, teachers,
              relatives, and trusted community members all belong here.
            </p>
          </div>
        </div>

        <div style={styles.tip}>
          <span style={styles.tipIcon}>2</span>
          <div>
            <strong style={styles.tipTitle}>Send secure invitations</strong>
            <p style={styles.tipText}>
              Each supporter receives a personal link connected to the
              email address you provide.
            </p>
          </div>
        </div>

        <div style={styles.tip}>
          <span style={styles.tipIcon}>3</span>
          <div>
            <strong style={styles.tipTitle}>Grow together</strong>
            <p style={styles.tipText}>
              Once connected, your supporters can celebrate progress and
              help you stay accountable.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={styles.stateCard}>
          <div style={styles.spinner} />
          <p style={styles.stateText}>Loading your team…</p>
        </div>
      ) : error ? (
        <div style={styles.errorCard}>
          <strong>We could not load your Starting Five.</strong>
          <p style={styles.errorText}>{error}</p>
        </div>
      ) : scholarId ? (
        <StartingFiveCard scholarId={scholarId} />
      ) : null}

      <p style={styles.privacy}>
        Invitations are private. Each invitation can only be accepted by the person using the email address it was sent to.
      </p>
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    display: "grid",
    gap: 26,
    width: "100%",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "stretch",
    gap: 28,
    flexWrap: "wrap",
    padding: "30px",
    borderRadius: 24,
    background:
      "linear-gradient(135deg, rgba(24,56,45,1) 0%, rgba(38,79,62,1) 100%)",
    boxShadow: "0 20px 50px rgba(24,56,45,.16)",
  },

  heroCopy: {
    flex: "1 1 420px",
    maxWidth: 680,
  },

  eyebrow: {
    margin: "0 0 10px",
    color: "#f47b3a",
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 2.4,
  },

  title: {
    margin: "0 0 14px",
    color: "#fffdf8",
    fontFamily: "Georgia, serif",
    fontSize: "clamp(34px, 5vw, 54px)",
    lineHeight: 1.02,
    letterSpacing: "-1.5px",
  },

  description: {
    maxWidth: 650,
    margin: 0,
    color: "#dfe9e4",
    fontSize: 16,
    lineHeight: 1.7,
  },

  badge: {
    flex: "0 1 230px",
    minHeight: 170,
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    border: "1px solid rgba(255,255,255,.2)",
    borderRadius: 20,
    background: "rgba(255,255,255,.08)",
    backdropFilter: "blur(8px)",
  },

  badgeIcon: {
    marginBottom: 16,
    color: "#f6b44b",
    fontSize: 32,
  },

  badgeLabel: {
    marginBottom: 8,
    color: "#f6b44b",
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.8,
  },

  badgeTitle: {
    color: "#ffffff",
    fontSize: 20,
    lineHeight: 1.3,
  },

  tipGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
    gap: 14,
  },

  tip: {
    display: "flex",
    alignItems: "flex-start",
    gap: 13,
    padding: "18px",
    border: "1px solid #e3e7e5",
    borderRadius: 18,
    background: "#ffffff",
  },

  tipIcon: {
    width: 30,
    height: 30,
    flexShrink: 0,
    display: "grid",
    placeItems: "center",
    borderRadius: "50%",
    background: "#fff1e8",
    color: "#df6429",
    fontSize: 13,
    fontWeight: 900,
  },

  tipTitle: {
    color: "#14271f",
    fontSize: 14,
  },

  tipText: {
    margin: "5px 0 0",
    color: "#6b7771",
    fontSize: 13,
    lineHeight: 1.5,
  },

  stateCard: {
    minHeight: 240,
    display: "grid",
    placeItems: "center",
    alignContent: "center",
    gap: 14,
    border: "1px solid #e1e6e3",
    borderRadius: 24,
    background: "#ffffff",
  },

  spinner: {
    width: 34,
    height: 34,
    border: "4px solid #e7ece9",
    borderTopColor: "#f47b3a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },

  stateText: {
    margin: 0,
    color: "#69746e",
    fontWeight: 700,
  },

  errorCard: {
    padding: "22px",
    border: "1px solid #f1c7bd",
    borderRadius: 18,
    background: "#fff1ed",
    color: "#932f24",
  },

  errorText: {
    margin: "7px 0 0",
    lineHeight: 1.5,
  },

  privacy: {
    margin: 0,
    textAlign: "center",
    color: "#79847e",
    fontSize: 12,
    lineHeight: 1.5,
  },
};
