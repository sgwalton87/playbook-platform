"use client";

import { usePathname } from "next/navigation";
import {
  getExperienceMode,
  getExperienceModeLabel,
} from "@/lib/experience-cleanup";

export default function ExperienceModeBanner() {
  const pathname = usePathname();
  const mode = getExperienceMode(pathname || "/");

  if (mode === "active") return null;

  return (
    <div style={banner}>
      <strong>{getExperienceModeLabel(mode)}</strong>
      <span style={text}>
        {mode === "foundation"
          ? "This page shows the workflow foundation. Some actions may still use demo data until connected to live records."
          : mode === "demo"
            ? "This page is a demo experience for storytelling, testing, and presentation."
            : "This page is intended for Founder, Admin, and Studio inspection workflows."}
      </span>
    </div>
  );
}

const banner: React.CSSProperties = {
  maxWidth: 1180,
  margin: "0 auto 14px",
  background: "#FFF7ED",
  border: "1px solid #FED7AA",
  color: "#9A3412",
  borderRadius: 16,
  padding: "12px 14px",
  display: "grid",
  gap: 4,
};

const text: React.CSSProperties = {
  color: "#9A3412",
  lineHeight: 1.45,
  fontSize: 13,
};
