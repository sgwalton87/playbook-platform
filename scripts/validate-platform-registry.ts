#!/usr/bin/env tsx
import { assessPlatformReadiness, validatePlatformRegistry } from "../pbos/platform-registry";

const validation = validatePlatformRegistry();
for (const warning of validation.warnings) console.warn(`WARN ${warning}`);
if (!validation.valid) {
  for (const error of validation.errors) console.error(`ERROR ${error}`);
  process.exitCode = 1;
} else {
  console.log("Platform registry contract passed.");
  console.log(JSON.stringify({ inventory: validation.counts, readiness: assessPlatformReadiness() }, null, 2));
}
