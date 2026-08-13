#!/usr/bin/env node

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";

const ROOT = process.cwd();
const API_ROOT = resolve(ROOT, "app", "api");
const OUTPUT_PATH = resolve(ROOT, "docs", "release-evidence", "pbos-sec-001-service-role-audit.json");

const SERVICE_ROLE_MARKER = "SUPABASE_SERVICE_ROLE_KEY";
const AUTH_MARKERS = [
  /getUser\(/i,
  /getSession\(/i,
  /getClaims\(/i,
  /authorization/i,
  /cookies\(/i,
  /createServerClient\(/i,
];

function walkFiles(current) {
  const nodes = readdirSync(current, { withFileTypes: true });
  const collected = [];

  for (const node of nodes) {
    const candidate = join(current, node.name);
    if (node.isDirectory()) {
      collected.push(...walkFiles(candidate));
      continue;
    }

    if (/route\.(?:ts|tsx)$/.test(node.name)) {
      collected.push(candidate);
    }
  }

  return collected;
}

function makeRouteLabel(filePath) {
  const rel = relative(join(ROOT, "app"), filePath);
  return `/app/${rel.replace(/\\/g, "/")}`;
}

function classifyFile(filePath) {
  const source = readFileSync(filePath, "utf8");
  const serviceRole = source.includes(SERVICE_ROLE_MARKER);
  if (!serviceRole) {
    return null;
  }

  const authSignals = AUTH_MARKERS
    .map((pattern) => (pattern.test(source) ? pattern.source : null))
    .filter(Boolean);

  const elevatedWrites = /insert\(|update\(|upsert\(|delete\(/i.test(source);
  const publicReadExposure = /from\(["'`]public\.[\w_]+["'`]\)\.[\s\S]*?select\(/i.test(source);
  const risk = elevatedWrites ? "high" : publicReadExposure ? "medium" : "low";

  return {
    route: makeRouteLabel(filePath),
    file: relative(ROOT, filePath),
    serviceRole: true,
    authSignals,
    elevatedWrites,
    publicReadExposure,
    risk,
  };
}

function buildEvidence(items) {
  const riskCounts = items.reduce((acc, item) => {
    acc[item.risk] = (acc[item.risk] ?? 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

  return {
    mission: "PBOS-SEC-001",
    generatedAt: new Date().toISOString(),
    scope: "app/api route handlers using SUPABASE_SERVICE_ROLE_KEY",
    summary: {
      serviceRoleRouteCount: items.length,
      highRiskRoutes: items.filter((item) => item.risk === "high").length,
      mediumRiskRoutes: items.filter((item) => item.risk === "medium").length,
      lowRiskRoutes: items.filter((item) => item.risk === "low").length,
      riskCounts,
    },
    findings: items,
  };
}

const files = walkFiles(API_ROOT);
const findings = files
  .map(classifyFile)
  .filter((entry) => entry !== null);

mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
writeFileSync(OUTPUT_PATH, `${JSON.stringify(buildEvidence(findings), null, 2)}\n`);

console.log(`WROTE ${OUTPUT_PATH}`);
console.log(`serviceRoleRoutes=${findings.length}`);
