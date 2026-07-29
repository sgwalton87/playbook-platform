import type {
  VolumePromotionArtifact,
  VolumePromotionRecord,
} from "./types";

export function validateVolumePromotionHistory(
  artifact: VolumePromotionArtifact
): void {
  if (
    artifact.schemaVersion !== 1 ||
    artifact.owner !== "volume-promotion" ||
    !Array.isArray(artifact.history)
  ) {
    throw new Error(
      "Volume promotion history is invalid; lifecycle ownership cannot be proven."
    );
  }
  if (
    artifact.history.length > 0 &&
    artifact.latest.promotionId !==
      artifact.history[artifact.history.length - 1].promotionId
  ) {
    throw new Error(
      "Volume promotion history is invalid; latest record does not match history."
    );
  }

  const lastApproved = new Map<number, VolumePromotionRecord>();
  for (const record of artifact.history) {
    if (!record.approved) {
      continue;
    }
    const previous = lastApproved.get(record.volume);
    if (previous && previous.to !== record.from) {
      throw new Error(
        `Volume ${record.volume} promotion history is discontinuous: ${previous.to} -> ${record.from}.`
      );
    }
    lastApproved.set(record.volume, record);
  }
}

export function latestApprovedVolumePromotion(
  artifact: VolumePromotionArtifact | null,
  volume: number
): VolumePromotionRecord | null {
  if (!artifact) {
    return null;
  }
  return (
    [...artifact.history]
      .reverse()
      .find(
        (record) => record.volume === volume && record.approved
      ) ?? null
  );
}
