import { execFile, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { cp, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { setTimeout as delay } from "node:timers/promises";
import { assertLocalSyntheticAuthTarget } from "../../tests/acceptance/helpers/assertLocalSyntheticAuthTarget.mjs";

const exec = promisify(execFile);
const envNames = ["PATH", "HOME", "CI", "RUNNER_TEMP", "TMPDIR", "PLAYWRIGHT_BROWSERS_PATH",
  "SUPABASE_TELEMETRY_DISABLED", "PBOS_ALLOW_SYNTHETIC_AUTH_WRITE", "PBOS_ACCEPTANCE_COMMIT",
  "PLAYWRIGHT_BASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "PBOS_QA_MAIL_URL"];
const journeyStages = ["registration", "verification", "login", "onboarding", "activation", "dashboard",
  "cross-role-denial", "profile-save", "logout", "return-login", "persistence"];
const artifact = resolve("artifacts/trusted-local-scholar/evidence.json");

export function assertTrustedRunner(environment) {
  assertLocalSyntheticAuthTarget(environment);
  for (const [key, target] of Object.entries({
    PLAYWRIGHT_BASE_URL: "http://127.0.0.1:3000",
    NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
    PBOS_QA_MAIL_URL: "http://127.0.0.1:54324",
  })) {
    if (environment[key] !== target) throw new Error("Unexpected disposable localhost endpoint");
  }
  if (environment.GITHUB_ACTIONS !== "true" || environment.RUNNER_ENVIRONMENT !== "github-hosted" ||
      environment.GITHUB_EVENT_NAME !== "workflow_dispatch" || !environment.RUNNER_TEMP ||
      !/^[a-f0-9]{40}$/.test(environment.PBOS_ACCEPTANCE_COMMIT ?? "")) {
    throw new Error("Trusted QA requires an explicit dispatch on a disposable GitHub runner and an exact commit");
  }
}

export async function runDisposableLifecycle({ start, run, stop }) {
  try {
    await start();
    await run();
  } finally {
    await stop();
  }
}

function localKeys(output, expectedUrl) {
  const values = Object.fromEntries([...output.matchAll(/^([A-Z_]+)="([^"\r\n]+)"\r?$/gm)]
    .map(([, key, value]) => [key, value]));
  if (values.API_URL !== expectedUrl || !values.ANON_KEY || !values.SERVICE_ROLE_KEY) {
    throw new Error("Disposable Supabase status did not return the expected local credentials");
  }
  return values;
}

async function assertLocalRevision(env) {
  const url = new URL("/api/deployment", env.PLAYWRIGHT_BASE_URL);
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        if ((await response.json()).commit === env.PBOS_ACCEPTANCE_COMMIT) return;
        throw new Error("Local application reported a different checkout SHA");
      }
    } catch (error) {
      if (error.message === "Local application reported a different checkout SHA") throw error;
    }
    await delay(1000);
  }
  throw new Error("Local application did not become healthy");
}

async function main() {
  const report = {
    schema: "pbos.trusted-local-scholar.v1",
    commit: /^[a-f0-9]{40}$/.test(process.env.PBOS_ACCEPTANCE_COMMIT ?? "") ? process.env.PBOS_ACCEPTANCE_COMMIT : null,
    environment: "disposable-localhost",
    roleCertified: false,
    inventory: { count: 107, artifact: `pbos-capability-ledger-${process.env.PBOS_ACCEPTANCE_COMMIT}`,
      capabilityIds: ["record:private-profile", "roles:scholar-os"] },
    setup: {},
    steps: Object.fromEntries(journeyStages.map(step => [step, { status: "NOT TESTED" }])),
  };
  const env = Object.fromEntries(envNames.filter(name => process.env[name] !== undefined)
    .map(name => [name, process.env[name]]));
  const command = (name, args, options = {}) =>
    exec(name, args, { env, maxBuffer: 32 * 1024 * 1024, timeout: 600_000, ...options });
  let stage = "preflight";
  let app;
  let appFailed = false;
  let project;
  let stackAttempted = false;
  await mkdir(dirname(artifact), { recursive: true });
  try {
    assertTrustedRunner(process.env);
    if ((await command("git", ["rev-parse", "HEAD"])).stdout.trim() !== report.commit) {
      throw new Error("Checkout does not match dispatch SHA");
    }
    const sources = await readFile("supabase/config.toml", "utf8");
    if (!/^\[local_smtp\]$/m.test(sources) || /^\[auth\.email\.smtp\]$/m.test(sources) ||
        !/^enable_confirmations = true$/m.test(sources)) {
      throw new Error("Local mail-capture and confirmation settings are required");
    }
    // Copy only tracked inputs required by the local CLI. Linking and remote credentials are deliberately absent.
    project = await mkdtemp(join(env.RUNNER_TEMP, "pbos-scholar-"));
    await mkdir(join(project, "supabase"));
    await cp("supabase/migrations", join(project, "supabase/migrations"), { recursive: true });
    const projectId = `pbos-scholar-${randomUUID().slice(0, 12)}`;
    await writeFile(join(project, "supabase/config.toml"), sources.replace(/^project_id = .*$/m, `project_id = "${projectId}"`));
    report.setup[stage] = "PASS";
    await runDisposableLifecycle({
      start: async () => {
        stage = "migrations";
        await command(process.execPath, [resolve("scripts/pbos/prepare-local-supabase-migrations.mjs")], { cwd: project });
        report.setup[stage] = "PASS";
        stage = "database-start";
        stackAttempted = true;
        await command("supabase", ["start"], { cwd: project });
        report.setup[stage] = "PASS";
        stage = "local-credentials";
        const keys = localKeys((await command("supabase", ["status", "-o", "env"], { cwd: project })).stdout,
          env.NEXT_PUBLIC_SUPABASE_URL);
        Object.assign(env, {
          NEXT_PUBLIC_SUPABASE_ANON_KEY: keys.ANON_KEY,
          SUPABASE_SERVICE_ROLE_KEY: keys.SERVICE_ROLE_KEY,
          NEXT_PUBLIC_HCAPTCHA_SITE_KEY: "10000000-ffff-ffff-ffff-000000000001",
          VERCEL_GIT_COMMIT_SHA: report.commit,
        });
        report.setup[stage] = "PASS";
        stage = "application-build";
        await command("npm", ["run", "build"]);
        report.setup[stage] = "PASS";
        stage = "application-revision";
        app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1"], {
          env, stdio: "ignore",
        });
        app.once("error", () => { appFailed = true; });
        await assertLocalRevision(env);
        if (appFailed || app.exitCode !== null) throw new Error("Local child process did not serve this build");
        report.setup[stage] = "PASS";
      },
      run: async () => {
        stage = "browser";
        const journey = join(project, "journey.json");
        try {
          await command(process.execPath, ["node_modules/@playwright/test/cli.js", "test",
            "tests/acceptance/trusted-local-scholar.spec.ts", "--project=chromium", "--reporter=line", "--trace=off"],
          { env: { ...env, PBOS_QA_JOURNEY_FILE: journey } });
          report.setup[stage] = "PASS";
        } finally {
          const result = await readFile(journey, "utf8").then(JSON.parse).catch(() => ({}));
          for (const step of journeyStages) {
            const entry = result[step];
            if (entry && ["PASS", "FAIL", "BLOCKED", "NOT TESTED"].includes(entry.status)) report.steps[step] = entry;
          }
        }
      },
      stop: async () => {
        if (app?.pid && app.exitCode === null && app.signalCode === null) {
          const exited = new Promise(resolveExit => app.once("exit", resolveExit));
          app.kill("SIGTERM");
          await Promise.race([exited, delay(5000)]);
          if (app.exitCode === null && app.signalCode === null) {
            app.kill("SIGKILL");
            await exited;
          }
        }
        if (stackAttempted) {
          try {
            await command("supabase", ["stop", "--no-backup"], { cwd: project });
            report.setup.teardown = "PASS";
          } catch {
            report.setup.teardown = "FAIL";
            process.exitCode = 1;
          }
        }
      },
    });
  } catch {
    report.setup[stage] = stage === "browser" ? "FAIL" : "BLOCKED";
    process.exitCode = 1;
  } finally {
    await writeFile(artifact, JSON.stringify(report, null, 2) + "\n");
    console.log(JSON.stringify({ commit: report.commit, setup: report.setup,
      steps: Object.fromEntries(Object.entries(report.steps).map(([key, value]) => [key, value.status])) }));
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) await main();
