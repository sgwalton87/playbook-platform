export const RECOMMENDER_REQUEST_STORAGE_KEY = "playbook_pending_recommender_request";

export function buildRecommenderLoginPath(requestId: string) {
  return `/login?recommenderRequest=${encodeURIComponent(requestId)}`;
}

export function getRecommenderRedirectPath(requestId?: string | null) {
  if (!requestId) return "/recommenders";
  return `/recommenders/${encodeURIComponent(requestId)}`;
}

export function recommenderEmailMatchesRequest(input: {
  recommenderEmail: string;
  userEmail?: string | null;
}) {
  if (!input.userEmail) return false;
  return input.recommenderEmail.trim().toLowerCase() === input.userEmail.trim().toLowerCase();
}
