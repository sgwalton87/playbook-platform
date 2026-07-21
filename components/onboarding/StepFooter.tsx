"use client";

type Props = {
  saving?: boolean;
  isLast?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  onSkip?: () => void;
  onNext?: () => void;
};

export default function StepFooter({
  saving = false,
  isLast = false,
  showBack = false,
  onBack,
  onSkip,
  onNext,
}: Props) {
  return (
    <div
      style={{
        position: "sticky",
        bottom: 20,
        marginTop: 32,
        background: "rgba(255,255,255,.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid #E2E8F0",
        borderRadius: 24,
        padding: 18,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        boxShadow: "0 20px 50px rgba(15,23,42,.10)",
        zIndex: 20,
      }}
    >
      <div>
        {showBack && (
          <button
            onClick={onBack}
            style={{
              border: "1px solid #CBD5E1",
              background: "#fff",
              padding: "14px 22px",
              borderRadius: 999,
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            ← Back
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: 12,
        }}
      >
        <button
          onClick={onSkip}
          style={{
            border: "1px solid #CBD5E1",
            background: "#fff",
            padding: "14px 22px",
            borderRadius: 999,
            fontWeight: 800,
            cursor: "pointer",
          }}
        >
          Skip for now
        </button>

        <button
          disabled={saving}
          onClick={onNext}
          style={{
            border: "none",
            background: "#F97316",
            color: "#fff",
            padding: "14px 28px",
            borderRadius: 999,
            fontWeight: 900,
            cursor: saving ? "default" : "pointer",
            opacity: saving ? .6 : 1,
          }}
        >
          {saving
            ? "Saving..."
            : isLast
            ? "Create Profile"
            : "Continue →"}
        </button>
      </div>
    </div>
  );
}
