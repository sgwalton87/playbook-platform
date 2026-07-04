import crypto from "crypto";

export function generateShareToken() {
  return crypto.randomBytes(24).toString("hex");
}

export function buildSecureShareId(input: {
  scholarId: string;
  purpose: string;
}) {
  return `${input.purpose}-${input.scholarId}-${generateShareToken()}`;
}

export function isShareExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

export function canAccessSecureShare(input: {
  status: string;
  expiresAt?: string | null;
}) {
  return input.status === "active" && !isShareExpired(input.expiresAt);
}
