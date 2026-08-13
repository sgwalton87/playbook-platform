import type { RelationshipKind } from "@/lib/permissions/rolePermissions";

type ParseResult<TPayload> =
  | {
      ok: true;
      value: TPayload;
    }
  | {
      ok: false;
      error: string;
    };

const VALID_RELATIONSHIPS: ReadonlySet<RelationshipKind> = new Set([
  "scholar",
  "parent_guardian",
  "educator",
  "mentor",
  "district_admin",
  "university_partner",
  "employer_partner",
]);

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function trimString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export type InvitationSendPayload = {
  scholarName: string;
  inviteeName: string;
  inviteeEmail: string;
  relationship: RelationshipKind;
};

export type InvitationAcceptPayload = {
  token: string;
  status: "accepted" | "declined";
};

export function parseInvitationSendPayload(
  raw: unknown
): ParseResult<InvitationSendPayload> {
  if (!isObjectLike(raw)) {
    return { ok: false, error: "Invalid request body." };
  }

  const inviteeEmail = trimString(raw.inviteeEmail);
  const relationship = trimString(raw.relationship);

  if (!inviteeEmail || !inviteeEmail.includes("@")) {
    return { ok: false, error: "inviteeEmail is required." };
  }

  if (!VALID_RELATIONSHIPS.has(relationship as RelationshipKind)) {
    return { ok: false, error: "relationship must be a supported role." };
  }

  return {
    ok: true,
    value: {
      scholarName: trimString(raw.scholarName) || "Scholar",
      inviteeName: trimString(raw.inviteeName) || "Supporter",
      inviteeEmail,
      relationship: relationship as RelationshipKind,
    },
  };
}

export function parseInvitationAcceptPayload(
  raw: unknown
): ParseResult<InvitationAcceptPayload> {
  if (!isObjectLike(raw)) {
    return { ok: false, error: "Invalid request body." };
  }

  const token = trimString(raw.token);
  const statusInput = trimString(raw.status);
  const status = statusInput === "declined" ? "declined" : "accepted";

  if (!token) {
    return { ok: false, error: "Missing invitation token." };
  }

  if (statusInput && statusInput !== "accepted" && statusInput !== "declined") {
    return { ok: false, error: "Invalid invitation status." };
  }

  return {
    ok: true,
    value: { token, status },
  };
}
