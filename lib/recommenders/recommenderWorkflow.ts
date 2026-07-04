export type RecommenderRequestStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "in_progress"
  | "submitted"
  | "approved"
  | "revision_requested";

export function buildRecommenderRequest(input: {
  scholarId: string;
  scholarName: string;
  recommenderName: string;
  recommenderEmail: string;
  recommenderRole: "educator" | "mentor" | "coach" | "family" | "employer";
  opportunityName: string;
  evidence: string[];
}) {
  return {
    id: `rec-${input.scholarId}-${input.recommenderEmail.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
    ...input,
    status: "draft" as RecommenderRequestStatus,
    createdAt: new Date().toISOString(),
  };
}

export function updateRecommenderRequestStatus(
  request: ReturnType<typeof buildRecommenderRequest>,
  status: RecommenderRequestStatus
) {
  return {
    ...request,
    status,
    updatedAt: new Date().toISOString(),
  };
}

export function buildRecommenderEmail(input: {
  recommenderName: string;
  scholarName: string;
  opportunityName: string;
  requestUrl: string;
}) {
  return {
    subject: `${input.scholarName} requested a recommendation letter`,
    text: `Hi ${input.recommenderName},

${input.scholarName} requested a recommendation letter for ${input.opportunityName}.

Open the request:
${input.requestUrl}

Playbook includes the scholar's brag sheet and verified evidence to help you write a strong letter.

- Playbook`,
  };
}
