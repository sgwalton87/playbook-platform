/**
 * =============================================================================
 * PBOS Kernel Observability
 * =============================================================================
 *
 * Authority:
 *   - PPS-4010 Kernel Observability
 *
 * Purpose:
 *   Records immutable operational evidence for constitutional execution.
 *
 * =============================================================================
 */

export interface Observation {
  readonly timestamp: Date;
  readonly category: string;
  readonly message: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

export interface ObservabilityService {
  record(observation: Observation): Promise<void>;
}

export class InMemoryObservabilityService
  implements ObservabilityService
{
  private readonly observations: Observation[] = [];

  public async record(
    observation: Observation,
  ): Promise<void> {
    this.observations.push(observation);
  }

  public getHistory(): readonly Observation[] {
    return [...this.observations];
  }
}
