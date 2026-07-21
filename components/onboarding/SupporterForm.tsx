"use client";

import { useState } from "react";

export type Supporter = {
  id?: string;
  role: string;
  relationship: string;
  fullName: string;
  email: string;
  phone: string;
  organization: string;
  occupation: string;
  message: string;
  status?: "draft" | "invited" | "pending" | "connected";
};

type Props = {
  role: string;
  initial?: Partial<Supporter>;
  onSave: (supporter: Supporter) => void;
  onCancel: () => void;
};

export default function SupporterForm({
  role,
  initial,
  onSave,
  onCancel,
}: Props) {
  const [supporter, setSupporter] = useState<Supporter>({
    id: initial?.id,
    role,
    relationship: initial?.relationship ?? "",
    fullName: initial?.fullName ?? "",
    email: initial?.email ?? "",
    phone: initial?.phone ?? "",
    organization: initial?.organization ?? "",
    occupation: initial?.occupation ?? "",
    message:
      initial?.message ??
      "I'd love for you to be part of my Playbook Starting Five and support me throughout my academic and career journey.",
    status: initial?.status ?? "draft",
  });

  function update<K extends keyof Supporter>(
    key: K,
    value: Supporter[K]
  ) {
    setSupporter((s) => ({
      ...s,
      [key]: value,
    }));
  }

  const inputStyle: React.CSSProperties = {
    padding: 16,
    borderRadius: 14,
    border: "1px solid #CBD5E1",
    fontSize: 15,
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <div
      style={{
        display: "grid",
        gap: 18,
      }}
    >
      <div
        style={{
          width: 84,
          height: 84,
          borderRadius: "50%",
          background: "#F1F5F9",
          display: "grid",
          placeItems: "center",
          fontSize: 36,
          margin: "0 auto",
        }}
      >
        👤
      </div>

      <input
        style={inputStyle}
        placeholder="Full Name"
        value={supporter.fullName}
        onChange={(e) => update("fullName", e.target.value)}
      />

      <input
        style={inputStyle}
        placeholder="Relationship"
        value={supporter.relationship}
        onChange={(e) => update("relationship", e.target.value)}
      />

      <input
        style={inputStyle}
        placeholder="Email"
        type="email"
        value={supporter.email}
        onChange={(e) => update("email", e.target.value)}
      />

      <input
        style={inputStyle}
        placeholder="Phone"
        value={supporter.phone}
        onChange={(e) => update("phone", e.target.value)}
      />

      <input
        style={inputStyle}
        placeholder="Occupation"
        value={supporter.occupation}
        onChange={(e) => update("occupation", e.target.value)}
      />

      <input
        style={inputStyle}
        placeholder="Organization / School"
        value={supporter.organization}
        onChange={(e) => update("organization", e.target.value)}
      />

      <textarea
        rows={5}
        style={{
          ...inputStyle,
          resize: "vertical",
        }}
        value={supporter.message}
        onChange={(e) => update("message", e.target.value)}
      />

      <label
        style={{
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
          fontSize: 14,
          color: "#475569",
        }}
      >
        <input type="checkbox" defaultChecked />
        I have permission to invite this supporter to join my Starting Five.
      </label>

      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "flex-end",
        }}
      >
        <button
          type="button"
          onClick={onCancel}
          style={{
            padding: "14px 22px",
            borderRadius: 999,
            border: "1px solid #CBD5E1",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 700,
          }}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => onSave(supporter)}
          style={{
            padding: "14px 24px",
            borderRadius: 999,
            border: "none",
            background: "#F97316",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          Save Supporter
        </button>
      </div>
    </div>
  );
}
