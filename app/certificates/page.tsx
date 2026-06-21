"use client";

import AppShell from "@/components/AppShell";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const surface = "#ffffff";
const ink = "#0F172A";
const muted = "#64748B";
const line = "#E2E8F0";
const accent = "#F97316";

export default function CertificatesPage() {
  const router = useRouter();

  const [certificates, setCertificates] = useState<any[]>([]);
  const [courseMap, setCourseMap] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCertificates = async () => {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData.user) {
        router.replace("/login");
        return;
      }

      const userId = userData.user.id;

      const { data: certData } = await supabase
        .from("certificates")
        .select("*")
        .eq("user_id", userId)
        .order("issued_at", { ascending: false });

      const slugs = (certData || []).map((cert) => cert.course_slug);

      if (slugs.length > 0) {
        const { data: courseData } = await supabase
          .from("courses")
          .select("*")
          .in("slug", slugs);

        const mapped: Record<string, any> = {};
        (courseData || []).forEach((course) => {
          mapped[course.slug] = course;
        });

        setCourseMap(mapped);
      }

      setCertificates(certData || []);
      setLoading(false);
    };

    loadCertificates();
  }, [router]);

  if (loading) {
    return (
      <AppShell title="Certificates">
        <p>Loading certificates...</p>
      </AppShell>
    );
  }

  return (
    <AppShell title="Certificates">
      <div style={{ display: "grid", gap: 24 }}>
        <section
          style={{
            background: surface,
            border: `1px solid ${line}`,
            borderRadius: 28,
            padding: 30,
          }}
        >
          <p
            style={{
              color: accent,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontWeight: 900,
              fontSize: 12,
              marginTop: 0,
            }}
          >
            Playbook Achievement Vault
          </p>

          <h1
            style={{
              color: ink,
              margin: 0,
              fontSize: 52,
              textTransform: "uppercase",
              lineHeight: 0.95,
              fontFamily: "Anton, sans-serif",
            }}
          >
            Certificate Cards
          </h1>

          <p style={{ color: muted, maxWidth: 720, lineHeight: 1.6 }}>
            Certificates only appear once a participant completes an entire course.
          </p>
        </section>

        {certificates.length === 0 ? (
          <section
            style={{
              background: surface,
              border: `1px solid ${line}`,
              borderRadius: 24,
              padding: 28,
            }}
          >
            <p style={{ color: muted }}>No certificates earned yet.</p>
          </section>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 20,
            }}
          >
            {certificates.map((cert, index) => {
              const course = courseMap[cert.course_slug];
              const title =
                course?.title ||
                cert.certificate_name?.replace(" Certificate", "") ||
                cert.course_slug;

              const pillar = course?.pillar || "Playbook";

              return (
                <div
                  key={cert.id}
                  style={{
                    background: "#0F172A",
                    borderRadius: 26,
                    padding: 18,
                    color: "#F8F7F4",
                    border: "1px solid rgba(255,255,255,.12)",
                    boxShadow: "0 20px 40px rgba(15,23,42,.14)",
                  }}
                >
                  <div
                    style={{
                      border: `2px solid ${accent}`,
                      borderRadius: 22,
                      padding: 20,
                      minHeight: 360,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      background:
                        "radial-gradient(circle at top left, rgba(249,115,22,.25), transparent 35%), linear-gradient(145deg, #111827, #0F172A)",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 28,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "rgba(248,247,244,.55)",
                        }}
                      >
                        <span>ERA {index + 1}/{certificates.length}</span>
                        <span
                          style={{
                            color: accent,
                            border: `1px solid ${accent}`,
                            borderRadius: 999,
                            padding: "4px 9px",
                          }}
                        >
                          Uncommon
                        </span>
                      </div>

                      <div
                        style={{
                          height: 96,
                          width: 96,
                          borderRadius: 24,
                          background: "rgba(255,255,255,.08)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 52,
                          marginBottom: 22,
                        }}
                      >
                        🎓
                      </div>

                      <h2
                        style={{
                          fontFamily: "Anton, sans-serif",
                          fontSize: 34,
                          lineHeight: 0.95,
                          textTransform: "uppercase",
                          margin: "0 0 10px",
                          color: "#F8F7F4",
                        }}
                      >
                        {title}
                      </h2>

                      <p
                        style={{
                          color: accent,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 12,
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontWeight: 900,
                        }}
                      >
                        {pillar}
                      </p>
                    </div>

                    <div>
                      <div
                        style={{
                          borderTop: "1px solid rgba(255,255,255,.14)",
                          paddingTop: 16,
                          fontFamily: "'Space Mono', monospace",
                          fontSize: 10,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "rgba(248,247,244,.55)",
                        }}
                      >
                        Playbook Series · Validated
                      </div>

                      <p
                        style={{
                          color: "rgba(248,247,244,.65)",
                          marginTop: 10,
                          fontSize: 13,
                        }}
                      >
                        Earned{" "}
                        {cert.issued_at
                          ? new Date(cert.issued_at).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </AppShell>
  );
}
