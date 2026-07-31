import { createInterface } from "node:readline/promises";
import type { Readable, Writable } from "node:stream";

export type FounderEvidenceInput = Readonly<Record<string, string | readonly string[]>>;
type EvidenceCommand =
  | "change-boundary"
  | "approve-boundary"
  | "approve-refresh"
  | string;

type Prompt = (label: string) => Promise<string>;
const LIST_FIELDS = new Set(["approved-files", "excluded-files"]);

function listValues(values: readonly string[]): readonly string[] {
  return [...new Set(values.flatMap((value) =>
    value.split(",").map((item) => item.trim()).filter(Boolean)
  ))].sort();
}

export function parseFounderEvidenceArguments(
  args: readonly string[]
): FounderEvidenceInput {
  const values = new Map<string, string[]>();
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index] ?? "";
    if (!argument.startsWith("--")) {
      throw new Error(`Unexpected positional argument '${argument}'.`);
    }
    const separator = argument.indexOf("=");
    const name = (separator === -1 ? argument : argument.slice(0, separator))
      .replace(/^--/, "").trim();
    const inlineValue = separator === -1 ? null : argument.slice(separator + 1);
    const nextValue = inlineValue ?? args[index + 1];
    if (!name || !nextValue || (inlineValue === null && nextValue.startsWith("--"))) {
      throw new Error(`Argument '--${name}' requires a value.`);
    }
    if (inlineValue === null) index += 1;
    values.set(name, [...(values.get(name) ?? []), nextValue]);
  }
  return Object.fromEntries([...values].map(([name, entries]) => [
    name,
    LIST_FIELDS.has(name) ? listValues(entries) : entries.at(-1) ?? "",
  ]));
}

const boundaryPrompts = [
  ["requester-identity", "Requester"],
  ["business-purpose", "Business Purpose"],
  ["technical-purpose", "Technical Purpose"],
  ["approved-files", "Approved Files (comma-separated)"],
  ["excluded-files", "Excluded Files (comma-separated)"],
  ["risk-acknowledgment", "Risk Accepted"],
  ["expiration", "Expiration (ISO 8601)"],
] as const;

const approvalPrompts = [
  ["requester-identity", "Requester"],
  ["reviewer-identity", "Reviewer"],
  ["decision", "Decision (APPROVED or REJECTED)"],
  ["reason", "Decision Reason"],
  ["risk-acknowledgment", "Risk Accepted"],
  ["expiration", "Expiration (ISO 8601)"],
] as const;

export async function collectFounderEvidenceInput(
  command: EvidenceCommand,
  initial: FounderEvidenceInput,
  prompt: Prompt,
  baselineAvailable = false
): Promise<FounderEvidenceInput> {
  if (
    command !== "change-boundary" &&
    command !== "approve-boundary" &&
    command !== "approve-refresh" &&
    command !== "approve"
  ) return initial;
  const entries = new Map(Object.entries(initial));
  if (command === "change-boundary" && baselineAvailable &&
    !entries.get("boundary-type")) {
    const selection = (await prompt(
      "PBOS BASELINE ACTIVATION DETECTED\n\nChoose boundary type:\n1. CHANGE\n2. BASELINE_ACTIVATION\n> "
    )).trim();
    entries.set(
      "boundary-type",
      selection === "2" ? "BASELINE_ACTIVATION" : selection === "1" ? "CHANGE" : selection
    );
  }
  const baselineSelected =
    entries.get("boundary-type") === "BASELINE_ACTIVATION";
  const prompts = command === "change-boundary"
    ? boundaryPrompts.filter(([name]) =>
        !baselineSelected ||
        (name !== "approved-files" && name !== "excluded-files")
      )
    : approvalPrompts;
  for (const [name, label] of prompts) {
    const existing = entries.get(name);
    if (typeof existing === "string" ? existing : existing?.length) continue;
    const answer = (await prompt(`${label}:\n> `)).trim();
    entries.set(name, LIST_FIELDS.has(name) ? listValues([answer]) : answer);
  }
  const confirmed = (await prompt("Confirm evidence submission (yes/no):\n> "))
    .trim().toLowerCase();
  if (confirmed !== "yes") throw new Error("Human evidence submission was not confirmed.");
  return Object.fromEntries(entries);
}

export async function readFounderEvidenceInput(input: {
  readonly command: EvidenceCommand;
  readonly args: readonly string[];
  readonly interactive: boolean;
  readonly baselineAvailable?: boolean;
  readonly stdin?: Readable;
  readonly stdout?: Writable;
}): Promise<FounderEvidenceInput> {
  const parsed = parseFounderEvidenceArguments(input.args);
  if (!input.interactive ||
    (input.command !== "change-boundary" &&
      input.command !== "approve-boundary" &&
      input.command !== "approve-refresh" &&
      input.command !== "approve")) {
    return parsed;
  }
  const terminal = createInterface({
    input: input.stdin ?? process.stdin,
    output: input.stdout ?? process.stdout,
  });
  try {
    (input.stdout ?? process.stdout).write("\nPBOS HUMAN AUTHORIZATION REQUIRED\n\n");
    return await collectFounderEvidenceInput(
      input.command,
      parsed,
      (label) => terminal.question(label),
      input.baselineAvailable
    );
  } finally {
    terminal.close();
  }
}

export function evidenceString(
  input: FounderEvidenceInput,
  name: string,
  fallback = ""
): string {
  const value = input[name];
  return typeof value === "string" ? value : fallback;
}

export function evidenceList(
  input: FounderEvidenceInput,
  name: string,
  fallback: string
): readonly string[] {
  const value = input[name];
  return Array.isArray(value) ? value : listValues(fallback ? [fallback] : []);
}
