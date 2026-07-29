import fs from "node:fs";
import path from "node:path";
import { loadConfig } from "../engine/config";
import { loadState, saveState } from "../engine/state";
import { Artifacts, Runtime, artifactDigest } from "../kernel";
import { decodeGateCompletionArtifact } from "../runtime/artifact-decoders";
import { refreshPlanningArtifact } from "../engine/planning-refresh";
import type { GateTransition } from "./contracts";
import { transitionGate } from "./transition";

interface PromotionArtifact {
  gateId: string;
  promoted: boolean;
  gateDigest?: string;
  contractDigest?: string;
}

interface ReleaseContractArtifact {
  gateId: string | null;
  overallStatus: string;
  promotionReady: boolean;
}

export async function completePromotedGate(options: {
  requestedGateId?: string;
  rootDir?: string;
  additionalEvidence?: string[];
} = {}): Promise<GateTransition> {
  const rootDir = options.rootDir ?? process.cwd();
  const promotionPath = path.join(
    rootDir,
    "pbos/runtime/promotion.json"
  );
  const contractPath = path.join(
    rootDir,
    "docs/release-evidence/release-contract.json"
  );

  if (!fs.existsSync(promotionPath)) {
    throw new Error(
      "Completion denied: promotion artifact missing."
    );
  }

  if (!fs.existsSync(contractPath)) {
    throw new Error(
      "Completion denied: release contract missing."
    );
  }

  const promotion = JSON.parse(
    fs.readFileSync(promotionPath, "utf8")
  ) as PromotionArtifact;
  const contract = JSON.parse(
    fs.readFileSync(contractPath, "utf8")
  ) as ReleaseContractArtifact;
  const gateId = options.requestedGateId ?? promotion.gateId;

  if (!promotion.promoted) {
    throw new Error(
      "Completion denied: gate was not promoted."
    );
  }

  if (
    promotion.gateId !== gateId ||
    contract.gateId !== gateId
  ) {
    throw new Error(
      "Completion denied: gate, promotion, and release contract identities do not match."
    );
  }

  if (
    contract.overallStatus !== "PASS" ||
    contract.promotionReady !== true
  ) {
    throw new Error(
      "Completion denied: release contract is not promotion ready."
    );
  }
  const gatePath = path.join(
    rootDir,
    "pbos/gates",
    `${gateId}.json`
  );
  const gateBefore = JSON.parse(
    fs.readFileSync(gatePath, "utf8")
  ) as unknown;
  if (
    promotion.gateDigest &&
    promotion.gateDigest !== artifactDigest(gateBefore)
  ) {
    throw new Error(
      "Completion denied: promoted gate content identity does not match."
    );
  }
  if (
    promotion.contractDigest &&
    promotion.contractDigest !== artifactDigest(contract)
  ) {
    throw new Error(
      "Completion denied: promoted release contract identity does not match."
    );
  }

  const completionPath = path.join(rootDir, Artifacts.completion);
  const existing = Runtime.exists(completionPath)
    ? decodeGateCompletionArtifact(Runtime.load(completionPath))
    : null;
  if (
    existing?.history &&
    existing.history.length > 0 &&
    existing.timestamp !==
      existing.history[existing.history.length - 1].timestamp
  ) {
    throw new Error(
      "Completion denied: existing completion history is invalid."
    );
  }
  const result = transitionGate({
    gatePath,
    gateId,
    nextStatus: "complete",
    reason:
      "Gate completed after successful PBOS release validation and promotion.",
    evidence: [
      "docs/release-evidence/release-contract.json",
      "pbos/runtime/promotion.json",
      ...(options.additionalEvidence ?? []),
    ],
  });

  Runtime.save(
    completionPath,
    {
      schemaVersion: 1,
      owner: "gate-lifecycle",
      ...result,
      history: [
        ...(existing
          ? existing.history ?? [
              {
                gateId: existing.gateId,
                from: existing.from,
                to: existing.to,
                reason: existing.reason,
                evidence: existing.evidence,
                timestamp: existing.timestamp,
                contentIdentity: existing.contentIdentity,
              },
            ]
          : []),
        result,
      ],
    },
    "gate-lifecycle"
  );

  const config = await loadConfig(rootDir);
  const state = await loadState(config, "planning", rootDir);
  await saveState(
    config,
    {
      ...state,
      currentGate:
        state.currentGate === gateId ? null : state.currentGate,
    },
    rootDir
  );
  const planning = await refreshPlanningArtifact(rootDir);
  await saveState(
    config,
    {
      ...state,
      currentGate: planning.selectedGate?.id ?? null,
    },
    rootDir
  );

  return result;
}
