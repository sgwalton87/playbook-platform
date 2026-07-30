import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { artifactDigest } from "../../kernel/identity";
import type {
  ChangeApprovalStatus,
  ChangeInventory,
  ChangeInventoryItem,
  ChangeRisk,
  ChangeType,
} from "./types";

function git(rootDir: string, args: readonly string[]): string {
  return execFileSync("git", args, { cwd: rootDir, encoding: "utf8" }).trim();
}

function classify(file: string): {
  owner: string;
  domain: string;
  risk: ChangeRisk;
  status: ChangeApprovalStatus;
} {
  if (file.startsWith("pbos/kernel/") || file.startsWith("docs/CONSTITUTION/")) {
    return { owner: "PBOS Constitutional Governance", domain: "governance", risk: "RED", status: "REVIEW_REQUIRED" };
  }
  if (file.startsWith("pbos/")) {
    return { owner: "PBOS Engineering", domain: "control-plane", risk: "YELLOW", status: "REVIEW_REQUIRED" };
  }
  if (file.startsWith("app/") || file.startsWith("supabase/")) {
    return { owner: "Playbook Product Engineering", domain: "product", risk: "YELLOW", status: "REVIEW_REQUIRED" };
  }
  if (file.startsWith("docs/")) {
    return { owner: "Playbook OS Engineering", domain: "documentation", risk: "GREEN", status: "APPROVED_CANDIDATE" };
  }
  return { owner: "Playbook Platform Engineering", domain: "repository", risk: "YELLOW", status: "REVIEW_REQUIRED" };
}

function changeType(code: string): ChangeType {
  if (code.includes("R")) return "RENAMED";
  if (code.includes("D")) return "DELETED";
  if (code === "??" || code.includes("A")) return "ADDED";
  return "MODIFIED";
}

export function createChangeInventory(
  rootDir = process.cwd(),
  timestamp = new Date().toISOString()
): ChangeInventory {
  const raw = execFileSync(
    "git",
    ["status", "--porcelain=v1", "--untracked-files=all", "-z"],
    {
    cwd: rootDir,
    encoding: "utf8",
    }
  );
  const entries = raw.split("\0").filter(Boolean);
  const changes: ChangeInventoryItem[] = [];
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index] as string;
    const code = entry.slice(0, 2);
    let file = entry.slice(3);
    if (code.includes("R") && entries[index + 1]) {
      file = entries[index + 1] as string;
      index += 1;
    }
    const normalized = file.replaceAll("\\", "/");
    const classification = classify(normalized);
    const absolute = path.join(rootDir, normalized);
    changes.push({
      file_path: normalized,
      change_type: changeType(code),
      owner: classification.owner,
      domain: classification.domain,
      risk_level: classification.risk,
      dependency: "repository-context",
      approval_status: classification.status,
      content_digest: existsSync(absolute)
        ? artifactDigest(readFileSync(absolute))
        : "DELETED",
    });
  }
  changes.sort((left, right) => left.file_path.localeCompare(right.file_path));
  const repositoryIdentity = path.basename(git(rootDir, ["rev-parse", "--show-toplevel"]));
  const commitIdentity = git(rootDir, ["rev-parse", "HEAD"]);
  const branchIdentity = git(rootDir, ["branch", "--show-current"]);
  const body = {
    inventory_id: `CHANGE-INVENTORY-${artifactDigest(changes).slice(0, 16)}`,
    repository_identity: repositoryIdentity,
    commit_identity: commitIdentity,
    branch_identity: branchIdentity,
    content_identity: artifactDigest({
      repositoryIdentity,
      commitIdentity,
      branchIdentity,
      changes,
    }),
    changes,
    timestamp,
  };
  return { ...body, digest: artifactDigest(body) };
}
