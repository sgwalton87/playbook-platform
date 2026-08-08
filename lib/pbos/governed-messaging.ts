import { authorizePlaybookFoundation } from "./foundation";
import { requireApproval } from "@/pbos/generated/security/authority";
import { PlaybookIdentityMapper } from "@/pbos/connector/identity-mapper";
import type { PlaybookRole } from "@/pbos/connector/contracts";

export interface MessagingRelationship {
  id: string; scholarId: string; supporterId?: string | null; supporterEmail: string;
  relationship?: string | null; status: string; permissions: readonly string[];
}

export function supporterRoleForRelationship(value?: string | null): PlaybookRole {
  const relationship = String(value ?? "").trim().toLowerCase();
  if (["parent", "guardian", "family", "relative"].includes(relationship)) return "FAMILY";
  if (["coach", "athletic coach", "sports coach"].includes(relationship)) return "COACH";
  if (["teacher", "educator", "counselor", "school counselor"].includes(relationship)) return "EDUCATOR";
  return "MENTOR";
}

export function authorizeMessagingRelationship(input: { actorId: string; actorEmail?: string | null;
  relationship: MessagingRelationship; approvalId: string }) {
  const relationship = input.relationship;
  const scholar = relationship.scholarId === input.actorId;
  const supporter = relationship.supporterId === input.actorId ||
    Boolean(input.actorEmail && relationship.supporterEmail.toLowerCase() === input.actorEmail.toLowerCase());
  if (relationship.status !== "active" || !relationship.permissions.includes("support_tasks") || (!scholar && !supporter)) {
    throw new Error("Messaging requires an active permission-bearing support relationship.");
  }
  const identity = scholar
    ? authorizePlaybookFoundation({ userId: input.actorId, ownerId: relationship.scholarId,
        role: "SCHOLAR", approvalId: input.approvalId }).identity
    : new PlaybookIdentityMapper().mapSupabaseIdentity(input.actorId, supporterRoleForRelationship(relationship.relationship));
  const approvalId = requireApproval(input.approvalId);
  return { scholarId: relationship.scholarId, role: scholar ? "scholar" : "supporter",
    pbosRole: identity.pbosIdentity.role,
    provenance: [identity.pbosIdentity.provenance, approvalId, "relationship:" + relationship.id, "permission:support_tasks"] };
}

export function normalizeGovernedMessage(body: string): string {
  const normalized = body.replace(/\s+/g, " ").trim();
  if (normalized.length < 1 || normalized.length > 2000) throw new Error("Message must contain 1 to 2000 characters.");
  return normalized;
}

export function messagingAction(action: string): "READ" | "MUTE" | "UNMUTE" | "BLOCK" | "UNBLOCK" | "REPORT" {
  if (!["READ", "MUTE", "UNMUTE", "BLOCK", "UNBLOCK", "REPORT"].includes(action)) {
    throw new Error("Messaging action is not governed.");
  }
  return action as "READ" | "MUTE" | "UNMUTE" | "BLOCK" | "UNBLOCK" | "REPORT";
}
