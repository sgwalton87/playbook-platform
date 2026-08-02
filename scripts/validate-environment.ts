import { loadEnvConfig } from "@next/env";
import { validateEnvironment } from "../lib/config/environment";

loadEnvConfig(process.cwd());

const result = validateEnvironment(process.env);

for (const warning of result.warnings) {
  console.warn(`WARNING ${warning.variable}: ${warning.message}`);
}

if (!result.ok) {
  for (const error of result.errors) {
    console.error(`ERROR ${error.variable}: ${error.message}`);
  }
  process.exitCode = 1;
} else {
  console.log(`Environment contract valid for ${result.environment}.`);
}
