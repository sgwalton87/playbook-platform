import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import path from "node:path";
import {
  digestContent,
  normalizeVolumeLifecycle,
  parseConstitutionalMetadata,
} from "./metadata";
import type {
  ConstitutionalDocument,
  ConstitutionalVolume,
} from "./types";

function walkMarkdown(directory: string): string[] {
  if (!existsSync(directory)) {
    return [];
  }
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return walkMarkdown(entryPath);
      }
      return entry.isFile() && entry.name.endsWith(".md")
        ? [entryPath]
        : [];
    })
    .sort();
}

function loadDocument(
  rootDir: string,
  documentPath: string
): ConstitutionalDocument {
  const content = readFileSync(documentPath, "utf8");
  return {
    path: path.relative(rootDir, documentPath).replaceAll("\\", "/"),
    content,
    digest: digestContent(content),
    metadata: parseConstitutionalMetadata(content),
  };
}

function volumeNumber(directoryName: string): number | null {
  const match =
    directoryName.match(/^VOLUME_(\d+)_/) ??
    directoryName.match(/^(\d{2})_/);
  return match ? Number.parseInt(match[1], 10) : null;
}

export function discoverConstitutionalVolumeDirectories(
  rootDir = process.cwd()
): Map<number, string[]> {
  const roots = [
    path.join(rootDir, "docs/CONSTITUTION"),
    path.join(rootDir, "docs/PPS"),
  ];
  const discovered = new Map<number, string[]>();
  for (const sourceRoot of roots) {
    if (!existsSync(sourceRoot)) {
      continue;
    }
    for (const entry of readdirSync(sourceRoot, {
      withFileTypes: true,
    })) {
      if (!entry.isDirectory()) {
        continue;
      }
      const number = volumeNumber(entry.name);
      if (number === null) {
        continue;
      }
      discovered.set(number, [
        ...(discovered.get(number) ?? []),
        path.join(sourceRoot, entry.name),
      ]);
    }
  }
  return discovered;
}

export function discoverConstitutionalVolume(
  requestedVolume: number,
  rootDir = process.cwd()
): ConstitutionalVolume {
  if (!Number.isInteger(requestedVolume) || requestedVolume < 0) {
    throw new Error(`Invalid constitutional volume: ${requestedVolume}.`);
  }
  const candidates =
    discoverConstitutionalVolumeDirectories(rootDir).get(requestedVolume) ??
    [];
  if (candidates.length === 0) {
    throw new Error(
      `Constitutional volume ${requestedVolume} was not found.`
    );
  }

  const discoveryErrors: string[] = [];
  if (candidates.length > 1) {
    discoveryErrors.push(
      `Volume ${requestedVolume} has multiple candidate directories: ${candidates
        .map((candidate) => path.relative(rootDir, candidate))
        .join(", ")}.`
    );
  }
  const directory = candidates[0];
  const documents = walkMarkdown(directory).map((documentPath) =>
    loadDocument(rootDir, documentPath)
  );
  const authorityId = `PPS-${requestedVolume}00`;
  const authority =
    documents.find(({ metadata }) => metadata.id === authorityId) ?? null;
  const readme =
    documents.find(
      ({ path: documentPath }) =>
        path.basename(documentPath).toLowerCase() === "readme.md"
    ) ?? null;
  const lifecycleSource =
    authority?.metadata.status ?? readme?.metadata.status ?? null;
  const normalizedLifecycle =
    normalizeVolumeLifecycle(lifecycleSource);
  if (!normalizedLifecycle) {
    discoveryErrors.push(
      lifecycleSource
        ? `Undocumented constitutional lifecycle state: ${lifecycleSource}.`
        : "Constitutional lifecycle status is missing."
    );
  }
  if (documents.some(({ path: documentPath }) => statSync(
    path.join(rootDir, documentPath)
  ).size === 0)) {
    discoveryErrors.push("The volume contains one or more empty documents.");
  }

  const digestInput = documents
    .map(({ path: documentPath, digest }) => `${documentPath}:${digest}`)
    .join("\n");
  return {
    number: requestedVolume,
    id: `VOLUME-${requestedVolume}`,
    directory: path.relative(rootDir, directory).replaceAll("\\", "/"),
    lifecycle: normalizedLifecycle ?? "blocked",
    lifecycleSource,
    authorityId,
    authority,
    readme,
    documents,
    contentDigest: digestContent(digestInput),
    discoveryErrors,
  };
}

export function buildConstitutionalDocumentIndex(
  rootDir = process.cwd()
): Map<string, string[]> {
  const index = new Map<string, string[]>();
  for (const documentPath of walkMarkdown(path.join(rootDir, "docs"))) {
    const content = readFileSync(documentPath, "utf8");
    const id = parseConstitutionalMetadata(content).id;
    if (!id) {
      continue;
    }
    index.set(id, [
      ...(index.get(id) ?? []),
      path.relative(rootDir, documentPath).replaceAll("\\", "/"),
    ]);
  }
  return index;
}
