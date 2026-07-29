import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import type {
  BuildReleaseContractOptions,
  ReleaseContract,
  ValidationAdapter,
  ValidationEvidence,
} from "./contracts";
import { evaluateReleaseEvidence } from "./evaluate";

const DEFAULT_VERSION = "1.0.0";
const DEFAULT_REPORTS_DIRECTORY = "pbos/reports";

async function executeAdapter(
  adapter: ValidationAdapter
): Promise<ValidationEvidence> {
  const startedAt = Date.now();
  const executedAt = new Date().toISOString();

  try {
    const result = await adapter.run();

    return {
      ...result,
      id: adapter.id,
      name: adapter.name,
      executedAt: result.executedAt || executedAt,
      durationMs:
        Number.isFinite(result.durationMs) && result.durationMs >= 0
          ? result.durationMs
          : Date.now() - startedAt,
      evidence: Array.isArray(result.evidence)
        ? result.evidence
        : [],
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Validation adapter failed with an unknown error.";

    return {
      id: adapter.id,
      name: adapter.name,
      status: "FAIL",
      executedAt,
      durationMs: Date.now() - startedAt,
      summary: `${adapter.name} could not complete.`,
      evidence: [message],
    };
  }
}

function renderMarkdown(contract: ReleaseContract): string {
  const lines: string[] = [
    "# PBOS Release Contract",
    "",
    `- Version: ${contract.version}`,
    `- Gate: ${contract.gateId ?? "none"}`,
    `- Generated: ${contract.generatedAt}`,
    `- Overall status: ${contract.overallStatus}`,
    `- Promotion ready: ${contract.promotionReady ? "yes" : "no"}`,
    "",
    "## Validation Evidence",
    "",
  ];

  if (contract.evidence.length === 0) {
    lines.push("No validation evidence was produced.", "");
  }

  for (const item of contract.evidence) {
    lines.push(
      `### ${item.name}`,
      "",
      `- ID: ${item.id}`,
      `- Status: ${item.status}`,
      `- Executed: ${item.executedAt}`,
      `- Duration: ${item.durationMs} ms`,
      `- Summary: ${item.summary}`,
      "",
      "Evidence:",
      ""
    );

    if (item.evidence.length === 0) {
      lines.push("- No additional evidence supplied.");
    } else {
      for (const evidenceLine of item.evidence) {
        lines.push(`- ${evidenceLine}`);
      }
    }

    lines.push("");
  }

  if (contract.failedEvidenceIds.length > 0) {
    lines.push(
      "## Failed Contracts",
      "",
      ...contract.failedEvidenceIds.map((id) => `- ${id}`),
      ""
    );
  }

  if (contract.pendingEvidenceIds.length > 0) {
    lines.push(
      "## Pending Contracts",
      "",
      ...contract.pendingEvidenceIds.map((id) => `- ${id}`),
      ""
    );
  }

  return `${lines.join("\n")}\n`;
}

export async function persistReleaseContract(
  contract: ReleaseContract,
  reportsDirectory: string
): Promise<void> {
  const absoluteDirectory = path.resolve(
    process.cwd(),
    reportsDirectory
  );

  await mkdir(absoluteDirectory, {
    recursive: true,
  });

  await Promise.all([
    writeFile(
      path.join(absoluteDirectory, "release-contract.json"),
      `${JSON.stringify(contract, null, 2)}\n`,
      "utf8"
    ),
    writeFile(
      path.join(absoluteDirectory, "release-contract.md"),
      renderMarkdown(contract),
      "utf8"
    ),
  ]);
}

export async function buildReleaseContract(
  options: BuildReleaseContractOptions
): Promise<ReleaseContract> {
  const evidence: ValidationEvidence[] = [];

  /*
   * Execute sequentially so evidence ordering remains deterministic and
   * resource-heavy adapters such as lint and build do not compete.
   */
  for (const adapter of options.adapters) {
    evidence.push(await executeAdapter(adapter));
  }

  const evaluation = evaluateReleaseEvidence(evidence);

  const contract: ReleaseContract = {
    version: options.version ?? DEFAULT_VERSION,
    gateId: options.gateId ?? null,
    generatedAt: new Date().toISOString(),
    overallStatus: evaluation.status,
    promotionReady: evaluation.promotionReady,
    evidence,
    failedEvidenceIds: evaluation.failedEvidenceIds,
    pendingEvidenceIds: evaluation.pendingEvidenceIds,
  };

  if (options.persist !== false) {
    await persistReleaseContract(
      contract,
      options.reportsDirectory ??
        DEFAULT_REPORTS_DIRECTORY
    );
  }

  return contract;
}
