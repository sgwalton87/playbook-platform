import type {
  ConstitutionalVolumeLifecycle,
  PromotionRecommendation,
} from "./types";

const allowedTransitions: Record<
  ConstitutionalVolumeLifecycle,
  readonly ConstitutionalVolumeLifecycle[]
> = {
  draft: ["architecture_complete", "blocked"],
  architecture_complete: ["implementation_ready", "blocked"],
  implementation_ready: ["certified", "blocked"],
  certified: ["canonical", "blocked"],
  canonical: ["blocked"],
  blocked: ["draft"],
};

export function isConstitutionalLifecycleTransitionAllowed(
  from: ConstitutionalVolumeLifecycle,
  to: ConstitutionalVolumeLifecycle
): boolean {
  return allowedTransitions[from].includes(to);
}

export function assertConstitutionalLifecycleTransition(
  from: ConstitutionalVolumeLifecycle,
  to: ConstitutionalVolumeLifecycle
): void {
  if (!isConstitutionalLifecycleTransitionAllowed(from, to)) {
    throw new Error(
      `Constitutional volume transition denied: ${from} -> ${to}.`
    );
  }
}

export function recommendConstitutionalPromotion(
  lifecycle: ConstitutionalVolumeLifecycle,
  governanceRulesPassed: boolean
): PromotionRecommendation {
  if (!governanceRulesPassed || lifecycle === "blocked") {
    return {
      eligible: false,
      action: "BLOCKED",
      targetLifecycle: null,
      reason:
        "Promotion is blocked until every required certification rule has explicit passing evidence.",
    };
  }
  if (lifecycle === "canonical") {
    return {
      eligible: false,
      action: "NO_ACTION",
      targetLifecycle: null,
      reason: "The volume is already canonical.",
    };
  }

  const next: Record<
    Exclude<ConstitutionalVolumeLifecycle, "blocked" | "canonical">,
    ConstitutionalVolumeLifecycle
  > = {
    draft: "architecture_complete",
    architecture_complete: "implementation_ready",
    implementation_ready: "certified",
    certified: "canonical",
  };
  const targetLifecycle = next[lifecycle];
  assertConstitutionalLifecycleTransition(lifecycle, targetLifecycle);
  return {
    eligible: true,
    action: "REVIEW_TRANSITION",
    targetLifecycle,
    reason:
      "Evidence supports human review of the next governed lifecycle transition; no transition was applied.",
  };
}
