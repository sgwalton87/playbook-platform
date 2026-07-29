import { writeFileSync } from "node:fs";
import path from "node:path";
import type {
  ConstitutionalVolume,
  ConstitutionalVolumeLifecycle,
} from "../types";
import { assertConstitutionalLifecycleTransition } from "../lifecycle";

export interface VolumeLifecycleMutation {
  rollback(): void;
}

export function transitionConstitutionalVolume(
  rootDir: string,
  volume: ConstitutionalVolume,
  target: ConstitutionalVolumeLifecycle
): VolumeLifecycleMutation {
  assertConstitutionalLifecycleTransition(volume.lifecycle, target);
  const originals = volume.documents.map((document) => {
    if (!document.metadata.status) {
      throw new Error(
        `Lifecycle transition denied: ${document.path} has no status.`
      );
    }
    const updated = document.content.replace(
      /^status:\s*.+$/m,
      `status: ${target}`
    );
    if (updated === document.content) {
      throw new Error(
        `Lifecycle transition denied: ${document.path} status could not be updated.`
      );
    }
    return {
      path: path.join(rootDir, document.path),
      original: document.content,
      updated,
    };
  });

  try {
    for (const document of originals) {
      writeFileSync(document.path, document.updated, "utf8");
    }
  } catch (error) {
    for (const document of originals) {
      writeFileSync(document.path, document.original, "utf8");
    }
    throw error;
  }

  return {
    rollback() {
      for (const document of originals) {
        writeFileSync(document.path, document.original, "utf8");
      }
    },
  };
}
