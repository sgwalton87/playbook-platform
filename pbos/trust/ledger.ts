import { artifactDigest } from "../kernel/identity";
import type { TrustRecord } from "./types";

export interface EvidenceLedgerStorage {
  load(): readonly TrustRecord[];
  save(records: readonly TrustRecord[]): void;
}

export class DurableEvidenceLedger {
  constructor(private readonly storage: EvidenceLedgerStorage) {}

  append(record: Omit<TrustRecord, "ledger_sequence" | "record_digest">): TrustRecord {
    const records = this.storage.load();
    if (records.some(({ identity }) => identity.id === record.identity.id)) {
      throw new Error("Evidence ledger rejects identity rewriting.");
    }
    const previous = records.at(-1);
    if (record.previous_record_digest !== (previous?.record_digest ?? null)) {
      throw new Error("Evidence ledger chain is invalid.");
    }
    const body: TrustRecord = {
      ...record,
      ledger_sequence: records.length + 1,
      record_digest: "",
    };
    const value = {
      ...body,
      record_digest: artifactDigest({ ...body, record_digest: undefined }),
    };
    this.storage.save([...records, value]);
    return value;
  }

  verifyIntegrity(): readonly string[] {
    const records = this.storage.load();
    const findings: string[] = [];
    records.forEach((record, index) => {
      if (record.ledger_sequence !== index + 1) {
        findings.push(`Ledger sequence ${index + 1} is invalid.`);
      }
      if (
        record.previous_record_digest !==
        (index === 0 ? null : records[index - 1]?.record_digest)
      ) {
        findings.push(`Ledger chain ${index + 1} is invalid.`);
      }
      if (
        artifactDigest({ ...record, record_digest: undefined }) !==
        record.record_digest
      ) {
        findings.push(`Ledger record ${index + 1} is altered.`);
      }
    });
    return findings;
  }
}
