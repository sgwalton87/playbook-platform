import { createHash } from "node:crypto";
import type {
  ConstitutionalDocumentMetadata,
  ConstitutionalVolumeLifecycle,
} from "./types";
import { constitutionalVolumeLifecycles } from "./types";

function scalar(value: string): string {
  return value.trim().replace(/^["']|["']$/g, "");
}

function list(value: string): string[] {
  const normalized = value.trim();
  if (!normalized) {
    return [];
  }
  if (normalized.startsWith("[") && normalized.endsWith("]")) {
    return normalized
      .slice(1, -1)
      .split(",")
      .map(scalar)
      .filter(Boolean);
  }
  return [scalar(normalized)];
}

export function parseConstitutionalMetadata(
  content: string
): ConstitutionalDocumentMetadata {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const values = new Map<string, string[]>();
  if (!match) {
    return {
      id: null,
      title: null,
      status: null,
      parent: [],
      dependsOn: [],
      related: [],
    };
  }

  let currentKey: string | null = null;
  for (const line of match[1].split(/\r?\n/)) {
    const property = line.match(/^([a-zA-Z_][\w-]*):\s*(.*)$/);
    if (property) {
      currentKey = property[1];
      values.set(currentKey, list(property[2]));
      continue;
    }
    const item = line.match(/^\s+-\s+(.+)$/);
    if (item && currentKey) {
      values.set(currentKey, [
        ...(values.get(currentKey) ?? []),
        scalar(item[1]),
      ]);
    }
  }

  const first = (key: string) => values.get(key)?.[0] ?? null;
  return {
    id: first("id"),
    title: first("title"),
    status: first("status"),
    parent: values.get("parent") ?? [],
    dependsOn:
      values.get("depends_on") ?? values.get("dependencies") ?? [],
    related:
      values.get("related") ?? values.get("related_documents") ?? [],
  };
}

export function normalizeVolumeLifecycle(
  status: string | null
): ConstitutionalVolumeLifecycle | null {
  if (!status) {
    return null;
  }
  const normalized = status
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
  if (
    normalized === "draft_constitutional" ||
    normalized === "draft_volume"
  ) {
    return "draft";
  }
  if (
    constitutionalVolumeLifecycles.includes(
      normalized as ConstitutionalVolumeLifecycle
    )
  ) {
    return normalized as ConstitutionalVolumeLifecycle;
  }
  return null;
}

export function digestContent(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}
