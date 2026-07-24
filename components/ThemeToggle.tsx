"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = localStorage.getItem("playbook-theme");
    if (saved === "dark" || saved === "light") {
      window.setTimeout(() => setTheme(saved), 0);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("playbook-theme", next);
    window.dispatchEvent(new Event("playbook-theme-change"));
  };

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: 18,
        right: 18,
        zIndex: 9999,
        borderRadius: 999,
        padding: "10px 14px",
        border: "1px solid #ff6a2c",
        background: theme === "dark" ? "#1a1512" : "#fff",
        color: theme === "dark" ? "#f6f0e7" : "#100c0a",
        cursor: "pointer",
        fontWeight: 800,
      }}
    >
      {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}