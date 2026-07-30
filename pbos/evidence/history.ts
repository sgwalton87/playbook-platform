import type { EvidenceRecord } from "./types";

export class EvidenceHistory {
  readonly #records: readonly EvidenceRecord[];

  constructor(records: readonly EvidenceRecord[] = []) {
    this.#records = [...records];
  }

  append(record: EvidenceRecord): EvidenceHistory {
    if (this.#records.some(({ identity }) => identity.id === record.identity.id)) {
      throw new Error("Evidence history rejects identity rewriting.");
    }
    return new EvidenceHistory([...this.#records, record]);
  }

  records(): readonly EvidenceRecord[] {
    return [...this.#records];
  }
}
