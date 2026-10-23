import type { OnboardingField, OnboardingStep } from "./types";

export const LIST_EDITABLE_FIELD_TYPES = new Set(["college-list", "activity-list", "invite-list"]);

/** An onboarding answer remains editable unless it represents an authorization or acceptance act. */
export function getRoleEditableFields(steps: readonly OnboardingStep[]) {
  return steps.flatMap(step =>
    step.fields.filter(field => field.type !== "safety-agreement")
      .map(field => ({ ...field, phase: step.phase, stepId: step.id }))
  );
}

export function isListEditableField(field: OnboardingField) {
  return LIST_EDITABLE_FIELD_TYPES.has(field.type ?? "");
}

/** Whitespace/newlines are display separators; no emails or invitations are sent. */
export function parseListAnswers(value: string): string[] {
  return value.split(/\r?\n/).map(entry => entry.trim()).filter(Boolean);
}

export function formatListAnswers(value: unknown): string {
  return Array.isArray(value) ? value.filter(v => typeof v === "string").join("\n") : "";
}
