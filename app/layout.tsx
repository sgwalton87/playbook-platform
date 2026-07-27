import { ThemeProvider } from "@/components/ThemeProvider";
import UnifiedAppShell from "@/components/shell/UnifiedAppShell";

export const metadata = {
  title: "The Playbook",
  description:
    "The operating system for scholars, scholar-athletes, mentors, families, and communities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <ThemeProvider><UnifiedAppShell>{children}</UnifiedAppShell></ThemeProvider>
      </body>
    </html>
  );
}
