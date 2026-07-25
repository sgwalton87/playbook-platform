import { access, readFile } from "node:fs/promises";
import { constants } from "node:fs";
import path from "node:path";

export interface RepositoryCheckResult {
  status: "PASS" | "FAIL";
  summary: string;
  evidence: string[];
}

export interface RepositoryValidationOptions {
  root?: string;
  requiredFiles?: readonly string[];
  requiredDirectories?: readonly string[];
}

const DEFAULT_REQUIRED_FILES = [
  "package.json",
  "tsconfig.json",
  "CODEX.md",
] as const;

const DEFAULT_REQUIRED_DIRECTORIES = [
  "pbos",
  "docs",
] as const;

async function exists(target: string): Promise<boolean> {
  try {
    await access(target, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function validateFile(
  root: string,
  file: string,
  evidence: string[]
): Promise<boolean> {
  const absolute = path.resolve(root, file);

  if (!(await exists(absolute))) {
    evidence.push(`Missing required file: ${file}`);
    return false;
  }

  const contents = await readFile(absolute, "utf8");

  if (contents.trim().length === 0) {
    evidence.push(`Empty required file: ${file}`);
    return false;
  }

  evidence.push(`Verified file: ${file}`);

  return true;
}

async function validateDirectory(
  root: string,
  directory: string,
  evidence: string[]
): Promise<boolean> {
  const absolute = path.resolve(root, directory);

  if (!(await exists(absolute))) {
    evidence.push(`Missing required directory: ${directory}`);
    return false;
  }

  evidence.push(`Verified directory: ${directory}`);

  return true;
}

export async function validateRepository(
  options: RepositoryValidationOptions = {}
): Promise<RepositoryCheckResult> {
  const root = options.root ?? process.cwd();

  const requiredFiles =
    options.requiredFiles ??
    DEFAULT_REQUIRED_FILES;

  const requiredDirectories =
    options.requiredDirectories ??
    DEFAULT_REQUIRED_DIRECTORIES;

  const evidence: string[] = [];
  let passed = true;

  for (const directory of requiredDirectories) {
    const ok = await validateDirectory(
      root,
      directory,
      evidence
    );

    passed &&= ok;
  }

  for (const file of requiredFiles) {
    const ok = await validateFile(
      root,
      file,
      evidence
    );

    passed &&= ok;
  }

  return {
    status: passed ? "PASS" : "FAIL",
    summary: passed
      ? "Repository structure verified."
      : "Repository validation failed.",
    evidence,
  };
}
