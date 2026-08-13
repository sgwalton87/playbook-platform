#!/usr/bin/env node

import { accessSync, constants } from "node:fs";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import process from "node:process";

const ROOT = process.cwd();
const IS_WINDOWS = process.platform === "win32";
const RAW_BASE_URL =
  process.env.PBOS_SMOKE_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_ORIGIN ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.PUBLIC_SITE_URL ??
  process.env.PUBLIC_URL ??
  "http://localhost:3000";
const EVIDENCE_PATH = resolve(
  ROOT,
  "docs",
  "release-evidence",
  "pbos-qa-001-synthetic-run.json",
);

const PLAYWRIGHT_BIN = resolve(
  ROOT,
  "node_modules",
  ".bin",
  IS_WINDOWS ? "playwright.cmd" : "playwright",
);
const PLAYWRIGHT_MODULE = resolve(ROOT, "node_modules", "@playwright", "test");
const FALLBACK_MODE = process.env.PBOS_SMOKE_FALLBACK === "1";
const FORCE_PLAYWRIGHT = process.env.PBOS_SMOKE_REQUIRE_PLAYWRIGHT === "1";
const PLAYWRIGHT_BROWSER_HINT = process.env.PBOS_SMOKE_BROWSER || "chromium";
const BASE_URL = sanitizeAndValidateBaseUrl(RAW_BASE_URL);
const HTTP_TIMEOUT_MS = 15_000;
const DEFAULT_SMOKE_ROUTES = [
  {
    path: "/",
    name: "public landing",
    expect: [200, 301, 302, 303, 307, 308],
  },
  {
    path: "/login",
    name: "authentication",
    expect: [200, 301, 302, 307, 308],
  },
  {
    path: "/record",
    name: "scholar record",
    expect: [200, 301, 302, 303, 307, 308],
  },
  {
    path: "/portfolio/demo",
    name: "portfolio experience",
    expect: [200, 301, 302, 303, 307, 308],
  },
  {
    path: "/notifications",
    name: "notifications inbox",
    expect: [200, 301, 302, 303, 307, 308],
  },
  {
    path: "/support-messages",
    name: "support messaging",
    expect: [200, 301, 302, 303, 307, 308],
  },
];
const PLAYWRIGHT_HARNESS_FAILURE_PATTERNS = [
  /install browsers/i,
  /No browsers were found/i,
  /No tests found/i,
  /Process from config\.webServer was not able to start/i,
  /browserType\.launch/i,
  /Executable doesn't exist/i,
  /Failed to launch browser/i,
  /playwright\.install/i,
  /does not support chromium on mac12/i,
  /Playwright does not support chromium on mac12/i,
  /does not support webkit on mac12/i,
  /Playwright does not support webkit on mac12/i,
  /does not support firefox on mac12/i,
  /Playwright does not support firefox on mac12/i,
  /listen EPERM/i,
  /Operation not permitted/i,
];

const PLAYWRIGHT_BROWSERS = ["chromium", "firefox", "webkit"];

function sanitizeAndValidateBaseUrl(rawBaseUrl) {
  const trimmed = String(rawBaseUrl || "").trim();
  if (trimmed.length === 0) {
    return "http://localhost:3000";
  }

  if (/^<.*>$/.test(trimmed)) {
    return null;
  }

  const usesLocalhostHost =
    /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)(:\d+)?(\/|$)/i.test(trimmed);
  const defaultScheme = usesLocalhostHost ? "http://" : "https://";
  const withScheme = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `${defaultScheme}${trimmed}`;

  try {
    const url = new URL(withScheme);
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

function resolveBaseUrl() {
  if (BASE_URL === null) {
    const original = String(RAW_BASE_URL).trim();
    console.error(
      `[PBOS-QA-001] blocked: PBOS_SMOKE_BASE_URL is not a valid URL-like value: ${original}`,
    );
    writeEvidence("blocked", {
      reason: "invalid-smoke-base-url",
      baseUrl: original,
    });
    process.exit(2);
  }
  return BASE_URL;
}

function writeEvidence(status, detail) {
  const payload = {
    mission: "PBOS-QA-001",
    timestamp: new Date().toISOString(),
    command: "node scripts/test-synthetic.mjs",
    status,
    ...detail,
  };

  mkdirSync(dirname(EVIDENCE_PATH), { recursive: true });
  writeFileSync(EVIDENCE_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function parsePlaywrightBrowserPreference() {
  const rawCandidates = PLAYWRIGHT_BROWSER_HINT.split(",")
    .map((candidate) => candidate.trim().toLowerCase())
    .filter(Boolean);
  const valid = [];
  for (const candidate of rawCandidates) {
    if (PLAYWRIGHT_BROWSERS.includes(candidate) && !valid.includes(candidate)) {
      valid.push(candidate);
    }
  }

  if (valid.length === 0) {
    return ["chromium"];
  }

  const fallbackOrder = ["chromium", "firefox", "webkit"];
  for (const fallbackBrowser of fallbackOrder) {
    if (!valid.includes(fallbackBrowser)) {
      valid.push(fallbackBrowser);
    }
  }

  return valid.slice(0, 3);
}

function reportPlaywrightFallbackModeSummary() {
  const supportedPath =
    process.platform === "darwin"
      ? "Playwright does not support all engines on mac12 in this environment."
      : "Playwright browser support is environment-dependent.";
  console.log(
    `[PBOS-QA-001] deterministic fallback active: ${supportedPath} ${FALLBACK_MODE ? "Fallback was requested explicitly." : "Falling back automatically due local browser constraints."}`,
  );
}

function buildPlaywrightArgs(browser) {
  const args = ["test", "--config", "tests/e2e/playwright.config.ts"];
  const project = browser || "chromium";
  if (project !== "chromium") {
    args.push(`--project=${project}`);
  }

  return args;
}

function executePlaywright(args) {
  return spawnSync(PLAYWRIGHT_BIN, args, {
    cwd: ROOT,
    stdio: "pipe",
    shell: false,
  });
}

function shouldFallbackFromPlaywrightOutput(output = "") {
  return PLAYWRIGHT_HARNESS_FAILURE_PATTERNS.some((pattern) =>
    pattern.test(output),
  );
}

function playwrightAvailable() {
  return hasPlaywrightDependencies();
}

function hasPlaywrightDependencies() {
  try {
    accessSync(PLAYWRIGHT_BIN, constants.F_OK);
    accessSync(PLAYWRIGHT_MODULE, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function assertPlaywrightPresent() {
  const missing = [];

  try {
    accessSync(PLAYWRIGHT_BIN, constants.F_OK);
  } catch {
    missing.push("playwright CLI executable");
  }

  try {
    accessSync(PLAYWRIGHT_MODULE, constants.F_OK);
  } catch {
    missing.push("@playwright/test module");
  }

  if (missing.length > 0) {
    console.error(
      `[PBOS-QA-001] blocked: test harness unavailable; missing ${missing.join(", ")}.`,
    );
    console.error(
      "[PBOS-QA-001] next step: install Playwright tooling and run `npm i -D @playwright/test` then rerun.",
    );
    writeEvidence("blocked", { reason: "missing-playwright-dependencies", missing });
    process.exit(2);
  }
}

function assertSmokeSuitePresent() {
  const SPEC = resolve(ROOT, "tests", "e2e", "smoke.spec.ts");
  try {
    accessSync(SPEC, constants.F_OK);
  } catch {
    console.error(
      `[PBOS-QA-001] blocked: expected smoke suite not found at ${SPEC}.`,
    );
    writeEvidence("blocked", { reason: "smoke-suite-missing", suitePath: SPEC });
    process.exit(2);
  }
}

async function runHttpFallbackSmoke() {
  const baseUrl = resolveBaseUrl();
  reportPlaywrightFallbackModeSummary();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), HTTP_TIMEOUT_MS);
  const routeDefs = (process.env.PBOS_SMOKE_ROUTES || "")
    .split(",")
    .map((route) => route.trim())
    .filter(Boolean)
    .map((path) => ({ path, name: `custom:${path}`, expect: [200, 301, 302, 303, 307, 308] }));
  const routes = routeDefs.length > 0 ? routeDefs : DEFAULT_SMOKE_ROUTES;
  const environmentFailureCodes = new Set([
    "EPERM",
    "ECONNREFUSED",
    "ENOTFOUND",
    "EHOSTUNREACH",
    "ENETUNREACH",
    "ECONNRESET",
    "ETIMEDOUT",
    "ECONNABORTED",
  ]);

  try {
    const failures = [];
    const checks = [];

    for (const route of routes) {
      const target = new URL(route.path, `${baseUrl.replace(/\/+$/, "")}/`);
      const response = await fetch(target, {
        signal: controller.signal,
        redirect: "manual",
      });
      const body = await response.text().catch(() => "");
      const statusCode = response.status;
      const statusText = response.statusText;
      const hasResponseBody = body.length > 0;
      const passed = route.expect.includes(statusCode);

      checks.push({
        path: route.path,
        name: route.name,
        statusCode,
        statusText,
        hasResponseBody,
      });

      if (!passed) {
        failures.push({ ...checks.at(-1), expected: route.expect });
      }

      if (statusCode >= 500) {
        console.error(
          `[PBOS-QA-001] fallback smoke failed: ${route.path} returned ${statusCode} ${statusText}.`,
        );
        writeEvidence("failed", {
          reason: "smoke-failed-fallback",
          mode: "http-fallback",
          target: baseUrl,
          checkPath: route.path,
          statusCode,
          statusText,
          checks: checks,
          note: "Playwright unavailable; ran fallback HTTP smoke check.",
        });
        process.exit(1);
      }
    }

    if (failures.length > 0) {
      console.error("[PBOS-QA-001] fallback smoke route checks failed.");
      writeEvidence("failed", {
        reason: "smoke-failed-fallback",
        mode: "http-fallback",
        target: baseUrl,
        failures,
        checks,
        note: "Playwright unavailable; ran fallback HTTP smoke check.",
      });
      process.exit(1);
    }

    console.log(
      `[PBOS-QA-001] fallback smoke passed for ${baseUrl} across ${checks.length} route(s).`,
    );
    writeEvidence("passed", {
      reason: "smoke-pass-fallback",
      mode: "http-fallback",
      target: baseUrl,
      routesChecked: checks.length,
      checks,
      note: "Playwright execution path was unavailable; used fallback HTTP smoke mode.",
    });
    process.exit(0);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const cause = error instanceof Error && "cause" in error ? error.cause : undefined;
    const causeCode =
      typeof cause === "object" && cause && "code" in cause
        ? String(cause.code).toUpperCase()
        : undefined;
    const isEnvironmentFailure =
      Boolean(causeCode && environmentFailureCodes.has(causeCode)) ||
      /ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EHOSTUNREACH|ECONNRESET/i.test(message);
    console.error(`[PBOS-QA-001] fallback smoke failed: ${message}`);
    writeEvidence(
      isEnvironmentFailure ? "blocked" : "failed",
      {
        reason: isEnvironmentFailure
          ? "smoke-environment-unreachable"
          : "smoke-failed-fallback",
        mode: "http-fallback",
        target: baseUrl,
        message,
        causeCode,
        playwrightAvailable: hasPlaywrightDependencies(),
        note: "Playwright execution path was unavailable; used fallback HTTP smoke mode.",
      },
    );
    process.exit(isEnvironmentFailure ? 2 : 1);
  } finally {
    clearTimeout(timeout);
  }
}

async function runPlaywright() {
  const candidates = parsePlaywrightBrowserPreference();

  for (let attempt = 0; attempt < candidates.length; attempt += 1) {
    const browser = candidates[attempt];
    const args = buildPlaywrightArgs(browser);
    const run = executePlaywright(args);
    const combinedOutput = [run.stdout?.toString(), run.stderr?.toString()]
      .filter(Boolean)
      .join("\n");

    if (run.error) {
      console.error(
        `[PBOS-QA-001] command failed to start for project ${browser}: ${run.error.message}`,
      );
      const output = combinedOutput || String(run.error.message || "");
      const isRetryable =
        !FORCE_PLAYWRIGHT &&
        attempt < candidates.length - 1 &&
        shouldFallbackFromPlaywrightOutput(output);

      if (isRetryable) {
        console.log(
          `[PBOS-QA-001] Playwright launch failure with ${browser}; retrying browser candidate ${attempt + 1} of ${candidates.length}.`,
        );
        continue;
      }

      writeEvidence("failed", {
        reason: "playwright-launch-error",
        commandError: run.error.message,
        browser,
        candidates,
      });
      process.exit(1);
    }

    if (run.status !== 0) {
      if (!FORCE_PLAYWRIGHT && shouldFallbackFromPlaywrightOutput(combinedOutput)) {
        if (attempt < candidates.length - 1) {
          console.log(
            `[PBOS-QA-001] Playwright harness failure for ${browser}; retrying next browser candidate.`,
          );
          continue;
        }

        console.log(
          "[PBOS-QA-001] Playwright harness failure detected and all browser candidates exhausted.",
        );
        await runHttpFallbackSmoke();
        return;
      }

      console.error("[PBOS-QA-001] playwright smoke suite failed.");
      writeEvidence("failed", {
        reason: "smoke-failed",
        exitCode: run.status ?? 1,
        note: combinedOutput.slice(0, 1024),
        browser,
        candidates,
      });
      process.exit(run.status ?? 1);
    }

    writeEvidence("passed", {
      reason: "smoke-pass",
      exitCode: run.status ?? 0,
      browser,
      candidates,
      note: combinedOutput.slice(0, 1024),
    });

    process.exit(run.status ?? 1);
  }

  // if every browser candidate failed for a retryable reason and we got here, run deterministic fallback
  if (!FORCE_PLAYWRIGHT) {
    await runHttpFallbackSmoke();
  }
}

if (!FORCE_PLAYWRIGHT && FALLBACK_MODE) {
  console.log(
    "[PBOS-QA-001] fallback mode explicitly requested via PBOS_SMOKE_FALLBACK=1.",
  );
  await runHttpFallbackSmoke();
} else if (!FORCE_PLAYWRIGHT && !playwrightAvailable()) {
  console.log(
    "[PBOS-QA-001] Playwright dependencies missing; running deterministic HTTP smoke fallback.",
  );
  await runHttpFallbackSmoke();
} else {
  resolveBaseUrl();
  assertPlaywrightPresent();
  assertSmokeSuitePresent();
  await runPlaywright();
}
