"use client";

type Step = {
  id: string;
  title: string;
};

type Props = {
  steps: Step[];
  currentStep: number;
};

export default function ProgressTracker({
  steps,
  currentStep,
}: Props) {
  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "24px auto",
        padding: "0 24px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontWeight: 900,
            fontSize: 18,
          }}
        >
          Step {currentStep + 1} of {steps.length}
        </div>

        <div
          style={{
            color: "#64748B",
            fontWeight: 700,
          }}
        >
          {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
        </div>
      </div>

      <div
        style={{
          height: 10,
          background: "#E2E8F0",
          borderRadius: 999,
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: `${((currentStep + 1) / steps.length) * 100}%`,
            height: "100%",
            background: "#F97316",
            transition: "width .35s ease",
          }}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${steps.length},1fr)`,
          gap: 12,
        }}
      >
        {steps.map((step, index) => {
          const complete = index < currentStep;
          const active = index === currentStep;

          return (
            <div
              key={step.id}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 999,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  border: active
                    ? "3px solid #F97316"
                    : "2px solid #CBD5E1",
                  background: complete
                    ? "#F97316"
                    : active
                    ? "#FFF7ED"
                    : "#FFFFFF",
                  color: complete
                    ? "#FFFFFF"
                    : active
                    ? "#F97316"
                    : "#64748B",
                  transition: ".25s",
                }}
              >
                {complete ? "✓" : index + 1}
              </div>

              <div
                style={{
                  textAlign: "center",
                  fontWeight: active ? 800 : 600,
                  fontSize: 13,
                  color: active ? "#0F172A" : "#64748B",
                }}
              >
                {step.title}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
