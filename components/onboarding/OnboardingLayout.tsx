"use client";

import { ReactNode } from "react";
import PlaybookLogo from "@/components/brand/PlaybookLogo";
import { playbookTheme } from "@/lib/design-system/tokens";

type Step = {
  id: string;
  title: string;
};

type Props = {
  role: string;
  title: string;
  description: string;
  heroImage: string;
  steps: Step[];
  currentStep: number;
  children: ReactNode;
  footer?: ReactNode;
};

export default function OnboardingLayout({
  role,
  title,
  description,
  heroImage,
  steps,
  currentStep,
  children,
  footer,
}: Props) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: playbookTheme.colors.canvas,
        color: "#0F172A",
      }}
    >
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: 28,
        }}
      >
        <div
          style={{
            background: "#09111F",
            borderRadius: playbookTheme.radius.xl,
            overflow: "hidden",
            display: "grid",
            gridTemplateColumns: "1.1fr .9fr",
            minHeight: 360,
          }}
        >
          <div
            style={{
              padding: 54,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <PlaybookLogo size={120} priority />

            <div
              style={{
                marginTop: 22,
                color: playbookTheme.colors.orange,
                fontWeight: 900,
                letterSpacing: 2,
                fontSize: 11,
              }}
            >
              START HERE · {role.toUpperCase()}
            </div>

            <h1
              style={{
                marginTop: 16,
                marginBottom: 20,
                color: "white",
                fontSize: 62,
                lineHeight: .95,
                fontWeight: 900,
              }}
            >
              {title}
            </h1>

            <p
              style={{
                maxWidth: 520,
                color: playbookTheme.colors.line,
                fontSize: 20,
                lineHeight: 1.6,
              }}
            >
              {description}
            </p>
          </div>

          <div
            style={{
              background: "#111827",
            }}
          >
            <img
              src={heroImage}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              alt=""
            />
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 1040,
          margin: "24px auto",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <strong>
            Step {currentStep + 1} of {steps.length}
          </strong>

          <span style={{ color: playbookTheme.colors.muted }}>
            Progress
          </span>
        </div>

        <div
          style={{
            background: "#E2E8F0",
            height: 10,
            borderRadius: playbookTheme.radius.pill,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${((currentStep + 1) / steps.length) * 100}%`,
              background: playbookTheme.colors.orange,
              height: "100%",
              transition: ".35s",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 18,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          {steps.map((step, i) => (
            <div
              key={step.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontWeight: i === currentStep ? 800 : 500,
                color: i <= currentStep ? playbookTheme.colors.orange : "#94A3B8",
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 99,
                  background: i <= currentStep ? playbookTheme.colors.orange : playbookTheme.colors.line,
                }}
              />

              {step.title}
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          maxWidth: 980,
          margin: "0 auto 120px",
          padding: "0 24px",
        }}
      >
        <div
          style={{
            background: playbookTheme.colors.card,
            borderRadius: playbookTheme.radius.xl,
            padding: 48,
            border: `1px solid `,
            boxShadow: "0 30px 60px rgba(15,23,42,.08)",
          }}
        >
          {children}
        </div>

        {footer}
      </section>

      <div
        style={{
          position: "fixed",
          right: 30,
          bottom: 28,
          background: playbookTheme.colors.card,
          border: `1px solid `,
          borderRadius: playbookTheme.radius.pill,
          padding: "12px 18px",
          fontWeight: 700,
          color: "#16A34A",
          boxShadow: "0 10px 30px rgba(0,0,0,.08)",
        }}
      >
        ✓ Autosaving
      </div>
    </main>
  );
}
