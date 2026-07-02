export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export function isVerified(status?: VerificationStatus) {
  return status === "verified";
}
