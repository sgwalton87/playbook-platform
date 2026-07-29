import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { Artifacts, Runtime } from "../../kernel";
import {
  decodeVolumeCertificationArtifact,
  decodeVolumePromotionArtifact,
} from "../../runtime/artifact-decoders";
import { discoverConstitutionalVolume } from "../discovery";
import type {
  ConstitutionalVolumeLifecycle,
} from "../types";
import { validateVolumePromotionHistory } from "./history";
import { transitionConstitutionalVolume } from "./transition";
import type {
  VolumePromotionArtifact,
  VolumePromotionRecord,
} from "./types";
import { validateVolumePromotion } from "./validator";

function renderPromotionReport(record: VolumePromotionRecord): string {
  const blockers = record.blockingConditions.length
    ? record.blockingConditions.map((item) => `- ${item}`).join("\n")
    : "- None";
  return `# PBOS Constitutional Volume Promotion Report

## Volume

${record.volumeId}

## Transition

\`${record.from}\` → \`${record.to}\`

## Approved

${record.approved ? "YES" : "NO"}

## Reason

${record.reason}

## Evidence

${record.evidence.map((item) => `- \`${item}\``).join("\n")}

## Blocking Conditions

${blockers}

## Identity

- Promotion ID: \`${record.promotionId}\`
- Content digest before: \`${record.contentDigestBefore}\`
- Content digest after: ${
    record.contentDigestAfter
      ? `\`${record.contentDigestAfter}\``
      : "Not applicable"
  }
- Timestamp: ${record.timestamp}
`;
}

function savePromotionRecord(
  rootDir: string,
  existing: VolumePromotionArtifact | null,
  record: VolumePromotionRecord
): void {
  const artifact: VolumePromotionArtifact = {
    schemaVersion: 1,
    owner: "volume-promotion",
    latest: record,
    history: [...(existing?.history ?? []), record],
  };
  Runtime.save(
    path.join(rootDir, Artifacts.volumePromotion),
    artifact,
    "volume-promotion"
  );
  const reportDirectory = path.join(rootDir, "docs/release-evidence");
  mkdirSync(reportDirectory, { recursive: true });
  writeFileSync(
    path.join(
      reportDirectory,
      `volume-${record.volume}-promotion.md`
    ),
    renderPromotionReport(record),
    "utf8"
  );
}

export function promoteConstitutionalVolume(
  requestedVolume: number,
  target: ConstitutionalVolumeLifecycle,
  rootDir = process.cwd(),
  timestamp = new Date().toISOString()
): VolumePromotionRecord {
  const volume = discoverConstitutionalVolume(
    requestedVolume,
    rootDir
  );
  const certificationPath = path.join(
    rootDir,
    Artifacts.volumeCertification
  );
  const promotionPath = path.join(
    rootDir,
    Artifacts.volumePromotion
  );
  const certificationArtifact = Runtime.exists(certificationPath)
    ? decodeVolumeCertificationArtifact(Runtime.load(certificationPath))
    : null;
  const promotionArtifact = Runtime.exists(promotionPath)
    ? decodeVolumePromotionArtifact(Runtime.load(promotionPath))
    : null;
  if (promotionArtifact) {
    validateVolumePromotionHistory(promotionArtifact);
  }

  const validation = validateVolumePromotion({
    rootDir,
    volume,
    target,
    certificationArtifact,
    promotionArtifact,
  });
  const baseRecord = {
    promotionId: `${volume.id}:${volume.lifecycle}:${target}:${volume.contentDigest}:${timestamp}`,
    volume: volume.number,
    volumeId: volume.id,
    from: volume.lifecycle,
    to: target,
    evidence: validation.evidence,
    certificationRunId:
      validation.certification?.runId ?? null,
    contentDigestBefore: volume.contentDigest,
    timestamp,
  };

  if (!validation.approved) {
    const denied: VolumePromotionRecord = {
      ...baseRecord,
      approved: false,
      contentDigestAfter: null,
      blockingConditions: validation.blockingConditions,
      reason:
        "Promotion denied because one or more governed prerequisites failed.",
    };
    savePromotionRecord(
      rootDir,
      promotionArtifact,
      denied
    );
    return denied;
  }

  const mutation = transitionConstitutionalVolume(
    rootDir,
    volume,
    target
  );
  try {
    const transitioned = discoverConstitutionalVolume(
      requestedVolume,
      rootDir
    );
    if (transitioned.lifecycle !== target) {
      throw new Error(
        "Lifecycle transition did not produce the requested state."
      );
    }
    const approved: VolumePromotionRecord = {
      ...baseRecord,
      approved: true,
      contentDigestAfter: transitioned.contentDigest,
      blockingConditions: [],
      reason:
        "Promotion approved from current certification evidence and applied through the governed lifecycle transition.",
    };
    savePromotionRecord(
      rootDir,
      promotionArtifact,
      approved
    );
    return approved;
  } catch (error) {
    mutation.rollback();
    throw error;
  }
}
