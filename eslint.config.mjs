import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
{
  rules: {
    "react-hooks/set-state-in-effect": "off",
  },
},
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/backups/**",
    "archives/**",
    "backups/**",
    "data/education/generated/**",
  ]),
]);

export default eslintConfig;
