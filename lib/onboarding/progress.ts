export function clampOnboardingStep(index: number, totalSteps: number): number {
  return Math.max(0, Math.min(index, Math.max(totalSteps - 1, 0)));
}

export function getOnboardingProgress(index: number, totalSteps: number): number {
  if (totalSteps <= 0) return 0;
  return Math.round(((index + 1) / totalSteps) * 100);
}
