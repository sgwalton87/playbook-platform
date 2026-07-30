import {
  requireDigest,
  requireIdentifier,
  requireIdentifiers,
  requireTimestamp,
  validateAuthorityEnvelope,
  validateIdentityEnvelope,
} from "../../kernel/contracts";
import { engineActivationDecisionDigest } from "../../kernel/engine-activation";
import {
  scholarRecordDigest,
  scholarRecordEntryDigest,
  scholarRecordMutationDigest,
  scholarRecordRevisionDigest,
} from "./identity";
import type {
  ScholarRecord,
  ScholarRecordMutation,
  ScholarRecordRevision,
} from "./types";

export const SCHOLAR_RECORD_ENGINE_ID = "PBOS-ENGINE-SCHOLAR-RECORD";
export const SCHOLAR_RECORD_CAPABILITY_ID = "CAPABILITY-SCHOLAR-RECORD";

export class ScholarRecordEngine {
  apply(record: ScholarRecord, mutation: ScholarRecordMutation): ScholarRecord {
    const errors: string[] = [
      ...validateIdentityEnvelope(mutation.identity).errors,
      ...validateAuthorityEnvelope(mutation.authority).errors,
    ];
    requireIdentifier(errors, "record.record_id", record.record_id);
    requireIdentifier(
      errors,
      "record.scholar_identity",
      record.scholar_identity
    );
    requireIdentifier(errors, "record.owner_identity", record.owner_identity);
    requireIdentifier(errors, "record.organization_id", record.organization_id);
    requireDigest(errors, "record.digest", record.digest);
    requireIdentifier(errors, "mutation.mutation_id", mutation.mutation_id);
    requireTimestamp(errors, "mutation.timestamp", mutation.timestamp);
    requireDigest(errors, "mutation.digest", mutation.digest);
    requireIdentifier(errors, "entry.entry_id", mutation.entry.entry_id);
    requireIdentifier(errors, "entry.label", mutation.entry.label);
    requireIdentifier(errors, "entry.value", mutation.entry.value);
    requireIdentifier(
      errors,
      "entry.owner_identity",
      mutation.entry.owner_identity
    );
    requireIdentifiers(
      errors,
      "entry.evidence_references",
      mutation.entry.evidence_references
    );
    requireTimestamp(errors, "entry.recorded_at", mutation.entry.recorded_at);
    requireDigest(errors, "entry.digest", mutation.entry.digest);
    if (record.digest !== scholarRecordDigest(record)) {
      errors.push("Scholar Record digest is invalid.");
    }
    if (mutation.digest !== scholarRecordMutationDigest(mutation)) {
      errors.push("Scholar Record mutation digest is invalid.");
    }
    if (mutation.entry.digest !== scholarRecordEntryDigest(mutation.entry)) {
      errors.push("Scholar Record entry digest is invalid.");
    }
    if (
      mutation.activation.decision !== "ACTIVATED" ||
      mutation.activation.engine_id !== SCHOLAR_RECORD_ENGINE_ID ||
      mutation.activation.capability_id !== SCHOLAR_RECORD_CAPABILITY_ID ||
      mutation.activation.authority !== "PBOS-KERNEL-ENGINE-ACTIVATION" ||
      mutation.activation.digest !==
        engineActivationDecisionDigest(mutation.activation)
    ) {
      errors.push("Scholar Record engine is not activated by the Kernel.");
    }
    const actor = mutation.identity.actor;
    if (
      actor.id !== record.scholar_identity ||
      actor.organizationId !== record.organization_id ||
      actor.tenantId !== record.tenant_id ||
      mutation.authority.actorId !== actor.id ||
      mutation.authority.subjectId !== record.record_id ||
      mutation.authority.scope.organizationId !== record.organization_id ||
      mutation.authority.scope.tenantId !== record.tenant_id ||
      !mutation.authority.scope.resourceIds.includes(record.record_id) ||
      !mutation.authority.scope.operations.includes("scholar-record.write")
    ) {
      errors.push("Scholar Record identity or authority scope is invalid.");
    }
    if (
      mutation.record_id !== record.record_id ||
      mutation.expected_revision !== record.revision
    ) {
      errors.push("Scholar Record mutation revision is stale or mismatched.");
    }
    if (
      !mutation.entry.human_confirmed ||
      mutation.entry.evidence_references.length === 0 ||
      mutation.entry.owner_identity !== record.owner_identity
    ) {
      errors.push("Scholar Record facts require human control and evidence.");
    }
    if (errors.length > 0) {
      throw new Error(`Scholar Record mutation blocked: ${errors.join(" ")}`);
    }
    const entries = [
      ...record.entries.filter(
        ({ entry_id: id }) => id !== mutation.entry.entry_id
      ),
      mutation.entry,
    ].sort((left, right) => left.entry_id.localeCompare(right.entry_id));
    const revisionBody: ScholarRecordRevision = {
      revision: record.revision + 1,
      previous_record_digest: record.digest,
      changed_entry_ids: [mutation.entry.entry_id],
      actor_identity: actor.id,
      authority_reference: mutation.authority.id,
      evidence_references: mutation.entry.evidence_references,
      timestamp: mutation.timestamp,
      digest: "",
    };
    const revision = {
      ...revisionBody,
      digest: scholarRecordRevisionDigest(revisionBody),
    };
    const nextBody: ScholarRecord = {
      ...record,
      revision: record.revision + 1,
      entries,
      history: [...record.history, revision],
      updated_at: mutation.timestamp,
      digest: "",
    };
    return { ...nextBody, digest: scholarRecordDigest(nextBody) };
  }
}
