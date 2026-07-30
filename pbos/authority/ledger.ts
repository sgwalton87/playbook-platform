import { artifactDigest } from "../kernel/identity";
import type {
  ApprovalRecord,
  AuthorityLedgerSnapshot,
  AuthorizationRecord,
  DecisionRecord,
  RevocationRecord,
} from "./types";

function withDigest<T extends { readonly digest: string }>(
  value: Omit<T, "digest">
): T {
  return { ...value, digest: artifactDigest(value) } as T;
}

export class AuthorityLedger {
  readonly #snapshot: AuthorityLedgerSnapshot;

  constructor(snapshot?: Omit<AuthorityLedgerSnapshot, "digest">) {
    const body = snapshot ?? {
      approvals: [],
      decisions: [],
      authorizations: [],
      revocations: [],
    };
    this.#snapshot = { ...body, digest: artifactDigest(body) };
  }

  appendApproval(value: Omit<ApprovalRecord, "digest">): AuthorityLedger {
    if (
      !value.approved_by ||
      value.approved_by === value.requested_by ||
      !value.package_digest ||
      !value.context_digest ||
      value.scope.length === 0 ||
      this.#snapshot.approvals.some(({ approval_id }) => approval_id === value.approval_id)
    ) {
      throw new Error("Authority ledger rejected approval.");
    }
    return this.next({ approvals: [...this.#snapshot.approvals, withDigest<ApprovalRecord>(value)] });
  }

  appendDecision(value: Omit<DecisionRecord, "digest">): AuthorityLedger {
    if (!value.actor_id || value.evidence_ids.length === 0) {
      throw new Error("Authority ledger rejected decision.");
    }
    return this.next({ decisions: [...this.#snapshot.decisions, withDigest<DecisionRecord>(value)] });
  }

  appendAuthorization(value: Omit<AuthorizationRecord, "digest">): AuthorityLedger {
    const approval = this.#snapshot.approvals.find(({ approval_id }) => approval_id === value.approval_id);
    if (
      !approval ||
      approval.decision !== "APPROVED" ||
      approval.package_digest !== value.package_digest ||
      approval.context_digest !== value.context_digest ||
      this.#snapshot.revocations.some(({ authorization_id }) => authorization_id === value.authorization_id)
    ) {
      throw new Error("Authority ledger rejected authorization.");
    }
    return this.next({ authorizations: [...this.#snapshot.authorizations, withDigest<AuthorizationRecord>(value)] });
  }

  appendRevocation(value: Omit<RevocationRecord, "digest">): AuthorityLedger {
    if (
      !value.revoked_by ||
      !value.reason ||
      !this.#snapshot.authorizations.some(({ authorization_id }) => authorization_id === value.authorization_id)
    ) {
      throw new Error("Authority ledger rejected revocation.");
    }
    return this.next({ revocations: [...this.#snapshot.revocations, withDigest<RevocationRecord>(value)] });
  }

  snapshot(): AuthorityLedgerSnapshot {
    return this.#snapshot;
  }

  private next(change: Partial<Omit<AuthorityLedgerSnapshot, "digest">>): AuthorityLedger {
    return new AuthorityLedger({
      approvals: change.approvals ?? this.#snapshot.approvals,
      decisions: change.decisions ?? this.#snapshot.decisions,
      authorizations: change.authorizations ?? this.#snapshot.authorizations,
      revocations: change.revocations ?? this.#snapshot.revocations,
    });
  }
}
