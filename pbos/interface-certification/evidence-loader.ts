import { createHash } from "node:crypto";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
} from "node:fs";
import path from "node:path";
import type { ConstitutionalVolume } from "../constitution";
import type {
  InterfaceCertificationEvidencePackage,
  LoadedInterfaceEvidence,
} from "./types";

const IMPLEMENTATION_ROOTS = [
  "app",
  "components",
  "lib/design-system",
  "lib/navigation",
  "styles",
];

function implementationFiles(rootDir: string): string[] {
  const walk = (directory: string): string[] => {
    if (!existsSync(directory)) {
      return [];
    }
    return readdirSync(directory, { withFileTypes: true })
      .flatMap((entry) => {
        const entryPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          return walk(entryPath);
        }
        return entry.isFile() &&
          /\.(css|json|ts|tsx)$/.test(entry.name)
          ? [entryPath]
          : [];
      });
  };
  return IMPLEMENTATION_ROOTS.flatMap((relativePath) =>
    walk(path.join(rootDir, relativePath))
  ).sort();
}

export function computeInterfaceImplementationDigest(
  rootDir = process.cwd()
): string {
  const hash = createHash("sha256");
  for (const filePath of implementationFiles(rootDir)) {
    hash.update(path.relative(rootDir, filePath).replaceAll("\\", "/"));
    hash.update("\0");
    hash.update(readFileSync(filePath));
    hash.update("\0");
  }
  return hash.digest("hex");
}

export function loadInterfaceEvidence(
  volume: ConstitutionalVolume,
  rootDir = process.cwd()
): LoadedInterfaceEvidence {
  const relativePath = `docs/release-evidence/volume-${volume.number}-interface-evidence.json`;
  const evidencePath = path.join(rootDir, relativePath);
  const implementationDigest =
    computeInterfaceImplementationDigest(rootDir);
  if (!existsSync(evidencePath)) {
    return {
      path: relativePath,
      evidencePackage: null,
      volumeDigest: volume.contentDigest,
      implementationDigest,
      blockingConditions: [
        `Interface certification evidence package is missing: ${relativePath}.`,
      ],
    };
  }
  let evidencePackage: InterfaceCertificationEvidencePackage;
  try {
    evidencePackage = JSON.parse(
      readFileSync(evidencePath, "utf8")
    ) as InterfaceCertificationEvidencePackage;
  } catch {
    return {
      path: relativePath,
      evidencePackage: null,
      volumeDigest: volume.contentDigest,
      implementationDigest,
      blockingConditions: [
        `Interface certification evidence package is invalid JSON: ${relativePath}.`,
      ],
    };
  }
  const blockers: string[] = [];
  if (evidencePackage.schemaVersion !== 1) {
    blockers.push("Interface evidence schemaVersion must be 1.");
  }
  if (evidencePackage.volume !== volume.id) {
    blockers.push("Interface evidence volume identity does not match.");
  }
  if (evidencePackage.volumeDigest !== volume.contentDigest) {
    blockers.push("Interface evidence Volume 34 digest does not match.");
  }
  if (!evidencePackage.implementation?.trim()) {
    blockers.push("Interface implementation identity is missing.");
  }
  if (
    evidencePackage.implementationDigest !== implementationDigest
  ) {
    blockers.push("Interface implementation digest does not match.");
  }
  if (
    !evidencePackage.validator?.id?.trim() ||
    !evidencePackage.validator?.version?.trim()
  ) {
    blockers.push("Interface validator identity is missing.");
  }
  if (
    !evidencePackage.certificationTimestamp ||
    Number.isNaN(
      Date.parse(evidencePackage.certificationTimestamp)
    )
  ) {
    blockers.push("Interface certification timestamp is invalid.");
  }
  if (
    !evidencePackage.domains ||
    typeof evidencePackage.domains !== "object"
  ) {
    blockers.push("Interface certification domain evidence is missing.");
  }
  return {
    path: relativePath,
    evidencePackage,
    volumeDigest: volume.contentDigest,
    implementationDigest,
    blockingConditions: blockers,
  };
}

export function validateEvidenceReference(
  reference: {
    path: string;
    digest: string;
    capturedAt: string;
  },
  rootDir: string,
  evaluatedAt: string
): string[] {
  const blockers: string[] = [];
  const absolutePath = path.resolve(rootDir, reference.path);
  const relative = path.relative(rootDir, absolutePath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    return ["Interface evidence reference escapes the repository."];
  }
  if (!existsSync(absolutePath)) {
    return [`Interface evidence file is missing: ${reference.path}.`];
  }
  const actualDigest = createHash("sha256")
    .update(readFileSync(absolutePath))
    .digest("hex");
  if (actualDigest !== reference.digest) {
    blockers.push(
      `Interface evidence digest does not match: ${reference.path}.`
    );
  }
  const captured = Date.parse(reference.capturedAt);
  const evaluated = Date.parse(evaluatedAt);
  if (Number.isNaN(captured) || captured > evaluated) {
    blockers.push(
      `Interface evidence timestamp is invalid: ${reference.path}.`
    );
  } else {
    const ageDays = (evaluated - captured) / 86_400_000;
    if (ageDays > 30) {
      blockers.push(
        `Interface evidence is stale: ${reference.path}.`
      );
    }
  }
  if (statSync(absolutePath).size === 0) {
    blockers.push(
      `Interface evidence file is empty: ${reference.path}.`
    );
  }
  return blockers;
}
