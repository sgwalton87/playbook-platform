import { spawn } from "node:child_process";

export interface CommandExecutionResult {
  success: boolean;
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
}

export interface RunCommandOptions {
  cwd?: string;
  timeoutMs?: number;
  env?: NodeJS.ProcessEnv;
}

const DEFAULT_TIMEOUT = 300000;

export async function runCommand(
  command: string,
  args: readonly string[] = [],
  options: RunCommandOptions = {}
): Promise<CommandExecutionResult> {
  const started = Date.now();

  return await new Promise((resolve) => {
    const child = spawn(command, [...args], {
      cwd: options.cwd ?? process.cwd(),
      env: {
        ...process.env,
        ...options.env,
      },
      shell: false,
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    const timeout = setTimeout(() => {
      child.kill("SIGTERM");
    }, options.timeoutMs ?? DEFAULT_TIMEOUT);

    child.on("close", (code) => {
      clearTimeout(timeout);

      resolve({
        success: code === 0,
        exitCode: code ?? -1,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        durationMs: Date.now() - started,
      });
    });

    child.on("error", (error) => {
      clearTimeout(timeout);

      resolve({
        success: false,
        exitCode: -1,
        stdout,
        stderr: error.message,
        durationMs: Date.now() - started,
      });
    });
  });
}

export async function runNpmScript(
  script: string,
  options?: RunCommandOptions
): Promise<CommandExecutionResult> {
  return runCommand(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["run", script],
    options
  );
}

export async function runTypeScript(
  options?: RunCommandOptions
): Promise<CommandExecutionResult> {
  return runCommand(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["tsc", "--noEmit"],
    options
  );
}
