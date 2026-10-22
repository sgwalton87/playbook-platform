import { requirePlaybookRole, type PlaybookRole } from "@/lib/roles/registry";

type Input = {
  requestedRole?: string | null;
  profileMode?: string | null;
  profileRole?: string | null;
};

type Result =
  | { ok: true; role: PlaybookRole }
  | { ok: false; durableRole: PlaybookRole };

function validRole(value: string | null | undefined): PlaybookRole | null {
  if (!value?.trim()) return null;
  return requirePlaybookRole(value);
}

/**
 * A URL cannot change an existing account's verified pathway.
 * A newly verified account is allowed to use its selected signup role,
 * but a missing role never silently becomes Scholar in this boundary.
 */
export function resolveOnboardingRoleBinding(input: Input): Result {
  const durable = validRole(input.profileMode) ?? validRole(input.profileRole);
  const requested = validRole(input.requestedRole);
  if (durable && requested && durable !== requested) {
    return { ok: false, durableRole: durable };
  }
  if (durable || requested) return { ok: true, role: (durable ?? requested)! };
  throw new Error("Cannot start onboarding without a verified Playbook pathway.");
}
