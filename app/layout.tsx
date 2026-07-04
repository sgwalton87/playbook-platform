import { ThemeProvider } from "@/components/ThemeProvider";

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