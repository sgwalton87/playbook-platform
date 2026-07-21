import { exec } from "child_process";
import { promisify } from "util";

const run = promisify(exec);

async function execute(name, command) {
  console.log(`▶ Starting ${name}...`);

  const start = Date.now();

  try {
    await run(command);

    console.log(
      `✅ ${name} completed in ${((Date.now() - start) / 1000).toFixed(1)}s`
    );

    return {
      passed: true,
      exitCode: 0
    };

  } catch (err) {

    console.log(
      `❌ ${name} failed in ${((Date.now() - start) / 1000).toFixed(1)}s`
    );

    return {
      passed: false,
      exitCode: err.code ?? 1,
      output: err.stdout ?? "",
      error: err.stderr ?? err.message
    };
  }
}

export async function verifyRepository() {

  const lint = await execute(
    "Lint",
    "npm run lint"
  );

  const typescript = await execute(
    "TypeScript",
    "npx tsc --noEmit"
  );

  const build = await execute(
    "Build",
    "npm run build"
  );

  return {
    lint,
    typescript,
    build,
    overall:
      lint.passed &&
      typescript.passed &&
      build.passed
  };
}