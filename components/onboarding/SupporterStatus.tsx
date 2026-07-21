"use client";

type Status = "draft" | "invited" | "pending" | "connected";

const STATUS_CONFIG: Record<
  Status,
  {
    label: string;
    icon: string;
    background: string;
    color: string;
    border: string;
  }
> = {
  draft: {
    label: "Saved",
    icon: "●",
    background: "#EFF6FF",
    color: "#1D4ED8",
    border: "#BFDBFE",
  },
  invited: {
    label: "Invitation Sent",
    icon: "●",
    background: "#FFF7ED",
    color: "#C2410C",
    border: "#FED7AA",
  },
  pending: {
    label: "Invitation Pending",
    icon: "●",
    background: "#FFF7ED",
    color: "#C2410C",
    border: "#FED7AA",
  },
  connected: {
    label: "Joined",
    icon: "●",
    background: "#ECFDF5",
    color: "#047857",
    border: "#A7F3D0",
  },
};

export default function SupporterStatus({
  status,
}: {
  status: Status;
}) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.draft;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "7px 13px",
        borderRadius: 999,
        border: `1px solid ${config.border}`,
        background: config.background,
        color: config.color,
        fontWeight: 800,
        fontSize: 13,
        lineHeight: 1,
      }}
    >
      <span aria-hidden="true">{config.icon}</span>
      {config.label}
    </span>
  );
}
