import { exec } from "child_process";
import { promisify } from "util";

const run = promisify(exec);

async function execute(command) {
  try {
    await run(command);

    return {
      command,
      passed: true,
      exitCode: 0
    };

  } catch (err) {

    return {
      command,
      passed: false,
      exitCode: err.code ?? 1,
      output: err.stdout ?? "",
      error: err.stderr ?? err.message
    };
  }
}

export async function verifyRepository() {

  const lint = await execute("npm run lint");

  const typescript = await execute("npx tsc --noEmit");

  const build = await execute("npm run build");

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
