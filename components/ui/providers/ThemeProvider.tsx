"use client";

import { createContext, useMemo, useState } from "react";
import { playbookTheme } from "@/lib/design-system/tokens";

export type ThemeMode = "light" | "dark";
export type ThemeContextValue = { theme: ThemeMode; setTheme: (theme: ThemeMode) => void; toggleTheme: () => void; tokens: typeof playbookTheme };

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children, defaultTheme = "light" }: { children: React.ReactNode; defaultTheme?: ThemeMode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return defaultTheme;
    const saved = window.localStorage.getItem("playbook-theme");
    return saved === "light" || saved === "dark" ? saved : defaultTheme;
  });

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    window.localStorage.setItem("playbook-theme", nextTheme);
  };

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme, toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"), tokens: playbookTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      <div data-playbook-theme={theme} style={theme === "dark" ? darkShell : lightShell}>{children}</div>
    </ThemeContext.Provider>
  );
}

const lightShell: React.CSSProperties = { color: playbookTheme.colors.ink, background: playbookTheme.colors.canvas, minHeight: "100%" };
const darkShell: React.CSSProperties = { color: "#FFFFFF", background: playbookTheme.colors.ink, minHeight: "100%" };
