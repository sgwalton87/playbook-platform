export const OPERATOR_INTENTS = [
  "RUN_IT",
  "REPAIR",
  "VERIFY",
  "BUILD",
  "RELEASE",
  "DEPLOY",
  "CERTIFY",
] as const;

export type OperatorIntent = (typeof OPERATOR_INTENTS)[number];

export function parseOperatorIntent(value = "RUN_IT"): OperatorIntent {
  const normalized = value.trim().toUpperCase().replaceAll(/[\s-]+/g, "_");
  const intent = OPERATOR_INTENTS.find((candidate) => candidate === normalized);
  if (intent) return intent;
  throw new Error(`Unsupported PBOS operator intent '${value}'.`);
}
