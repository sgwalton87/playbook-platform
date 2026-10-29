export const SAFEGUARDING_QUESTIONS = [
 { id: "minors", label: "Do you or personnel proposed for this partnership have a legally reportable conviction involving abuse, exploitation or a sexual offense against a minor?" },
 { id: "financial", label: "Do you or personnel proposed for this partnership have a legally reportable conviction involving theft, fraud, embezzlement or financial exploitation relevant to the proposed activities?" },
 { id: "violence", label: "Do you or personnel proposed for this partnership have a legally reportable conviction involving assault, violence or threats relevant to the proposed activities?" },
 { id: "pending", label: "Are you aware of currently pending criminal charges in any of the categories above for yourself or proposed partnership personnel? Pending charges are not convictions." },
 { id: "restrictions", label: "Are you aware of a current court or regulatory restriction that would prevent you or proposed personnel from working with minors, handling partnership funds or conducting the proposed business activity?" },
] as const;
export type SafetyAnswer = "no" | "yes" | "private_review";
export type SafetyAnswers = Record<typeof SAFEGUARDING_QUESTIONS[number]["id"], SafetyAnswer>;
export function validSafetyAnswers(value: unknown): value is SafetyAnswers {
 return Boolean(value && typeof value === "object" && SAFEGUARDING_QUESTIONS.every(q => ["no", "yes", "private_review"].includes(String((value as Record<string, unknown>)[q.id]))));
}
