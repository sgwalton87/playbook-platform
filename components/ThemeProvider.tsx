"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<LegacyValue>(null);

export function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const saved = localStorage.getItem("theme");

    if (saved) {
      window.setTimeout(() => setTheme(saved), 0);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";

    setTheme(next);

    localStorage.setItem("theme", next);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        toggleTheme,
      }}
    >
      <div
        style={{
          minHeight: "100vh",
          background:
            theme === "dark"
              ? "#0f172a"
              : "#f8fafc",
          color:
            theme === "dark"
              ? "#fff"
              : "#111",
        }}
      >
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);