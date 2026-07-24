import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
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
