export function buildRecommendationLetter(input: {
  scholarName: string;
  recommenderName: string;
  recommenderRole: "educator" | "mentor" | "coach" | "family" | "employer";
  opportunityName?: string;
  strengths: string[];
  evidence: string[];
}) {
  return `To Whom It May Concern,

I am honored to recommend ${input.scholarName}${input.opportunityName ? ` for ${input.opportunityName}` : ""}.

As ${input.recommenderRole === "family" ? "a member of their support network" : `${input.scholarName}'s ${input.recommenderRole}`}, I have seen them demonstrate ${input.strengths.join(", ")}.

Specific evidence of their growth includes:
${input.evidence.map((item) => `- ${item}`).join("\n")}

${input.scholarName} brings discipline, resilience, curiosity, and purpose to the opportunities they pursue. I believe they would be a strong candidate and a meaningful contributor.

Sincerely,
${input.recommenderName}`;
}

export function getLetterRequestChecklist() {
  return [
    "Select recommender",
    "Attach verified evidence",
    "Add target opportunity",
    "Share brag sheet",
    "Review draft",
    "Approve final letter",
  ];
}
