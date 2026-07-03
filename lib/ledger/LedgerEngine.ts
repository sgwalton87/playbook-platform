import fs from "fs";
import path from "path";

export type LedgerType =
  | "sprint"
  | "release"
  | "milestone"
  | "architecture"
  | "innovation"
  | "decision"
  | "product"
  | "engineering"
  | "demo";

const TARGETS: Record<LedgerType, string[]> = {
  sprint: ["docs/LEDGER/PRODUCT_LOG.md", "docs/LEDGER/ENGINEERING_LOG.md"],
  release: ["docs/LEDGER/RELEASE_HISTORY.md", "CHANGELOG.md", "VERSION.md"],
  milestone: ["docs/LEDGER/MILESTONES.md", "docs/HISTORY/COMPANY_HISTORY.md"],
  architecture: ["docs/LEDGER/ARCHITECTURE_HISTORY.md", "docs/ARCHITECTURE/CURRENT_ARCHITECTURE.md"],
  innovation: ["docs/LEDGER/INNOVATION_LEDGER.md", "docs/LEDGER/PRODUCT_LOG.md"],
  decision: ["docs/ADR/ADR_LOG.md", "docs/LEDGER/DECISION_LOG.md"],
  product: ["docs/LEDGER/PRODUCT_LOG.md"],
  engineering: ["docs/LEDGER/ENGINEERING_LOG.md"],
  demo: ["docs/LEDGER/PRODUCT_LOG.md", "docs/HISTORY/COMPANY_HISTORY.md"],
};

function append(file: string, content: string) {
  fs.mkdirSync(path.dirname(file), { recursive: true });

  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, `# ${path.basename(file, ".md").replaceAll("_", " ")}\n\n`);
  }

  fs.appendFileSync(file, content);
}

export function writeLedgerEvent(type: LedgerType, message: string) {
  const date = new Date().toISOString();
  const entry = `\n## ${date}\n\n**Type:** ${type}\n\n${message}\n`;

  const targets = TARGETS[type] || ["docs/LEDGER/ENGINEERING_LOG.md"];

  for (const target of targets) {
    append(target, entry);
  }

  append(
    "docs/LEDGER/UNIFIED_LEDGER.md",
    `\n## ${date}\n\n**${type.toUpperCase()}**\n\n${message}\n\nUpdated:\n${targets.map(t => `- ${t}`).join("\n")}\n`
  );

  return { type, message, targets };
}
