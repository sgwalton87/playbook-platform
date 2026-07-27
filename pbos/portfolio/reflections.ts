import { digestValue } from "../context";
import type { PortfolioReflection, ReflectionDraft } from "./contracts";
export function createReflections(drafts: ReflectionDraft[]): PortfolioReflection[] {
  return drafts.map((draft) => { const body = { ...draft, lessonsLearned: [...draft.lessonsLearned].sort(), growthAreas: [...draft.growthAreas].sort(), futureGoals: [...draft.futureGoals].sort(), ownerIdentity: draft.authorIdentity, authoredByPerson: true as const }; return { reflectionId: `PBOS-PORT-REFL-${digestValue(body).slice(0, 16).toUpperCase()}`, ...body }; }).sort((a, b) => a.reflectionId.localeCompare(b.reflectionId));
}
