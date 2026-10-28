import { validSafetyAnswers, type SafetyAnswers } from "./safeguarding";
import { registryForState } from "./stateRegistries";
export const ENTITY_TYPES = ["LLC", "Corporation", "Nonprofit", "Partnership", "Sole proprietor", "Government", "Other"] as const;
export type BrandRegistration = { formationState: string; entityType: string; entityNumber: string; safetyAnswers: Partial<SafetyAnswers>; safeguardingAccepted: boolean };
export const EMPTY_REGISTRATION: BrandRegistration = { formationState: "", entityType: "", entityNumber: "", safetyAnswers: {}, safeguardingAccepted: false };
export function parseRegistration(value: unknown): BrandRegistration {
 if (!value || typeof value !== "object") throw new Error("Complete the business and safeguarding declarations.");
 const r = value as Record<string, unknown>;
 if (typeof r.formationState !== "string" || !registryForState(r.formationState) || typeof r.entityType !== "string" || !ENTITY_TYPES.includes(r.entityType as typeof ENTITY_TYPES[number]) || typeof r.entityNumber !== "string" || r.entityNumber.length > 80 || !validSafetyAnswers(r.safetyAnswers) || r.safeguardingAccepted !== true) throw new Error("Select your formation state, business structure, each safety declaration and safeguarding acknowledgement.");
 return { formationState: r.formationState, entityType: r.entityType, entityNumber: r.entityNumber.trim(), safetyAnswers: r.safetyAnswers, safeguardingAccepted: true };
}
