import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import UnifiedAppShell from "@/components/shell/UnifiedAppShell";
import SessionGuard from "@/components/auth/SessionGuard";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "The Playbook",
    template: "%s | The Playbook",
  },
  description: "The opportunity operating system for scholars, families, mentors, and communities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ThemeProvider>
          <SessionGuard />
          <UnifiedAppShell>{children}</UnifiedAppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
