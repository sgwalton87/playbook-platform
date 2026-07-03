"use client";

import StudioSidebar from "./StudioSidebar";

export default function StudioShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={shell}>
      <StudioSidebar />
      <div>{children}</div>
    </div>
  );
}

const shell: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "260px 1fr",
  minHeight: "100vh",
};
