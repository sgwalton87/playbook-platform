import type { Achievement } from "./achievement";
import type { Evidence } from "./evidence";
import type { Verification } from "./verification";
import type { Reflection } from "./reflection";
import type { Outcome } from "./outcome";

export interface EvidencePack {
  id: string;
  achievementId: string;
  achievement?: Achievement;

  title: string;
  summary?: string;

  evidence: Evidence[];
  verification?: Verification;
  reflections: Reflection[];
  outcomes: Outcome[];

  createdAt?: string;
  updatedAt?: string;
}
