import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  computeInterfaceImplementationDigest,
  validateInterfaceCertificationHistory,
  type InterfaceCertificationArtifact,
} from "../../interface-certification";
import { Artifacts, Runtime } from "../../kernel";
import { isConstitutionalLifecycleTransitionAllowed } from "../lifecycle";
import type {
  CertificationRuleId,
  ConstitutionalVolumeLifecycle,
} from "../types";
import { latestApprovedVolumePromotion } from "./history";
import type {
  VolumePromotionContext,
  VolumePromotionValidation,
} from "./types";

const governanceRuleIds: CertificationRuleId[] = [
  "INT-001",
  "INT-002",
  "INT-003",
  "INT-004",
  "INT-005",
  "INT-006",
  "INT-007",
  "INT-008",
  "INT-009",
];

function readJsonEvidence(
  evidencePath: string
): Record<string, unknown> | null {
  if (!existsSync(evidencePath)) {
    return null;
  }
  try {
    return JSON.parse(
      readFileSync(evidencePath, "utf8")
    ) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function validateImplementationPlan(
  rootDir: string,
  volume: number,
  contentDigest: string
): string[] {
  const relativePath = `docs/release-evidence/volume-${volume}-implementation-readiness.md`;
  const planPath = path.join(rootDir, relativePath);
  if (!existsSync(planPath)) {
    return [`Implementation plan is missing: ${relativePath}.`];
  }
  const content = readFileSync(planPath, "utf8");
  const required = [
    `VOLUME-${volume}`,
    contentDigest,
    "Implementation Dependencies",
    "Implementation Strategy",
    "Engineering Readiness",
    "PBOS Lifecycle Evidence",
  ];
  return required
    .filter((value) => !content.includes(value))
    .map(
      (value) =>
        `Implementation plan does not contain required evidence: ${value}.`
    );
}

function validateJsonEvidence(
  rootDir: string,
  relativePath: string,
  volume: number,
  contentDigest: string,
  requiredFlag: "validationComplete" | "approved"
): string[] {
  const evidence = readJsonEvidence(path.join(rootDir, relativePath));
  if (!evidence) {
    return [`Required evidence is missing or invalid: ${relativePath}.`];
  }
  const blockers: string[] = [];
  if (
    evidence.volume !== volume &&
    evidence.volume !== `VOLUME-${volume}` &&
    evidence.volume !== String(volume)
  ) {
    blockers.push(`${relativePath} volume identity does not match.`);
  }
  if (evidence.contentDigest !== contentDigest) {
    blockers.push(`${relativePath} content digest does not match.`);
  }
  if (evidence[requiredFlag] !== true) {
    blockers.push(`${relativePath} does not set ${requiredFlag}=true.`);
  }
  return blockers;
}

export function validateVolumePromotion(
  context: VolumePromotionContext
): VolumePromotionValidation {
  const {
    rootDir,
    volume,
    target,
    certificationArtifact,
    promotionArtifact,
  } = context;
  const evidence = ["pbos/runtime/volume-certification.json"];
  const blockingConditions: string[] = [];
  const certification = certificationArtifact?.latest ?? null;

  if (
    !isConstitutionalLifecycleTransitionAllowed(
      volume.lifecycle,
      target
    )
  ) {
    blockingConditions.push(
      `Skipped or invalid lifecycle transition: ${volume.lifecycle} -> ${target}.`
    );
  }

  const previous = latestApprovedVolumePromotion(
    promotionArtifact,
    volume.number
  );
  if (previous && previous.to !== volume.lifecycle) {
    blockingConditions.push(
      `Lifecycle mutation detected: documents report ${volume.lifecycle}, but promotion history reports ${previous.to}.`
    );
  }
  if (!previous && volume.lifecycle !== "draft") {
    blockingConditions.push(
      `Lifecycle ${volume.lifecycle} has no governed promotion history.`
    );
  }

  if (!certification) {
    blockingConditions.push("Certification evidence is missing.");
  } else {
    if (
      certification.volume !== volume.number ||
      certification.volumeId !== volume.id
    ) {
      blockingConditions.push(
        "Certification volume identity does not match."
      );
    }
    if (certification.lifecycle !== volume.lifecycle) {
      blockingConditions.push(
        "Certification lifecycle does not match the current volume."
      );
    }
    if (certification.contentDigest !== volume.contentDigest) {
      blockingConditions.push(
        "Certification content digest is stale."
      );
    }
    if (certification.certificationScore < 90) {
      blockingConditions.push(
        "Certification score is below the required threshold of 90."
      );
    }
    for (const ruleId of governanceRuleIds) {
      const rule = certification.rules.find(({ id }) => id === ruleId);
      if (!rule?.passed) {
        blockingConditions.push(
          `Critical certification rule ${ruleId} is not PASS.`
        );
      }
    }
  }

  if (
    volume.lifecycle === "draft" &&
    target === "architecture_complete"
  ) {
    const completeness = certification?.rules.find(
      ({ id }) => id === "INT-002"
    );
    const authority = certification?.rules.find(
      ({ id }) => id === "INT-001"
    );
    if (!completeness?.passed) {
      blockingConditions.push(
        "Documentation completeness evidence is not PASS."
      );
    }
    if (!authority?.passed) {
      blockingConditions.push(
        "Authority validation evidence is not PASS."
      );
    }
  }

  if (
    volume.lifecycle === "architecture_complete" &&
    target === "implementation_ready"
  ) {
    evidence.push(
      `docs/release-evidence/volume-${volume.number}-implementation-readiness.md`
    );
    blockingConditions.push(
      ...validateImplementationPlan(
        rootDir,
        volume.number,
        volume.contentDigest
      )
    );
  }

  if (
    volume.lifecycle === "implementation_ready" &&
    target === "certified"
  ) {
    evidence.push(Artifacts.interfaceCertification);
    const interfacePath = path.join(
      rootDir,
      Artifacts.interfaceCertification
    );
    if (!Runtime.exists(interfacePath)) {
      blockingConditions.push(
        "Interface certification runtime artifact is missing."
      );
    } else {
      const interfaceCertification =
        Runtime.load<InterfaceCertificationArtifact>(interfacePath);
      validateInterfaceCertificationHistory(interfaceCertification);
      if (
        interfaceCertification.volume !== volume.id ||
        interfaceCertification.volumeDigest !== volume.contentDigest
      ) {
        blockingConditions.push(
          "Interface certification volume identity does not match."
        );
      }
      if (
        interfaceCertification.digest !==
        computeInterfaceImplementationDigest(rootDir)
      ) {
        blockingConditions.push(
          "Interface certification implementation digest is stale."
        );
      }
      if (
        interfaceCertification.validationComplete !== true ||
        interfaceCertification.status !== "passed" ||
        interfaceCertification.score !== 100
      ) {
        blockingConditions.push(
          ...interfaceCertification.blockingConditions,
          "Interface certification is not complete."
        );
      }
      if (!interfaceCertification.validator?.id) {
        blockingConditions.push(
          "Interface certification validator identity is missing."
        );
      }
      const age =
        Date.parse(new Date().toISOString()) -
        Date.parse(interfaceCertification.certificationTimestamp);
      if (
        Number.isNaN(age) ||
        age < 0 ||
        age / 86_400_000 > 30
      ) {
        blockingConditions.push(
          "Interface certification timestamp is invalid or stale."
        );
      }
    }
  }

  if (
    volume.lifecycle === "certified" &&
    target === "canonical"
  ) {
    const relativePath = `docs/release-evidence/volume-${volume.number}-canonical-approval.json`;
    evidence.push(relativePath);
    if (certification?.certificationScore !== 100) {
      blockingConditions.push(
        "Canonical promotion requires a certification score of 100."
      );
    }
    const canonicalRule = certification?.rules.find(
      ({ id }) => id === "INT-010"
    );
    if (!canonicalRule?.passed) {
      blockingConditions.push(
        "Canonical promotion readiness INT-010 is not PASS."
      );
    }
    blockingConditions.push(
      ...validateJsonEvidence(
        rootDir,
        relativePath,
        volume.number,
        volume.contentDigest,
        "approved"
      )
    );
  }

  return {
    approved: blockingConditions.length === 0,
    evidence,
    blockingConditions,
    certification,
  };
}
