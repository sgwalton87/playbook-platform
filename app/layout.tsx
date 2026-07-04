import { ThemeProvider } from "@/components/ThemeProvider";
import UnifiedAppShell from "@/components/shell/UnifiedAppShell";

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
