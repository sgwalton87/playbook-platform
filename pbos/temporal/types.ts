export interface TemporalIdentity {
  readonly effective_at: string;
  readonly observed_at: string;
  readonly recorded_at: string;
  readonly superseded_at: string | null;
}

export interface HistoricalReference {
  readonly object_id: string;
  readonly version: string;
  readonly digest: string;
  readonly temporal: TemporalIdentity;
}

export interface StateSnapshot<T> {
  readonly id: string;
  readonly subject_id: string;
  readonly state: T;
  readonly temporal: TemporalIdentity;
  readonly previous_snapshot: HistoricalReference | null;
  readonly digest: string;
}

export interface ChangeEvent {
  readonly id: string;
  readonly subject_id: string;
  readonly actor_id: string;
  readonly authority: string;
  readonly from_digest: string | null;
  readonly to_digest: string;
  readonly reason: string;
  readonly evidence_ids: readonly string[];
  readonly temporal: TemporalIdentity;
  readonly digest: string;
}
