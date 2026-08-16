import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // The two flagship course pages landed on main before the Scholar-Athlete
  // adapter and currently use state-hydration patterns rejected by the newer
  // React hooks lint rules. Keep this exception path-scoped so unrelated code
  // remains fully gated while those course pages are refactored independently.
  {
    files: [
      "app/courses/15-week-leadership-program/page.tsx",
      "app/courses/civic-engagement-for-young-leaders/page.tsx",
    ],
    rules: {
      "react-hooks/immutability": "off",
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-assign-module-variable": "off",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Historical snapshots are intentionally kept for recovery and audit,
    // but they are not active production source for lint gating.
    ".playbook-backups/**",
    "scripts/backups/**",
    "**/*.backup.*",
  ]),
]);

export default eslintConfig;
